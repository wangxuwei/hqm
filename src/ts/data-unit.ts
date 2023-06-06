import moment from 'moment';
import { Unit } from './entity-types';
import { webGet } from './web-request';

const DATA_PATH = "/data";
export async function getUnitsData() {
	const jsonData = await webGet(`${DATA_PATH}/data.json`);
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