use super::utils_lunar::{leap_months, lunar2solar, solar2lunar, Lunar};
use crate::model::{Unit, UnitBudget};
use chrono::{DateTime, Datelike, Local, NaiveDate};
use serde::{Deserialize, Serialize};
use std::cmp::Ordering;
use std::str::FromStr;
use ts_rs::TS;

#[derive(Clone, TS, Serialize, Deserialize)]
#[ts(export, export_to = "../src/bindings/")]
pub struct UnitTime {
    #[ts(type = "string")]
    pub date: NaiveDate,
    pub num: u8,
    pub budget: Option<f32>,
    pub last_budget: Option<f32>,
}

// 标会的最小间隔时间，有可能是无效的
#[derive(Clone)]
struct DateInfo {
    year: i16,
    month: i8,
    day: i8,
    // 公历没有闰月
    leap: Option<bool>,
}

impl From<&Lunar> for DateInfo {
    fn from(l: &Lunar) -> Self {
        Self {
            year: l.year,
            month: l.month,
            day: l.day,
            leap: Some(l.leap),
        }
    }
}

impl From<&DateInfo> for Lunar {
    fn from(date_info: &DateInfo) -> Self {
        Lunar {
            year: date_info.year,
            month: date_info.month,
            day: date_info.day,
            leap: date_info.leap.unwrap_or(false),
        }
    }
}

impl From<&DateInfo> for NaiveDate {
    fn from(date_info: &DateInfo) -> Self {
        NaiveDate::from_ymd_opt(
            date_info.year as i32,
            date_info.month as u32,
            date_info.day as u32,
        )
        .unwrap()
    }
}

pub fn num_by_date_time(unit: &Unit, date: &NaiveDate) -> isize {
    let unit_times = get_unit_times(unit, None, None);
    for unit_time in unit_times {
        if let Ordering::Equal = cmp_unit_time(&unit_time, date) {
            return unit_time.num as isize;
        }
    }
    -1
}

pub fn cmp_unit_time(unit_time: &UnitTime, date: &NaiveDate) -> Ordering {
    unit_time.date.cmp(date)
}

pub fn get_self_budgets(unit: &Unit) -> Vec<UnitBudget> {
    let mut self_budgets = Vec::new();
    let uc = unit.clone();
    if let Some(unit_budgets) = uc.unit_budgets {
        for ub in unit_budgets.into_iter().flatten() {
            if ub.is_self {
                self_budgets.push(ub);
            }
        }
    }
    self_budgets
}

pub fn get_unit_times(
    unit: &Unit,
    start_date: Option<NaiveDate>,
    end_date: Option<NaiveDate>,
) -> Vec<UnitTime> {
    let dates: Vec<NaiveDate> = get_all_dates(unit);
    let mut unit_times: Vec<UnitTime> = Vec::new();
    for (i, m) in dates.iter().enumerate() {
        let mut pass = true;
        let v = *m;
        if let Some(s_date) = start_date {
            if s_date > v {
                pass = false;
            }
        }
        if let Some(e_date) = end_date {
            if e_date < v {
                pass = false;
            }
        }

        if pass {
            unit_times.push(UnitTime {
                date: v,
                num: (i + 1) as u8,
                budget: None,
                last_budget: None,
            });
        }
    }
    unit_times
}

pub fn get_unit_budgets(
    unit: &Unit,
    start_date: Option<NaiveDate>,
    end_date: Option<NaiveDate>,
) -> Vec<UnitTime> {
    let dates: Vec<NaiveDate> = get_all_dates(unit);
    let budgets: Vec<Option<f32>> = get_all_budgets(unit);
    let mut unit_times: Vec<UnitTime> = Vec::new();

    for i in 0..dates.len() {
        let m = dates[i];
        let mut pass = true;
        if let Some(s_date) = start_date {
            if s_date > m {
                pass = false;
            }
        }
        if let Some(e_date) = end_date {
            if e_date < m {
                pass = false;
            }
        }

        if pass {
            let mut unit_time = UnitTime {
                date: m,
                num: (i + 1) as u8,
                budget: budgets[i],
                last_budget: Some(0.0),
            };
            if i > 1 {
                unit_time.last_budget = budgets[i - 1];
            }
            unit_times.push(unit_time);
        }
    }
    unit_times
}

