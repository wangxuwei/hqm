import lunar from 'chinese-lunar';
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
	return lunar.solarToLunar(solarDate instanceof Date ? solarDate : solarDate.toDate());
}

export function formatLunarDate(lunarDate: any, format: string): string {
	return lunar.format(lunarDate, format);
}