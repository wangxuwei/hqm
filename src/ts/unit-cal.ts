import { Moment } from "moment";
import { Unit } from '../bindings';
import { mom } from "./utils-date";
import { leapMonths, lunar2solar, solar2lunar } from "./utils-lunar";

interface UnitTime {
	date: Moment;
	num: number;
	budget?: number;
	lastBudget?: number;
}

// 标会的最小间隔时间，有可能是无效的
interface DateInfo {
	year: number;
	month: number;
	day: number;
	// 公历没有闰月
	leap?: boolean;
}

export function getNumByDateTime(unit: Unit, date: Moment) {
	const unitTimes = getUnitTimes(unit);
	for (const unitTime of unitTimes) {
		if (compareUnitTime(unitTime, date) == 0) {
			return unitTime.num;
		}
	}
	return -1;
}

export function compareUnitTime(unitTime: UnitTime, date: Moment) {
	const format = "YYYY-MM-DD";
	if (date.format(format) == unitTime.date.format(format)) {
		return 0;
	} else {
		return unitTime.date.isBefore(date) ? -1 : 1;
	}
}

export function getSelfBugdets(unit: Unit) {
	const unitBudgets = unit.unitBudgets;
	const selfBudgets = [];
	for (const unitBudget of unitBudgets) {
		if (unitBudget.isSelf) {
			selfBudgets.push(unitBudget);
		}
	}
	return selfBudgets;
}

export function getUnitTimes(unit: Unit, startDate?: Moment, endDate?: Moment): UnitTime[] {
	const dates: Moment[] = getAllDates(unit);
	const unitTimes: UnitTime[] = [];
	for (let i = 0; i < dates.length; i++) {
		const m = dates[i];
		let pass = true;
		if (startDate && startDate.isAfter(m)) {
			pass = false;
		}

		if (endDate && endDate.isBefore(m)) {
			pass = false;
		}

		if (pass) {
			unitTimes.push({
				date: m,
				num: i + 1
			});
		}
	}
	return unitTimes;
}

export function getUnitBudgets(unit: Unit, startDate?: Moment, endDate?: Moment): UnitTime[] {
	const dates: Moment[] = getAllDates(unit);
	const budgets: number[] = getAllBudgets(unit);
	const unitTimes: UnitTime[] = [];
	for (let i = 0; i < dates.length; i++) {
		const m = dates[i];
		let pass = true;
		if (startDate && startDate.isAfter(m)) {
			pass = false;
		}

		if (endDate && endDate.isBefore(m)) {
			pass = false;
		}

		if (pass) {
			const unitTime = {
				date: m,
				num: i + 1,
				budget: budgets[i],
				lastBudget: 0
			}
			if (i > 1) {
				unitTime.lastBudget = budgets[i - 1];
			}
			unitTimes.push(unitTime);
		}
	}
	return unitTimes;
}

export function getAllDates(unit: Unit): Moment[] {
	const date = unit.lastBiddedDate;

	// 更新记录时间如果不存在，直接用bidDate, 但是biddedCount要是1
	const prevDates = nextAllDates(unit, false);
	const nextDates = nextAllDates(unit, true);
	return [...prevDates.reverse(), date, ...nextDates];
}


export function getAllBudgets(unit: Unit): number[] {
	const markBudgets = unit.unitBudgets || [];
	const budgets = new Array(unit.count);

	for (const markBugdet of markBudgets) {
		const num = getNumByDateTime(unit, markBugdet.budgetDate);
		budgets[num - 1] = markBugdet.budget;
	}

	// 第一次会头，不算
	budgets[0] = 0;
	// 填充输入的
	for (let i = 2; i < unit.count; i++) {
		if (!budgets[i - 1]) {
			const budget = unit.budget * (i < (unit.count * .7) ? .35 : .15);
			budgets[i - 1] = budget;
		}
	}
	// 最后一次会，没有budget
	budgets[unit.count - 1] = 0;

	return budgets;
}