pub fn get_all_dates(unit: &Unit) -> Vec<NaiveDate> {
    let date = DateTime::<Local>::from_str(unit.last_bidded_date.as_str())
        .unwrap()
        .date_naive();

    // 更新记录时间如果不存在，直接用bidDate, 但是biddedCount要是1
    let prev_dates = next_all_dates(unit, false);
    let next_dates = next_all_dates(unit, true);
    let mut dates: Vec<NaiveDate> = Vec::new();
    for d in prev_dates.iter().rev() {
        dates.push(*d);
    }
    dates.push(date);
    for d in next_dates {
        dates.push(d);
    }
    dates.sort();
    dates
}

pub fn get_all_budgets(unit: &Unit) -> Vec<Option<f32>> {
    let mark_budgets = unit.clone().unit_budgets.unwrap_or_default();
    let count = unit.count as usize;
    let mut budgets: Vec<Option<f32>> = Vec::with_capacity(unit.count as usize);

    for mark_bugdet in mark_budgets {
        let mut num: isize = -1;
        let v = match mark_bugdet {
            Some(v) => {
                let date = DateTime::<Local>::from_str(v.budget_date.as_str())
                    .unwrap()
                    .date_naive();
                num = num_by_date_time(unit, &date);
                Some(v.budget as f32)
            }
            _ => None,
        };
        if num >= 0 {
            budgets[(num as usize) - 1] = v;
        }
    }

    // 第一次会头，不算
    budgets[0] = None;
    // 填充输入的
    let mut i: usize = 2;
    while i < count {
        if budgets[i - 1].is_none() {
            let v = if (i as f32) < (unit.count as f32 * 0.7) {
                0.35
            } else {
                0.15
            };
            let budget = unit.budget as f32 * v;
            budgets[i - 1] = Some(budget);
        }
        i += 1;
    }
    // 最后一次会，没有budget
    budgets[count - 1] = None;

    budgets
}

