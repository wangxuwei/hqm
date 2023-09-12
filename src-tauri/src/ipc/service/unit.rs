use crate::{
    ctx::Ctx,
    model::{OAuthAccessBmc, Unit, UnitBmc, UnitBudgetForCreate, UnitForCreate},
};
use chrono::{Local, NaiveDateTime};
use reqwest::{
    multipart::{Form, Part},
    Client,
};
use serde_json::{Map, Value};
use std::{borrow::Cow, fs, sync::Arc};

pub async fn import_units(ctx: Arc<Ctx>, path: &String) {
    let contents = fs::read_to_string(path).unwrap();
    let units = parse_units(&contents);
    for u in units {
        // FIXME: batch create
        UnitBmc::create(ctx.clone(), u).await.unwrap();
    }
}

pub async fn export_units(ctx: Arc<Ctx>, path: &String) {
    let units = UnitBmc::list(ctx, None).await.unwrap();
    let json_obj = convert_units(&units);
    let json_str = serde_json::to_string_pretty(&json_obj).unwrap();
    fs::write(path, json_str).unwrap();
}

pub async fn backup_units(ctx: Arc<Ctx>) {
    let access_token = OAuthAccessBmc::get_token(ctx.clone()).await;
    if let Ok(token) = access_token {
        // check valid token
        let now = Local::now().naive_local();
        let exipre_date =
            NaiveDateTime::parse_from_str(&token.exipre_date, "%Y-%m-%dT%H:%M:%S.%fZ").unwrap();
        if now < exipre_date {
            let filename = format!("units_{}.json", now.format("%Y-%m-%d-%H-%M-%S"));
            let units = UnitBmc::list(ctx.clone(), None).await.unwrap();
            let json_obj = convert_units(&units);
            let json_str = serde_json::to_string_pretty(&json_obj).unwrap();
            // do sync
            let file_byte = json_str.as_bytes().to_vec();
            // 一定要有file_name方法，且参数不能为空，否则数据上传失败
            let part = Part::bytes(Cow::from(file_byte)).file_name(filename.clone());
            let form = Form::new().part("file", part);
            println!(
                    "https://d.pcs.baidu.com/rest/2.0/pcs/file?method=upload&access_token={}&ondup=overwrite&path=/hqm/bak",
                    token.access_token
                );
            Client::new()
                .post(format!(
                    "https://d.pcs.baidu.com/rest/2.0/pcs/file?method=upload&access_token={}&ondup=overwrite&path=/apps/工具管理/{}",
                    token.access_token,
                    filename
                ))
                .multipart(form)
                .send()
                // FIXME, baidu http(一般也不会panic)错误返回好像没有panic！，是否处理, 错误吗“31064”-上传路径权限
                .await
                .unwrap();
        }
    }
}

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

pub fn convert_units(units: &[Unit]) -> Vec<Map<String, Value>> {
    let mut array: Vec<Map<String, Value>> = Vec::new();
    for el in units.iter() {
        let mut u: Map<String, Value> = Map::<String, Value>::new();

        let mut unit_budgets: Vec<Map<String, Value>> = Vec::new();

        if let Some(budgets) = &el.unit_budgets {
            for bd in budgets.iter().flatten() {
                let mut b: Map<String, Value> = Map::<String, Value>::new();
                b.insert("budgetDate".into(), bd.budget_date.clone().into());
                b.insert("budget".into(), bd.budget.into());
                b.insert("isSelf".into(), bd.is_self.into());
                unit_budgets.push(b);
            }
        }

        u.insert("name".into(), el.name.clone().into());
        u.insert("isLunar".into(), el.is_lunar.into());
        u.insert("lastBiddedDate".into(), el.last_bidded_date.clone().into());
        u.insert("day".into(), el.day.into());
        u.insert("cycle".into(), el.cycle.into());
        u.insert("plusDay".into(), el.plus_day.into());
        u.insert("plusCycle".into(), el.plus_cycle.into());
        u.insert("budget".into(), el.budget.into());
        u.insert("count".into(), el.count.into());
        u.insert("biddedCount".into(), el.bidded_count.into());
        u.insert("unitCount".into(), el.unit_count.into());
        u.insert("amount".into(), el.amount.into());
        u.insert("description".into(), el.description.clone().into());
        u.insert("unitBudgets".into(), unit_budgets.into());

        array.push(u);
    }
    array
}