// 递归时间往前/后推算, unit 的lastBiddedDate的时间如果有加标的会必须是加标时间
function nextAllDates(unit: Unit, next: boolean): Moment[] {
	let nextDates: Moment[] = [];
	const date = unit.lastBiddedDate;
	const dateInfo = toDateInfo(date, unit.isLunar);
	// 要计算会的支数
	const needCount = next ? unit.count - unit.biddedCount : unit.biddedCount - 1;
	// 看计算，是向前还是向后
	const dir = next ? 1 : -1;
	// 分加标和不加标两种情况， 
	// 目前只支持正标和加标在同一个月， 不确定能不能支持不在同一个月的
	if (unit.plusCycle) {
		// 先算总共需要几个周期， 一个周期就是正标n个 + 加标一次
		const unitCycleMonths = unit.cycle + unit.plusCycle;
		// 总共周期次数
		const cycles = Math.ceil(unit.count / unitCycleMonths) + 1;
		// 上次一个加标日期
		let lastPlusDateInfo = next ? { year: dateInfo.year, month: dateInfo.month - unit.plusCycle, day: unit.plusDay } : { year: dateInfo.year, month: dateInfo.month + unit.plusCycle, day: unit.plusDay };
		// 周期次数
		let i = 1;
		while (i <= cycles) {
			//先算加标会的时间
			const nextPlusDateInfo = { year: lastPlusDateInfo.year, month: lastPlusDateInfo.month + dir * unit.plusCycle, day: unit.plusDay };
			// 每个周期内正标次数
			const standardCount = unit.plusCycle / unit.cycle;
			let k = 1;
			while (k <= standardCount) {
				// 考虑加标当月有正标
				let curMonCount = unit.plusDay - unit.day ? 0 : -1;
				if (!next) {
					curMonCount = unit.plusDay - unit.day ? -1 : 0;
				}
				// 有的月份在当月, 往下算正标在后的和往上算正标在前的，都是在当月
				const deltaMonth = k + curMonCount;
				const nextDateInfo = { year: lastPlusDateInfo.year, month: lastPlusDateInfo.month + dir * deltaMonth * unit.cycle, day: unit.day };
				nextDates.push(backToMoment(nextDateInfo, unit.isLunar));
				// 同周期内加一个
				k++;
			}

			// 计算闰月是否要标, 只有一个月标一次才有可能，其他都不标
			if (unit.isLunar && unit.cycle == 1) {
				const months = leapMonths(lastPlusDateInfo, nextPlusDateInfo);
				if (months.length > 0) {
					// 这样计算，就算有闰月也只有一次
					const m = months[0];
					const nextDateInfo = { ...m, leap: true, day: unit.day };
					// 有就加一个
					nextDates.push(backToMoment(nextDateInfo, unit.isLunar));
				}
			}

			// 加入加标日期
			nextDates.push(backToMoment(nextPlusDateInfo, unit.isLunar));

			i++;
			lastPlusDateInfo = nextPlusDateInfo;
		}
	} else {
		// 不是加标的情况
		let lastDateInfo = dateInfo;
		// i 表示每次会
		let i = 1;
		while (i <= needCount) {
			const nextDateInfo = { year: lastDateInfo.year, month: lastDateInfo.month + dir * unit.cycle, day: unit.day };
			nextDates.push(backToMoment(nextDateInfo, unit.isLunar));

			// 计算闰月是否要标, 只有一个月标一次才有可能，其他都不标
			if (unit.isLunar && unit.cycle == 1) {
				const months = leapMonths(lastDateInfo, nextDateInfo);
				if (months.length > 0) {
					// 这样计算，就算有闰月也只有一次
					const m = months[0];
					const nextDateInfo = { ...m, leap: true, day: unit.day };
					// 有就加一个
					nextDates.push(backToMoment(nextDateInfo, unit.isLunar));
				}
			}
			i++;
			lastDateInfo = nextDateInfo;
		}
	}

	// 排下序得到结果
	nextDates.sort((d1: Moment, d2: Moment) => {
		return d1.isAfter(d2) ? dir * 1 : dir * -1;
	});

	// 取消不符合当前时间的
	const d = date;
	nextDates = nextDates.filter((d1: Moment) => {
		return next ? d.isBefore(d1) : d.isAfter(d1);
	});

	// 截断超过总会数的
	nextDates = nextDates.slice(0, needCount);

	return nextDates;
}

export function toDateInfo(date: Moment, isLunar: boolean): DateInfo {
	let dateInfo: DateInfo;
	if (isLunar) {
		dateInfo = solar2lunar(date);
	} else {
		dateInfo = {
			year: date.year(),
			month: date.month(),
			day: date.date()
		}
	}
	return dateInfo;
}

function backToMoment(dateInfo: DateInfo, isLunar: boolean): Moment {
	return isLunar ? lunar2solar(dateInfo) : mom(new Date(dateInfo.year, dateInfo.month, dateInfo.day));
}