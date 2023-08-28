//! All model and controller for the Unit type
//!
use super::bmc_base::{bmc_create, bmc_delete, bmc_get, bmc_list, bmc_update};
use super::store::{Creatable, Filterable, Patchable};
use super::{ModelMutateResultData, UnitBudget, UnitBudgetForCreate};
use crate::ctx::Ctx;
use crate::utils::XTake;
use crate::{Error, Result};
use modql::filter::{FilterNodes, OpValsString};
use modql::ListOptions;
use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use std::collections::BTreeMap;
use std::sync::Arc;
use surrealdb::sql::{Object, Value};
use ts_rs::TS;

// region:    --- Unit

#[skip_serializing_none]
#[derive(Serialize, TS, Debug, Clone)]
#[ts(export, export_to = "../src/bindings/")]
pub struct Unit {
    // persistent
    // required
    pub id: String,
    // 名称
    pub name: String,
    // 是否是农历
    pub is_lunar: bool,
    // 上次的时间 与已标数量对应
    pub last_bidded_date: String,
    // 每个月哪一天开始
    pub day: i16,
    // 频率 平均几月一次，有可能半月
    pub cycle: i16,
    // 加标月哪一天开始
    pub plus_day: Option<i16>,
    // 加标频率 平均几月一次，有可能半月
    pub plus_cycle: Option<i16>,
    // 本金
    pub budget: i16,
    // 会员数
    pub count: i16,
    // 已标
    pub bidded_count: i16,
    // 会支数
    pub unit_count: i16,

    // optional
    // 预估总额
    pub amount: Option<i16>,
    // 备注
    pub description: Option<String>,

    pub unit_budgets: Option<Vec<Option<UnitBudget>>>,
}

impl TryFrom<Object> for Unit {
    type Error = Error;
    fn try_from(mut val: Object) -> Result<Unit> {
        let unit = Unit {
            id: val.x_take_val("id")?,
            name: val.x_take_val("name")?,
            is_lunar: val.x_take_val("is_lunar")?,
            last_bidded_date: val.x_take_val("last_bidded_date")?,
            day: val.x_take_val("day")?,
            cycle: val.x_take_val("cycle")?,
            plus_day: val.x_take("plus_day")?,
            plus_cycle: val.x_take("plus_cycle")?,
            budget: val.x_take_val("budget")?,
            count: val.x_take_val("count")?,
            bidded_count: val.x_take_val("bidded_count")?,
            unit_count: val.x_take_val("unit_count")?,
            amount: val.x_take("amount")?,
            description: val.x_take("description")?,
            unit_budgets: None,
        };

        Ok(unit)
    }
}

// endregion: --- Unit

// region:    --- UnitForCreate

#[skip_serializing_none]
#[derive(Deserialize, TS, Debug)]
#[ts(export, export_to = "../src/bindings/")]
pub struct UnitForCreate {
    // required
    // 名称
    pub name: String,
    // 是否是农历
    pub is_lunar: bool,
    // 上次的时间 与已标数量对应
    pub last_bidded_date: String,
    // 每个月哪一天开始
    pub day: i16,
    // 频率 平均几月一次，有可能半月
    pub cycle: i16,
    // 加标月哪一天开始
    pub plus_day: Option<i16>,
    // 加标频率 平均几月一次，有可能半月
    pub plus_cycle: Option<i16>,
    // 本金
    pub budget: i16,
    // 会员数
    pub count: i16,
    // 已标
    pub bidded_count: i16,
    // 会支数
    pub unit_count: i16,

    // optional
    // 预估总额
    pub amount: Option<i16>,
    // 备注
    pub description: Option<String>,

    // transient
    pub unit_budgets: Option<Vec<UnitBudgetForCreate>>,
}

impl From<UnitForCreate> for Value {
    fn from(val: UnitForCreate) -> Self {
        let mut data = BTreeMap::from([
            // Note: could have used map![.. => ..] as well
            ("name".into(), val.name.into()),
            ("is_lunar".into(), val.is_lunar.into()),
            ("last_bidded_date".into(), val.last_bidded_date.into()),
            ("day".into(), val.day.into()),
            ("cycle".into(), val.cycle.into()),
            ("budget".into(), val.budget.into()),
            ("count".into(), val.count.into()),
            ("bidded_count".into(), val.bidded_count.into()),
            ("unit_count".into(), val.unit_count.into()),
        ]);

        if let Some(plus_day) = val.plus_day {
            data.insert("plus_day".into(), plus_day.into());
        }

        if let Some(plus_cycle) = val.plus_cycle {
            data.insert("plus_cycle".into(), plus_cycle.into());
        }

        if let Some(amount) = val.amount {
            data.insert("amount".into(), amount.into());
        }
        if let Some(description) = val.description {
            data.insert("description".into(), description.into());
        }
        Value::Object(data.into())
    }
}

