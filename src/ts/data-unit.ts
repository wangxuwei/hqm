import moment from 'moment';
import { ajaxGet } from './ajax';
import { Unit } from './entity-types';

const DATA_PATH = "/data";
export async function getUnitsData() {
	const jsonData = await ajaxGet(`${DATA_PATH}/data.json`);
	return parseUnits(jsonData);
}

export function parseUnits(objJsonArray: any[]): Unit[] {
	const result: Unit[] = [];
	const format = "YYYY-MM-DD HH:mm:ss";
	for (const obj of objJsonArray) {
		const unit = <Unit>{ ...obj };
		unit.lastBiddedDate = moment(obj.lastBiddedDate, format);
		result.push(unit);
		if (unit.unitBudgets) {
			for (const unitBudget of unit.unitBudgets) {
				unitBudget.budgetDate = moment(unitBudget.budgetDate, format);
			}
		}
	}
	return result;
}