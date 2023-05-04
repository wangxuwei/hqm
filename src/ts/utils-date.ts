import moment, { Moment } from "moment";
import { formatLunarDate, solar2lunar } from "./utils-lunar";


export function formatDate(val: Moment | Date, format?: string) {
	format = format || "YYYY-MM-DD";
	return mom(val).format(format);
}

export function formatTime(val: Moment | Date, format?: string) {
	format = format || "HH:mm:ss";
	return mom(val).format(format);
}

export function formatDateTime(val: Moment | Date, format?: string) {
	format = format || "YYYY-MM-DD HH:mm:ss";
	return mom(val).format(format);
}

export function formatToLunar(val: Moment | Date, format?: string) {
	format = format || "MD";
	const lunar: any = solar2lunar(val);
	return formatLunarDate(lunar, format);
}

export function mom(val: any, format?: string): Moment {
	if (val instanceof Date) {
		return moment(val);
	}
	format = format || "YYYY-MM-DD";
	return moment(val, format);
}

export function now(): Moment {
	return moment();
}