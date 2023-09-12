//! Tauri IPC commands to bridge Unit Frontend Model Controller to Backend Model Controller
//!

use super::{CreateParams, DeleteParams, GetParams, IpcResponse, ListParams, UpdateParams};
use crate::ctx::Ctx;
use crate::ipc::service::{
    backup_units as do_backup_units, export_units as do_export_units,
    import_units as do_import_units,
};
use crate::model::{ModelMutateResultData, Unit, UnitBmc, UnitForCreate, UnitForUpdate};
use crate::Error;
use serde::Deserialize;
use serde_json::Value;
use tauri::{command, AppHandle, Wry};

#[command]
pub async fn get_unit(app: AppHandle<Wry>, params: GetParams) -> IpcResponse<Unit> {
    match Ctx::from_app(app) {
        Ok(ctx) => UnitBmc::get(ctx, &params.id).await.into(),
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn create_unit(
    app: AppHandle<Wry>,
    params: CreateParams<UnitForCreate>,
) -> IpcResponse<ModelMutateResultData> {
    match Ctx::from_app(app) {
        Ok(ctx) => UnitBmc::create(ctx, params.data).await.into(),
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn update_unit(
    app: AppHandle<Wry>,
    params: UpdateParams<UnitForUpdate>,
) -> IpcResponse<ModelMutateResultData> {
    match Ctx::from_app(app) {
        Ok(ctx) => UnitBmc::update(ctx, &params.id, params.data).await.into(),
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn delete_unit(
    app: AppHandle<Wry>,
    params: DeleteParams,
) -> IpcResponse<ModelMutateResultData> {
    match Ctx::from_app(app) {
        Ok(ctx) => UnitBmc::delete(ctx, &params.id).await.into(),
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn list_units(app: AppHandle<Wry>, params: ListParams<Value>) -> IpcResponse<Vec<Unit>> {
    match Ctx::from_app(app) {
        Ok(ctx) => match params.filter.map(serde_json::from_value).transpose() {
            Ok(filter) => UnitBmc::list(ctx, filter).await.into(),
            Err(err) => Err(Error::JsonSerde(err)).into(),
        },
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn get_payment_in_period(
    app: AppHandle<Wry>,
    params: ListParams<Value>,
) -> IpcResponse<Vec<Unit>> {
    match Ctx::from_app(app) {
        Ok(ctx) => match params.filter.map(serde_json::from_value).transpose() {
            Ok(filter) => UnitBmc::list(ctx, filter).await.into(),
            Err(err) => Err(Error::JsonSerde(err)).into(),
        },
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn get_valid_left_income(
    app: AppHandle<Wry>,
    params: ListParams<Value>,
) -> IpcResponse<Vec<Unit>> {
    match Ctx::from_app(app) {
        Ok(ctx) => match params.filter.map(serde_json::from_value).transpose() {
            Ok(filter) => UnitBmc::list(ctx, filter).await.into(),
            Err(err) => Err(Error::JsonSerde(err)).into(),
        },
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn get_due_date_units_in_peroid(
    app: AppHandle<Wry>,
    params: ListParams<Value>,
) -> IpcResponse<Vec<Unit>> {
    match Ctx::from_app(app) {
        Ok(ctx) => match params.filter.map(serde_json::from_value).transpose() {
            Ok(filter) => UnitBmc::list(ctx, filter).await.into(),
            Err(err) => Err(Error::JsonSerde(err)).into(),
        },
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn get_interest_in_period(
    app: AppHandle<Wry>,
    params: ListParams<Value>,
) -> IpcResponse<Vec<Unit>> {
    match Ctx::from_app(app) {
        Ok(ctx) => match params.filter.map(serde_json::from_value).transpose() {
            Ok(filter) => UnitBmc::list(ctx, filter).await.into(),
            Err(err) => Err(Error::JsonSerde(err)).into(),
        },
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[derive(Deserialize)]
pub struct FilePath {
    path: String,
}

#[command]
pub async fn import_units(app: AppHandle<Wry>, params: FilePath) -> IpcResponse<bool> {
    match Ctx::from_app(app) {
        Ok(ctx) => {
            do_import_units(ctx, &params.path).await;
            IpcResponse::from(Ok(true))
        }
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn export_units(app: AppHandle<Wry>, params: FilePath) -> IpcResponse<bool> {
    match Ctx::from_app(app) {
        Ok(ctx) => {
            do_export_units(ctx, &params.path).await;
            IpcResponse::from(Ok(true))
        }
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn backup_units(app: AppHandle<Wry>, _params: ListParams<Value>) -> IpcResponse<bool> {
    match Ctx::from_app(app) {
        Ok(ctx) => {
            do_backup_units(ctx).await;
            IpcResponse::from(Ok(true))
        }
        Err(_) => Err(Error::CtxFail).into(),
    }
}
