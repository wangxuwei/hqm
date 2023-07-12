//! Tauri IPC commands to bridge UnitBudget Frontend Model Controller to Backend Model Controller
//!

use crate::ctx::Ctx;
use crate::ipc::{CreateParams, DeleteParams, GetParams, IpcResponse, ListParams, UpdateParams};
use crate::model::{
    ModelMutateResultData, UnitBudget, UnitBudgetBmc, UnitBudgetForCreate, UnitBudgetForUpdate,
};
use crate::Error;
use serde_json::Value;
use tauri::{command, AppHandle, Wry};

#[command]
pub async fn get_unit_budget(app: AppHandle<Wry>, params: GetParams) -> IpcResponse<UnitBudget> {
    match Ctx::from_app(app) {
        Ok(ctx) => UnitBudgetBmc::get(ctx, &params.id).await.into(),
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn create_unit_budget(
    app: AppHandle<Wry>,
    params: CreateParams<UnitBudgetForCreate>,
) -> IpcResponse<ModelMutateResultData> {
    match Ctx::from_app(app) {
        Ok(ctx) => UnitBudgetBmc::create(ctx, params.data).await.into(),
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn update_unit_budget(
    app: AppHandle<Wry>,
    params: UpdateParams<UnitBudgetForUpdate>,
) -> IpcResponse<ModelMutateResultData> {
    match Ctx::from_app(app) {
        Ok(ctx) => UnitBudgetBmc::update(ctx, &params.id, params.data)
            .await
            .into(),
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn delete_unit_budget(
    app: AppHandle<Wry>,
    params: DeleteParams,
) -> IpcResponse<ModelMutateResultData> {
    match Ctx::from_app(app) {
        Ok(ctx) => UnitBudgetBmc::delete(ctx, &params.id).await.into(),
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn list_unit_budgets(
    app: AppHandle<Wry>,
    params: ListParams<Value>,
) -> IpcResponse<Vec<UnitBudget>> {
    // TODO: Needs to make error handling simpler (use ? rather than all into())
    match Ctx::from_app(app) {
        Ok(ctx) => match params.filter.map(serde_json::from_value).transpose() {
            Ok(filter) => UnitBudgetBmc::list(ctx, filter).await.into(),
            Err(err) => Err(Error::JsonSerde(err)).into(),
        },
        Err(_) => Err(Error::CtxFail).into(),
    }
}
