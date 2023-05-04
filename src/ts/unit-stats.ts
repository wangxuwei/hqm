import { Moment } from "moment";
import { Unit } from "./entity-types";
import { compareUnitTime, getSelfBugdets, getUnitBudgets, getUnitTimes } from "./unit-cal";
import { now } from "./utils-date";

export interface UnitSnapShot {
	number: number;
	unit: Unit;
	date: Moment;
	income: number;
}

export async function getPayment(units: Unit[], startDate?: Moment, endDate?: Moment) {
	const unitSnapshots: any[] = [];
	let totalPayment = 0;
	for (const unit of units) {
		const unitTimes = getUnitTimes(unit, startDate, endDate);
		const selfBudgets = getSelfBugdets(unit);
		for (const unitTime of unitTimes) {
			const unitCount = unit.unitCount || 1;
			const basePayment = unit.budget;
			let payment = basePayment * unitCount;

			for (const selfBudget of selfBudgets) {
				if (compareUnitTime(unitTime, selfBudget.budgetDate) > 0) {
					payment += selfBudget.budget;
				}
			}
			totalPayment += payment;
			unitSnapshots.push({
				unit,
				date: unitTime.date,
				payment,
				number: unitTime.num
			});
		}
	}

	unitSnapshots.sort((a: any, b: any) => {
		return a.date.isAfter(b.date) ? 1 : -1;
	});
	return {
		totalPayment,
		unitSnapshots
	}
}

export async function getLeftIncome(units: Unit[], startDate?: Moment, endDate?: Moment) {
	const unitSnapshots: any[] = [];
	let totalIncome = 0;
	const today = now();
	for (const unit of units) {
		const unitTimes = getUnitTimes(unit);
		const lastBudgetDate = unitTimes[unitTimes.length - 1].date;
		if (startDate && startDate.isAfter(lastBudgetDate)) {
			continue;
		}
		if (endDate && endDate.isBefore(lastBudgetDate)) {
			continue;
		}
		const selfBudgets = getSelfBugdets(unit);
		const leftCount = (unit.unitCount - selfBudgets.length);
		if (leftCount == 0) {
			continue;
		}
		let amount = leftCount * unit.amount;
		totalIncome += amount;

		let number = -1;
		for (let i = 0; i < unitTimes.length; i++) {
			const unitTime = unitTimes[i];
			if (compareUnitTime(unitTime, today) <= 0 && (i == unitTimes.length - 1 || compareUnitTime(unitTimes[i + 1], today) > 0)) {
				number = unitTime.num;
			}
		}
		unitSnapshots.push({
			unit,
			firstDate: unitTimes[0].date,
			lastBudgetDate,
			amount,
			number
		});

	}

	return {
		totalIncome,
		unitSnapshots
	};
}


export async function getDueDateUnits(units: Unit[], startDate?: Moment, endDate?: Moment) {
	const unitSnapshots: any[] = [];
	for (const unit of units) {
		const unitTimes = getUnitTimes(unit);
		const lastBudgetDate = unitTimes[unitTimes.length - 1].date;
		if (startDate && startDate.isAfter(lastBudgetDate)) {
			continue;
		}
		if (endDate && endDate.isBefore(lastBudgetDate)) {
			continue;
		}
		unitSnapshots.push({
			unit,
			lastBudgetDate
		});

	}

	return {
		unitSnapshots
	};
}


export async function getInterest(units: Unit[], startDate?: Moment, endDate?: Moment) {
	const unitSnapshots: any[] = [];
	let totalInterests = 0;
	for (const unit of units) {
		const unitBudgets = getUnitBudgets(unit, startDate, endDate);
		const selfBudgets = getSelfBugdets(unit);
		for (const unitBudget of unitBudgets) {
			const unitCount = unit.unitCount || 1;
			let interest = 0;
			const interestsArr = [];
			for (let i = 0; i < unitCount; i++) {
				interestsArr[i] = unitBudget.lastBudget!;
			}

			for (let i = 0; i < selfBudgets.length; i++) {
				const selfBudget = selfBudgets[i];
				if (compareUnitTime(unitBudget, selfBudget.budgetDate) > 0) {
					interestsArr[i] = selfBudget.budget * -1;
				}
			}

			interest = interestsArr.reduce((a, b) => {
				return a + b;
			});
			totalInterests += interest;
			unitSnapshots.push({
				unit,
				date: unitBudget.date,
				number: unitBudget.num,
				budget: unitBudget.budget,
				currentInterest: interest,
				interests: interestsArr
			});
		}
	}
	unitSnapshots.sort((a: any, b: any) => {
		return a.date.isAfter(b.date) ? 1 : -1;
	});
	return {
		totalInterests,
		unitSnapshots
	}
}