impl Creatable for UnitForCreate {}

// endregion: --- UnitForCreate

// region:    --- UnitForUpdate

#[skip_serializing_none]
#[derive(Deserialize, TS, Debug)]
#[ts(export, export_to = "../src/bindings/")]
pub struct UnitForUpdate {
    // 名称
    pub name: Option<String>,
    // 是否是农历
    pub is_lunar: Option<bool>,
    // 上次的时间 与已标数量对应
    pub last_bidded_date: Option<String>,
    // 每个月哪一天开始
    pub day: Option<i16>,
    // 频率 平均几月一次，有可能半月
    pub cycle: Option<i16>,
    // 加标月哪一天开始
    pub plus_day: Option<i16>,
    // 加标频率 平均几月一次，有可能半月
    pub plus_cycle: Option<i16>,
    // 本金
    pub budget: Option<i16>,
    // 会员数
    pub count: Option<i16>,
    // 已标
    pub bidded_count: Option<i16>,
    // 会支数
    pub unit_count: Option<i16>,
    // 预估总额
    pub amount: Option<i16>,
    // 备注
    pub description: Option<String>,
}

impl From<UnitForUpdate> for Value {
    fn from(val: UnitForUpdate) -> Self {
        let mut data = BTreeMap::new();
        if let Some(name) = val.name {
            data.insert("name".into(), name.into());
        }
        if let Some(is_lunar) = val.is_lunar {
            data.insert("is_lunar".into(), is_lunar.into());
        }
        if let Some(last_bidded_date) = val.last_bidded_date {
            data.insert("last_bidded_date".into(), last_bidded_date.into());
        }
        if let Some(day) = val.day {
            data.insert("day".into(), day.into());
        }
        if let Some(cycle) = val.cycle {
            data.insert("cycle".into(), cycle.into());
        }
        if let Some(plus_day) = val.plus_day {
            data.insert("plus_day".into(), plus_day.into());
        }
        if let Some(plus_cycle) = val.plus_cycle {
            data.insert("plus_cycle".into(), plus_cycle.into());
        }
        if let Some(budget) = val.budget {
            data.insert("budget".into(), budget.into());
        }
        if let Some(count) = val.count {
            data.insert("count".into(), count.into());
        }
        if let Some(bidded_count) = val.bidded_count {
            data.insert("bidded_count".into(), bidded_count.into());
        }
        if let Some(unit_count) = val.unit_count {
            data.insert("unit_count".into(), unit_count.into());
        }
        if let Some(amount) = val.amount {
            data.insert("amount".into(), amount.into());
        }
        if let Some(description) = val.description {
            data.insert("description".into(), description.into());
        }
        data.into()
    }
}

impl Patchable for UnitForUpdate {}

// endregion: --- UnitForUpdate

// region:    --- UnitFilter

#[derive(FilterNodes, Deserialize, Debug)]
pub struct UnitFilter {
    pub id: Option<OpValsString>,
    pub name: Option<OpValsString>,
}

impl Filterable for UnitFilter {}

// endregion: --- UnitFilter

// region:    --- UnitBmc

pub struct UnitBmc;

impl UnitBmc {
    const ENTITY: &'static str = "unit";

    pub async fn get(ctx: Arc<Ctx>, id: &str) -> Result<Unit> {
        bmc_get(ctx, Self::ENTITY, id).await
    }

    pub async fn create(ctx: Arc<Ctx>, data: UnitForCreate) -> Result<ModelMutateResultData> {
        bmc_create(ctx, Self::ENTITY, data).await
    }

    pub async fn update(
        ctx: Arc<Ctx>,
        id: &str,
        data: UnitForUpdate,
    ) -> Result<ModelMutateResultData> {
        bmc_update(ctx, Self::ENTITY, id, data).await
    }

    pub async fn delete(ctx: Arc<Ctx>, id: &str) -> Result<ModelMutateResultData> {
        bmc_delete(ctx, Self::ENTITY, id).await
    }

    pub async fn list(ctx: Arc<Ctx>, filter: Option<UnitFilter>) -> Result<Vec<Unit>> {
        bmc_list(ctx, Self::ENTITY, filter, ListOptions::default()).await
    }
}

// endregion: --- UnitBmc