// 递归时间往前/后推算, unit 的lastBiddedDate的时间如果有加标的会必须是加标时间
fn next_all_dates(unit: &Unit, next: bool) -> Vec<NaiveDate> {
    let mut next_dates: Vec<NaiveDate> = Vec::new();
    let date_str = unit.last_bidded_date.clone();
    let date = DateTime::<Local>::from_str(date_str.as_str())
        .unwrap()
        .date_naive();
    let date_info = to_date_info(date, unit.is_lunar);
    // 要计算会的支数
    let need_count = if next {
        unit.count - unit.bidded_count
    } else {
        unit.bidded_count - 1
    };
    // 看计算，是向前还是向后
    let dir = if next { 1 } else { -1 };
    // 分加标和不加标两种情况，
    // 目前只支持正标和加标在同一个月， 不确定能不能支持不在同一个月的
    match unit.plus_cycle {
        Some(plus_cycle) => {
            let plus_day = unit.plus_day.unwrap() as i8;
            // 先算总共需要几个周期， 一个周期就是正标n个 + 加标一次
            let unit_cycle_months = unit.cycle + plus_cycle;
            // 总共周期次数
            let cycles = ((unit.count / unit_cycle_months) as f32).ceil() as i8 + 1;
            // 上次一个加标日期
            let mut last_plus_date_info = if next {
                DateInfo {
                    year: date_info.year,
                    month: date_info.month - plus_cycle as i8,
                    day: plus_day,
                    leap: None,
                }
            } else {
                DateInfo {
                    year: date_info.year,
                    month: date_info.month + plus_cycle as i8,
                    day: plus_day,
                    leap: None,
                }
            };
            // 周期次数
            let mut i = 1;
            while i <= cycles {
                //先算加标会的时间
                let next_plus_date_info = DateInfo {
                    year: last_plus_date_info.year,
                    month: last_plus_date_info.month + dir * plus_cycle as i8,
                    day: plus_day,
                    leap: None,
                };
                // 每个周期内正标次数
                let standard_count = plus_cycle / unit.cycle;
                let mut k = 1;
                while k <= standard_count {
                    // 考虑加标当月有正标
                    let cur_mon_count =
                        if (next && unit.plus_day.is_some()) || !next && unit.plus_day.is_none() {
                            0
                        } else {
                            -1
                        };
                    // 有的月份在当月, 往下算正标在后的和往上算正标在前的，都是在当月
                    let delta_month = k + cur_mon_count;
                    let next_date_info = DateInfo {
                        year: last_plus_date_info.year,
                        month: last_plus_date_info.month
                            + dir * delta_month as i8 * unit.cycle as i8,
                        day: unit.day as i8,
                        leap: None,
                    };
                    next_dates.push(back_to_local_date(&next_date_info, unit.is_lunar));
                    // 同周期内加一个
                    k += 1;
                }

                // 计算闰月是否要标, 只有一个月标一次才有可能，其他都不标
                if unit.is_lunar && unit.cycle == 1 {
                    let months = leap_months(
                        Lunar::from(&last_plus_date_info),
                        Lunar::from(&next_plus_date_info),
                    );
                    if !months.is_empty() {
                        // 这样计算，就算有闰月也只有一次
                        let m = &months[0];
                        let next_date_info = DateInfo {
                            year: m.year,
                            month: m.month,
                            leap: Some(true),
                            day: unit.day as i8,
                        };
                        // 有就加一个
                        next_dates.push(back_to_local_date(&next_date_info, unit.is_lunar));
                    }
                }

                // 加入加标日期
                next_dates.push(back_to_local_date(&next_plus_date_info, unit.is_lunar));

                i += 1;
                last_plus_date_info = next_plus_date_info;
            }
        }
        None => {
            // 不是加标的情况
            let mut last_date_info = date_info;
            // i 表示每次会
            let mut i = 1;
            while i <= need_count {
                let next_date_info: DateInfo = DateInfo {
                    year: last_date_info.year,
                    month: last_date_info.month + dir * unit.cycle as i8,
                    day: unit.day as i8,
                    leap: None,
                };
                next_dates.push(back_to_local_date(&next_date_info, unit.is_lunar));

                // 计算闰月是否要标, 只有一个月标一次才有可能，其他都不标
                if unit.is_lunar && unit.cycle == 1 {
                    let months =
                        leap_months(Lunar::from(&last_date_info), Lunar::from(&next_date_info));
                    if !months.is_empty() {
                        // 这样计算，就算有闰月也只有一次
                        let m = &months[0];
                        let next_date_info = DateInfo {
                            year: m.year,
                            month: m.month,
                            leap: Some(true),
                            day: unit.day as i8,
                        };
                        // 有就加一个
                        next_dates.push(back_to_local_date(&next_date_info, unit.is_lunar));
                    }
                }
                i += 1;
                last_date_info = next_date_info;
            }
        }
    }

    // 排下序得到结果
    next_dates.sort_by(|d1, d2| {
        if (next && d1 > d2) || (!next && d1 < d2) {
            Ordering::Greater
        } else {
            Ordering::Less
        }
    });

    // 取消不符合当前时间的
    let d = date;
    let next_dates: Vec<NaiveDate> = next_dates
        .iter()
        .copied()
        .filter(|d1: &NaiveDate| if next { &d < d1 } else { &d > d1 })
        .collect();

    // 截断超过总会数的
    let next_dates: Vec<NaiveDate> = next_dates[0..need_count as usize].to_vec();

    next_dates
}

fn to_date_info(date: NaiveDate, is_lunar: bool) -> DateInfo {
    if is_lunar {
        DateInfo::from(&solar2lunar(date))
    } else {
        DateInfo {
            year: date.year() as i16,
            month: date.month() as i8,
            day: date.day() as i8,
            leap: None,
        }
    }
}

fn back_to_local_date(date_info: &DateInfo, is_lunar: bool) -> NaiveDate {
    if is_lunar {
        lunar2solar(Lunar::from(date_info))
    } else {
        let d = verify_date(date_info);
        NaiveDate::from(&d)
    }
}

fn verify_date(date: &DateInfo) -> DateInfo {
    let mut n_date = date.clone();
    if n_date.month <= 0 {
        let delta = 1 - n_date.month;
        n_date.year -= ((delta as f32) / 12.0).ceil() as i16;
        n_date.month = 12 - (-n_date.month % 12);
    } else if n_date.month > 12 {
        let delta = n_date.month - 12;
        n_date.year += ((delta as f32) / 12.0).ceil() as i16;
        n_date.month = delta % 12;
    }
    if n_date.month == 0 {
        n_date.month = 12;
    }
    n_date
}
