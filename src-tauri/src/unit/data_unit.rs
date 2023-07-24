use crate::model::{UnitBudgetForCreate, UnitForCreate};
use serde_json::Value;

pub fn parse_units(raw_json: &str) -> Vec<UnitForCreate> {
    let obj_json_array: Value = serde_json::from_str(raw_json).unwrap();

    let mut units: Vec<UnitForCreate> = Vec::new();
    for el in obj_json_array.as_array().unwrap().iter() {
        let mut unit_budgets: Vec<UnitBudgetForCreate> = Vec::new();

        for bd in el["unitBudgets"].as_array().unwrap().iter() {
            unit_budgets.push(UnitBudgetForCreate {
                unit_id: "".into(),
                budget_date: bd["budgetDate"].to_string(),
                budget: bd["budget"].as_i64().unwrap(),
                is_self: bd["isSelf"].as_bool().unwrap(),
            })
        }

        units.push(UnitForCreate {
            name: el["name"].to_string(),
            is_lunar: el["isLunar"].as_bool().unwrap(),
            last_bidded_date: el["lastBiddedDate"].to_string(),
            day: el["day"].as_i64().unwrap(),
            cycle: el["cycle"].as_i64().unwrap(),
            plus_day: el["plusDay"].as_i64().unwrap(),
            plus_cycle: el["plusCycle"].as_i64().unwrap(),
            budget: el["budget"].as_i64().unwrap(),
            count: el["count"].as_i64().unwrap(),
            bidded_count: el["biddedCount"].as_i64().unwrap(),
            unit_count: el["unitCount"].as_i64().unwrap(),
            amount: el["amount"].as_i64(),
            description: Some(el["description"].to_string()),
            unit_budgets: Some(unit_budgets),
        });
    }
    units
}
