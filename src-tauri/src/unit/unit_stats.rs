use std::cmp::Ordering;

use crate::{
    model::Unit,
    unit::{unit_cal::get_unit_times, DATE_FORMAT},
};
use chrono::{Local, NaiveDate};
use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use ts_rs::TS;

use super::unit_cal::{cmp_unit_time, get_self_budgets, get_unit_budgets};

#[skip_serializing_none]
#[derive(Serialize, TS, Debug)]
#[ts(export, export_to = "../src/bindings/")]
pub struct PaymentSnapShot {
    unit: Unit,
    date: String,
    payment: f32,
    number: i8,
}

#[skip_serializing_none]
#[derive(Serialize, TS, Debug)]
#[ts(export, export_to = "../src/bindings/")]
pub struct PaymentInfo {
    total_payment: f32,
    unit_snapshots: Vec<PaymentSnapShot>,
}

pub fn get_payment(
    units: &Vec<Unit>,
    start_date: Option<NaiveDate>,
    end_date: Option<NaiveDate>,
) -> PaymentInfo {
    let mut unit_snapshots = Vec::<PaymentSnapShot>::new();
    let mut total_payment: i64 = 0;
    for unit in units {
        let unit_times = get_unit_times(unit, start_date, end_date);
        let self_budgets = get_self_budgets(unit);
        for unit_time in unit_times {
            let unit_count = if unit.unit_count < 1 {
                1
            } else {
                unit.unit_count
            };
            let base_payment = unit.budget;
            let mut payment = base_payment * unit_count;

            for self_budget in &self_budgets {
                let date =
                    NaiveDate::parse_from_str(&self_budget.budget_date, DATE_FORMAT).unwrap();
                if cmp_unit_time(&unit_time, &date) == Ordering::Greater {
                    payment += self_budget.budget;
                }
            }
            total_payment += payment as i64;
            // FIXME is there any simple way for NaiveDate to string?
            unit_snapshots.push(PaymentSnapShot {
                unit: unit.clone(),
                date: unit_time
                    .date
                    .and_hms_opt(0, 0, 0)
                    .unwrap()
                    .and_local_timezone(Local::now().timezone())
                    .unwrap()
                    .to_rfc3339_opts(chrono::SecondsFormat::Millis, false),
                payment: payment as f32,
                number: unit_time.num as i8,
            });
        }
    }

    unit_snapshots.sort_by(|a, b| a.date.cmp(&b.date));

    PaymentInfo {
        total_payment: total_payment as f32,
        unit_snapshots,
    }
}

#[skip_serializing_none]
#[derive(Serialize, TS, Debug)]
#[ts(export, export_to = "../src/bindings/")]
pub struct LeftIncomeSnapShot {
    unit: Unit,
    first_date: String,
    last_budget_date: String,
    amount: f32,
    number: i8,
}

#[skip_serializing_none]
#[derive(Serialize, TS, Debug)]
#[ts(export, export_to = "../src/bindings/")]
pub struct LeftIncomeInfo {
    total_income: f32,
    unit_snapshots: Vec<LeftIncomeSnapShot>,
}

pub fn get_left_income(
    units: &Vec<Unit>,
    start_date: Option<NaiveDate>,
    end_date: Option<NaiveDate>,
) -> LeftIncomeInfo {
    let mut unit_snapshots = Vec::<LeftIncomeSnapShot>::new();
    let mut total_income = 0;
    let today = Local::now().date_naive();
    for unit in units {
        let unit_times = get_unit_times(unit, start_date, end_date);
        let last_budget_date = unit_times[unit_times.len() - 1].date;
        if let Some(sdate) = start_date {
            if sdate > last_budget_date {
                continue;
            }
        }

        if let Some(edate) = end_date {
            if edate < last_budget_date {
                continue;
            }
        }
        let self_budgets = get_self_budgets(unit);
        let left_count = unit.unit_count - (self_budgets.len() as i16);
        if left_count == 0 {
            continue;
        }
        let amount = left_count as i64 * unit.amount.unwrap();
        total_income += amount;

        let mut number: i8 = -1;
        for i in 0..unit_times.len() {
            let unit_time = &unit_times[i];
            if cmp_unit_time(unit_time, &today) != Ordering::Greater
                && (i == unit_times.len() - 1
                    || cmp_unit_time(&unit_times[i + 1], &today) == Ordering::Greater)
            {
                number = unit_time.num as i8;
            }
        }
        unit_snapshots.push(LeftIncomeSnapShot {
            unit: unit.clone(),
            first_date: unit_times[0]
                .date
                .and_hms_opt(0, 0, 0)
                .unwrap()
                .and_local_timezone(Local::now().timezone())
                .unwrap()
                .to_rfc3339_opts(chrono::SecondsFormat::Millis, false),
            last_budget_date: last_budget_date
                .and_hms_opt(0, 0, 0)
                .unwrap()
                .and_local_timezone(Local::now().timezone())
                .unwrap()
                .to_rfc3339_opts(chrono::SecondsFormat::Millis, false),
            amount: amount as f32,
            number,
        });
    }

    LeftIncomeInfo {
        total_income: total_income as f32,
        unit_snapshots,
    }
}

