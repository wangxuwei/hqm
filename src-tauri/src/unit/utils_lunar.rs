use chinese_lunisolar_calendar::{chrono::*, ChineseVariant};
use chinese_lunisolar_calendar::{LunisolarDate, SolarDate};

#[derive(Clone)]
pub struct Lunar {
    pub year: i16,
    pub month: i8, // month value should be 1 - 12
    pub day: i8,
    pub leap: bool,
}

pub struct LeapMonth {
    pub year: i16,
    pub month: i8,
}
/**
 *
 * @param year
 * @param month month value should be 1 - 12
 * @param day
 * @param leap optional
 */

pub fn lunar2solar(lunar_date: Lunar) -> NaiveDate {
    // let lunar_date = verifyLunarDate(lunar_date);
    let lunisolar_date = LunisolarDate::from_ymd(
        lunar_date.year as u16,
        lunar_date.month as u8,
        lunar_date.leap,
        lunar_date.day as u8,
    )
    .unwrap();
    let s_date = lunisolar_date.to_solar_date();
    s_date.to_naive_date()
}

/**
 *
 * @param year
 * @param month month value should be 1 - 12
 * @param day
 */
pub fn solar2lunar(solar_date: NaiveDate) -> Lunar {
    let l_date: LunisolarDate = SolarDate::from_naive_date(solar_date)
        .unwrap()
        .to_lunisolar_date()
        .unwrap();
    let lunar_month = l_date.get_lunar_month();
    Lunar {
        year: l_date.get_lunisolar_year().to_u16() as i16,
        month: lunar_month.to_u8() as i8,
        day: l_date.get_lunar_day().to_u8() as i8,
        leap: lunar_month.is_leap_month(),
    }
}

pub fn format_lunar_date(lunar_date: Lunar) -> String {
    let l_date: LunisolarDate = LunisolarDate::from_ymd(
        lunar_date.year as u16,
        lunar_date.month as u8,
        lunar_date.leap,
        lunar_date.day as u8,
    )
    .unwrap();
    format!(
        "{}{}",
        l_date.get_lunar_month().to_str(ChineseVariant::Simple),
        l_date.get_lunar_day().to_str()
    )
}

// num 可以负数
pub fn lunar_month_add(lunar_date: Lunar, num: i8) -> Lunar {
    let mut current_lunar = verify_lunar_date(&lunar_date);
    let mut n = num;
    while num != 0 {
        let sign = if n > 0 { 1 } else { -1 };
        n -= sign;

        if sign < 0 {
            if current_lunar.leap {
                current_lunar.leap = false;
                continue;
            }
        } else {
            let leap_month = leap_month_of_year(&lunar_date);
            if leap_month == current_lunar.month && !current_lunar.leap {
                current_lunar.leap = true;
                continue;
            }
        }

        current_lunar.month += sign;
        current_lunar = verify_lunar_date(&current_lunar);
        if sign < 0 {
            let leap_month = leap_month_of_year(&lunar_date);

            if leap_month == current_lunar.month {
                current_lunar.leap = true;
            } else {
                // leap 有可能上次一次预留下来的值
                current_lunar.leap = false;
            }
        } else {
            // leap 有可能上次一次预留下来的值
            current_lunar.leap = false;
        }
    }
    verify_lunar_date(&current_lunar)
}

pub fn leap_count(lunar1: Lunar, lunar2: Lunar) -> usize {
    let months = leap_months(lunar1, lunar2);
    months.len()
}

pub fn leap_months(lunar1: Lunar, lunar2: Lunar) -> Vec<LeapMonth> {
    let m1 = lunar2solar(lunar1);
    let m2 = lunar2solar(lunar2);
    let mut start: NaiveDate;
    let end: NaiveDate;
    if m1 < m2 {
        start = m1;
        end = m2;
    } else {
        start = m2;
        end = m1;
    }
    let mut leap_mons = Vec::new();
    while end > start {
        let l = solar2lunar(start);
        if l.leap {
            leap_mons.push(LeapMonth {
                year: l.year,
                month: l.month,
            });
        }
        start = lunar2solar(lunar_month_add(l, 1));
    }
    leap_mons
}

pub fn verify_lunar_date(date: &Lunar) -> Lunar {
    let mut lunar_date = date.clone();
    if lunar_date.month <= 0 {
        let delta = 1 - lunar_date.month;
        lunar_date.year -= ((delta as f32) / 12.0).ceil() as i16;
        lunar_date.month = 12 - (-1 * lunar_date.month % 12);
    } else if lunar_date.month > 12 {
        let delta = lunar_date.month - 12;
        lunar_date.year += ((delta as f32) / 12.0).ceil() as i16;
        lunar_date.month = (delta % 12) as i8;
    }
    if lunar_date.month == 0 {
        lunar_date.month = 12;
    }
    return lunar_date;
}

fn leap_month_of_year(lunar_date: &Lunar) -> i8 {
    let l_date: LunisolarDate = LunisolarDate::from_ymd(
        lunar_date.year as u16,
        lunar_date.month as u8,
        lunar_date.leap,
        lunar_date.day as u8,
    )
    .unwrap();

    let leap_lunar_month = l_date.get_lunisolar_year().get_leap_lunar_month();
    match leap_lunar_month {
        Some(leap_lunar_month) => leap_lunar_month.to_u8() as i8,
        None => 0,
    }
}
