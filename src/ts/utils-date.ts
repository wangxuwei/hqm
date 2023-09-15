import dayjs, { Dayjs } from "dayjs";


export function formatDate(val: Dayjs | Date, format?: string) {
	format = format || "YYYY-MM-DD";
	return dayjs(val).format(format);
}

export function formatTime(val: Dayjs | Date, format?: string) {
	format = format || "HH:mm:ss";
	return dayjs(val).format(format);
}

export function formatDateTime(val: Dayjs | Date, format?: string) {
	format = format || "YYYY-MM-DD HH:mm:ss";
	return dayjs(val).format(format);
}

export function date(val: any, format?: string): Dayjs {
	if (val instanceof Date) {
		return dayjs(val);
	}
	return dayjs(val, format);
}

export function now(): Dayjs {
	return dayjs();
}

export function toRFCString(v: Dayjs): string {
	return v.format("YYYY-MM-DDTHH:mm:ss.SSSZZ");
}