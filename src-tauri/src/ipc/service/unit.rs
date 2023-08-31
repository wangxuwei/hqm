use crate::{
    ctx::Ctx,
    model::{UnitBmc, UnitBudgetForCreate, UnitForCreate},
};
use serde_json::Value;
use std::{fs, sync::Arc};

pub async fn import_units(ctx: Arc<Ctx>, path: &String) {
    println!("{}", path);
    let contents = fs::read_to_string(path).unwrap();
    let units = parse_units(&contents);
    for u in units {
        // FIXME: batch create
        UnitBmc::create(ctx.clone(), u).await.unwrap();
    }
}

pub async fn export_units() {}

pub async fn sync_units() {}

pub fn parse_units(raw_json: &str) -> Vec<UnitForCreate> {
    let obj_json_array: Value = serde_json::from_str(raw_json).unwrap();

    let mut units: Vec<UnitForCreate> = Vec::new();
    for el in obj_json_array.as_array().unwrap().iter() {
        let mut unit_budgets: Vec<UnitBudgetForCreate> = Vec::new();

        for bd in el["unitBudgets"].as_array().unwrap().iter() {
            unit_budgets.push(UnitBudgetForCreate {
                unit_id: "".into(),
                budget_date: bd["budgetDate"].to_string(),
                budget: bd["budget"].as_i64().unwrap() as i16,
                is_self: bd["isSelf"].as_bool().unwrap(),
            })
        }

        units.push(UnitForCreate {
            name: el["name"].as_str().unwrap().to_string(),
            is_lunar: el["isLunar"].as_bool().unwrap(),
            last_bidded_date: el["lastBiddedDate"].as_str().unwrap().to_string(),
            day: el["day"].as_i64().unwrap() as i16,
            cycle: el["cycle"].as_i64().unwrap() as i16,
            plus_day: el["plusDay"].as_i64().map(|v| v as i16),
            plus_cycle: el["plusCycle"].as_i64().map(|v| v as i16),
            budget: el["budget"].as_i64().unwrap() as i16,
            count: el["count"].as_i64().unwrap() as i16,
            bidded_count: el["biddedCount"].as_i64().unwrap() as i16,
            unit_count: el["unitCount"].as_i64().unwrap() as i16,
            amount: el["amount"].as_i64(),
            description: el["description"].as_str().map(|v| v.to_string()),
            unit_budgets: Some(unit_budgets),
        });
    }
    units
}
