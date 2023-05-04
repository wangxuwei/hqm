import { Moment } from "moment";
import { getUnitsData } from "./data-unit";
import { getPayment, getInterest, getLeftIncome, getDueDateUnits } from "./unit-stats";

export async function getPaymentInPeriod(startDate?: Moment, endDate?: Moment) {
	const units = await getUnitsData();
	return getPayment(units, startDate, endDate);
}

export async function getValidLeftIncome(startDate?: Moment, endDate?: Moment) {
	const units = await getUnitsData();
	return getLeftIncome(units, startDate, endDate);
}

export async function getDueDateUnitsInPeroid(startDate?: Moment, endDate?: Moment) {
	const units = await getUnitsData();
	return getDueDateUnits(units, startDate, endDate);
}

export async function getInterestInPeriod(startDate?: Moment, endDate?: Moment) {
	const units = await getUnitsData();
	return getInterest(units, startDate, endDate);
}