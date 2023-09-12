import { isNotEmpty } from 'utils-min';



export function qsParse(paramsStr: string) {
	const params = paramsStr.split("&");
	const ps: { [name: string]: any } = {};
	if (isNotEmpty(params)) {
		for (const pair of params) {
			if (pair) {
				const [key, value] = pair.split("=");
				ps[key] = value;
			}
		}
	}
	return ps;
}


export function qsStringify(params: { [name: string]: any }) {
	const us = new URLSearchParams();
	if (params) {
		for (const key in params) {
			us.set(key, params[key]);
		}
		return us.toString();
	}
	return '';
}

export function qsRepleceParam(paramsStr: string, param: string, newValue: string) {
	const params = paramsStr.split("&");
	const ps: string[] = [];
	if (isNotEmpty(params)) {
		for (const pair of params) {
			if (pair.indexOf(param) > -1) {
				const key = pair.split("=")[0];
				const value = key + '=' + newValue
				ps.push(value)
			} else {
				ps.push(pair)
			}
		}
	}
	return ps.join("&");
}