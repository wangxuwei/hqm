import lunar from 'chinese-lunar';
import moment, { Moment } from 'moment';

export interface Lunar {
	year: number;
	month: number; // month value should be 1 - 12
	day: number;
	leap?: boolean;
}

/**
 * 
 * @param year 
 * @param month month value should be 1 - 12
 * @param day 
 * @param leap optional
 */

export function lunar2solar(lunarDate: Lunar): Moment {
	lunarDate = verifyLunarDate(lunarDate);
	const d = lunar.lunarToSolar(lunarDate);
	return moment(d);
}

/**
 * 
 * @param year 
 * @param month month value should be 1 - 12
 * @param day 
 */
export function solar2lunar(solarDate: Date | Moment): Lunar {
	return lunar.solarToLunar(solarDate instanceof Date ? solarDate : solarDate.toDate());
}

export function formatLunarDate(lunarDate: any, format: string): string {
	return lunar.format(lunarDate, format);
}

// num 可以负数
export function lunarMonthAdd(lunarDate: Lunar, num: number): Lunar {
	let currentLunar = verifyLunarDate({ ...lunarDate });
	while (num != 0) {
		const sign = num > 0 ? 1 : -1;
		num -= sign;

		if (sign < 0) {
			if (currentLunar.leap) {
				currentLunar.leap = false;
				continue;
			}
		} else {
			const leapMonth = lunar.leapMonthOfYear(currentLunar.year);
			if (leapMonth == currentLunar.month && !currentLunar.leap) {
				currentLunar.leap = true;
				continue;
			}
		}

		currentLunar.month += sign;
		currentLunar = verifyLunarDate(currentLunar);
		if (sign < 0) {
			const leapMonth = lunar.leapMonthOfYear(currentLunar.year);
			if (leapMonth == currentLunar.month) {
				currentLunar.leap = true;
			} else {
				// leap 有可能上次一次预留下来的值
				currentLunar.leap = false;
			}
		} else {
			// leap 有可能上次一次预留下来的值
			currentLunar.leap = false;
		}
	}
	return verifyLunarDate(currentLunar);
}

export function leapCount(lunar1: Lunar, lunar2: Lunar): number {
	const months = leapMonths(lunar1, lunar2);
	return months.length;
}

export function leapMonths(lunar1: Lunar, lunar2: Lunar): any {
	const m1 = lunar2solar(lunar1);
	const m2 = lunar2solar(lunar2);
	let start, end;
	if (m1.isBefore(m2)) {
		start = m1;
		end = m2;
	} else {
		start = m2;
		end = m1;
	}
	const leapMonths = [];
	while (end.isAfter(start)) {
		const l = solar2lunar(start);
		if (l.leap) {
			leapMonths.push({ year: l.year, month: l.month });
		}
		start = lunar2solar(lunarMonthAdd(l, 1));
	}
	return leapMonths;
}

export function verifyLunarDate(date: Lunar) {
	const lunarDate = { ...date };
	if (lunarDate.month <= 0) {
		const delta = 1 - lunarDate.month;
		lunarDate.year -= Math.ceil(delta * 1.0 / 12);
		lunarDate.month = 12 - (-1 * lunarDate.month % 12);
	} else if (lunarDate.month > 12) {
		const delta = lunarDate.month - 12;
		lunarDate.year += Math.ceil(delta * 1.0 / 12);
		lunarDate.month = delta % 12;
	}
	if (lunarDate.month == 0) {
		lunarDate.month = 12;
	}
	return lunarDate;
}