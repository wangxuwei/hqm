//! All model and controller for the Item type
//!

use super::bmc_base::{bmc_create, bmc_delete, bmc_get, bmc_list, bmc_update};
use super::store::{Creatable, Filterable, Patchable};
use super::ModelMutateResultData;
use crate::ctx::Ctx;
use crate::utils::{map, XTake};
use crate::{Error, Result};
use modql::filter::{FilterNodes, OpValsString};
use modql::ListOptions;
use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use std::collections::BTreeMap;
use std::sync::Arc;
use surrealdb::sql::{Object, Value};
use ts_rs::TS;

// region:    --- UnitBudget

#[skip_serializing_none]
#[derive(Serialize, TS, Debug, Clone)]
#[ts(export, export_to = "../src/bindings/", rename_all = "camelCase")]
pub struct UnitBudget {
    pub id: String,
    // 会ID
    pub unit_id: String,
    // 标时间
    pub budget_date: String,
    // 标金
    pub budget: i64,
    // 是否是自己标的
    pub is_self: bool,
}

impl TryFrom<Object> for UnitBudget {
    type Error = Error;
    fn try_from(mut val: Object) -> Result<UnitBudget> {
        let unit_budget = UnitBudget {
            id: val.x_take_val("id")?,
            unit_id: val.x_take_val("unit_id")?,
            budget: val.x_take_val("budget")?,
            budget_date: val.x_take_val("budget_date")?,
            is_self: val.x_take_val("is_self")?,
        };

        Ok(unit_budget)
    }
}

// endregion: --- UnitBudget

// region:    --- UnitBudgetForCreate

#[skip_serializing_none]
#[derive(Deserialize, TS, Debug)]
#[ts(export, export_to = "../src/bindings/", rename_all = "camelCase")]
pub struct UnitBudgetForCreate {
    // 会ID
    pub unit_id: String,
    // 标时间
    pub budget_date: String,
    // 标金
    pub budget: i64,
    // 是否是自己标的
    pub is_self: bool,
}

impl From<UnitBudgetForCreate> for Value {
    fn from(val: UnitBudgetForCreate) -> Self {
        let data: BTreeMap<String, Value> = map![
            "unit_id".into() => val.unit_id.into(),
            "budget_date".into() => val.budget_date.into(),
            "budget".into() => val.budget.into(),
            "is_self".into() => val.is_self.into(),
        ];
        Value::Object(data.into())
    }
}

impl Creatable for UnitBudgetForCreate {}

// endregion: --- UnitBudgetForCreate

// region:    --- UnitBudgetForUpdate

#[skip_serializing_none]
#[derive(Deserialize, TS, Debug)]
#[ts(export, export_to = "../src/bindings/", rename_all = "camelCase")]
pub struct UnitBudgetForUpdate {
    // 会ID
    pub unit_id: Option<String>,
    // 标时间
    pub budget_date: Option<String>,
    // 标金
    pub budget: Option<i64>,
    // 是否是自己标的
    pub is_self: Option<bool>,
}

impl From<UnitBudgetForUpdate> for Value {
    fn from(val: UnitBudgetForUpdate) -> Self {
        let mut data = BTreeMap::new();
        if let Some(unit_id) = val.unit_id {
            data.insert("unit_id".into(), unit_id.into());
        }
        if let Some(budget_date) = val.budget_date {
            data.insert("budget_date".into(), budget_date.into());
        }
        if let Some(budget) = val.budget {
            data.insert("budget".into(), budget.into());
        }
        if let Some(is_self) = val.is_self {
            data.insert("is_self".into(), is_self.into());
        }
        Value::Object(data.into())
    }
}

impl Patchable for UnitBudgetForUpdate {}

// endregion: --- UnitBudgetForUpdate

// region:    --- UnitBudgetFilter

#[derive(FilterNodes, Deserialize, Debug)]
pub struct UnitBudgetFilter {
    pub unit_id: Option<OpValsString>,
}

impl Filterable for UnitBudgetFilter {}

// endregion: --- UnitBudgetFilter

// region:    --- UnitBudgetBmc

pub struct UnitBudgetBmc;

impl UnitBudgetBmc {
    const ENTITY: &'static str = "unit_budget";

    pub async fn get(ctx: Arc<Ctx>, id: &str) -> Result<UnitBudget> {
        bmc_get::<UnitBudget>(ctx, Self::ENTITY, id).await
    }

    pub async fn create(ctx: Arc<Ctx>, data: UnitBudgetForCreate) -> Result<ModelMutateResultData> {
        bmc_create(ctx, Self::ENTITY, data).await
    }

    pub async fn update(
        ctx: Arc<Ctx>,
        id: &str,
        data: UnitBudgetForUpdate,
    ) -> Result<ModelMutateResultData> {
        bmc_update(ctx, Self::ENTITY, id, data).await
    }

    pub async fn delete(ctx: Arc<Ctx>, id: &str) -> Result<ModelMutateResultData> {
        bmc_delete(ctx, Self::ENTITY, id).await
    }

    pub async fn list(ctx: Arc<Ctx>, filter: Option<UnitBudgetFilter>) -> Result<Vec<UnitBudget>> {
        let opts = ListOptions {
            limit: None,
            offset: None,
            order_bys: Some("!id".into()),
        };
        bmc_list(ctx, Self::ENTITY, filter, opts).await
    }
}

// endregion: --- UnitBudgetBmc
