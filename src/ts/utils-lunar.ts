import { LunarMonth, Solar } from 'lunar-typescript';
import { Moment } from 'moment';

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
 */
export function solar2lunar(solarDate: Date | Moment): Lunar {
	const solar = Solar.fromDate(solarDate instanceof Date ? solarDate : solarDate.toDate());
	const lunar = solar.getLunar();
	const lm = LunarMonth.fromYm(lunar.getYear(), lunar.getMonth())!;
	return {
		year: lunar.getYear(),
		month: lunar.getMonth(),
		day: lunar.getDay(),
		leap: lm.isLeap()
	}
}

export function formatLunarDate(solarDate: Moment | Date, format?: string): string {
	const solar = Solar.fromDate(solarDate instanceof Date ? solarDate : solarDate.toDate());
	format = format || "TAYyMmdD";
	const lunar = solar.getLunar();
	const val = format.replace(/[TAYyMmdD]/g, function (m, i) {
		switch (m) {
			//获取传统的年
			case "T": return lunar.getYearInGanZhiExact();
			//获取生肖
			case "A": return lunar.getShengxiao();
			//获取中文的年
			case "Y": return lunar.getYearInChinese();
			//获取数字年
			case "y": return lunar.getYearInChinese();
			//获取月份
			case "m": return lunar.getMonthInChinese() + "月";
			//获取传统的月
			case "M": return lunar.getMonthInChinese() + "月";
			//获取天
			case "d":
			case "D": return lunar.getDayInChinese();
		}
		return "";
	});
	return val;
}