#[skip_serializing_none]
#[derive(Serialize, TS, Debug)]
#[ts(export, export_to = "../src/bindings/")]
pub struct DueDateSnapShot {
    unit: Unit,
    last_budget_date: String,
}

#[skip_serializing_none]
#[derive(Serialize, TS, Debug)]
#[ts(export, export_to = "../src/bindings/")]
pub struct DueDateInfo {
    unit_snapshots: Vec<DueDateSnapShot>,
}

pub fn get_due_date_unit(
    units: &Vec<Unit>,
    start_date: Option<NaiveDate>,
    end_date: Option<NaiveDate>,
) -> DueDateInfo {
    let mut unit_snapshots = Vec::<DueDateSnapShot>::new();
    for unit in units {
        let unit_times = get_unit_times(unit, start_date, end_date);
        let last_budget_date = unit_times[unit_times.len() - 1].date;
        if let Some(sdate) = start_date {
            if sdate > last_budget_date {
                continue;
            }
        }

        if let Some(edate) = end_date {
            if edate < last_budget_date {
                continue;
            }
        }

        unit_snapshots.push(DueDateSnapShot {
            unit: unit.clone(),
            last_budget_date: last_budget_date
                .and_hms_opt(0, 0, 0)
                .unwrap()
                .and_local_timezone(Local::now().timezone())
                .unwrap()
                .to_rfc3339_opts(chrono::SecondsFormat::Millis, false),
        });
    }

    DueDateInfo { unit_snapshots }
}

#[skip_serializing_none]
#[derive(Serialize, TS, Debug, Deserialize)]
#[ts(export, export_to = "../src/bindings/")]
pub struct InterestSnapShot {
    unit: Unit,
    date: String,
    number: u8,
    budget: f32,
    current_interest: f32,
    interests: Vec<Option<f32>>,
}

#[skip_serializing_none]
#[derive(Serialize, TS, Debug, Deserialize)]
#[ts(export, export_to = "../src/bindings/")]
pub struct InterestInfo {
    total_interests: f32,
    unit_snapshots: Vec<InterestSnapShot>,
}

pub fn get_interest(
    units: &Vec<Unit>,
    start_date: Option<NaiveDate>,
    end_date: Option<NaiveDate>,
) -> InterestInfo {
    let mut unit_snapshots: Vec<InterestSnapShot> = Vec::new();
    let mut total_interests: f32 = 0.0;
    for unit in units {
        let unit_budgets = get_unit_budgets(unit, start_date, end_date);
        let self_budgets = get_self_budgets(unit);
        for unit_budget in unit_budgets {
            let unit_count = if unit.unit_count <= 0 {
                1
            } else {
                unit.unit_count
            };

            let mut interests_arr = Vec::<Option<f32>>::with_capacity(unit_count as usize);
            for i in 0..unit_count {
                interests_arr[i as usize] = unit_budget.last_budget;
            }

            for i in 0..self_budgets.len() {
                let self_budget = &self_budgets[i];
                let date =
                    NaiveDate::parse_from_str(&self_budget.budget_date, DATE_FORMAT).unwrap();
                if cmp_unit_time(&unit_budget, &date) != Ordering::Less {
                    interests_arr[i] = Some(self_budget.budget as f32 * -1_f32);
                }
            }

            let interest: f32 = interests_arr
                .iter()
                .copied()
                .reduce(|a, b| {
                    let mut sum: f32 = 0.0;
                    if let Some(c) = a {
                        sum += c;
                    }
                    if let Some(d) = b {
                        sum += d;
                    }
                    Some(sum)
                })
                .unwrap()
                .unwrap();

            total_interests += interest;
            unit_snapshots.push(InterestSnapShot {
                unit: unit.clone(),
                date: unit_budget
                    .date
                    .and_hms_opt(0, 0, 0)
                    .unwrap()
                    .and_local_timezone(Local::now().timezone())
                    .unwrap()
                    .to_rfc3339_opts(chrono::SecondsFormat::Millis, false),
                number: unit_budget.num,
                budget: unit_budget.budget.unwrap(),
                current_interest: interest,
                interests: interests_arr,
            });
        }
    }

    unit_snapshots.sort_by(|a, b| a.date.cmp(&b.date));

    InterestInfo {
        total_interests,
        unit_snapshots,
    }
}
