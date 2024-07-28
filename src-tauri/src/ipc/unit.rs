//! Tauri IPC commands to bridge Unit Frontend Model Controller to Backend Model Controller
//!

use super::{CreateParams, DeleteParams, GetParams, IpcResponse, ListParams, UpdateParams};
use crate::ctx::Ctx;
use crate::ipc::service::{
    backup_units as do_backup_units, export_units as do_export_units,
    import_units as do_import_units, restore_units as do_restore_units,
};
use crate::model::{
    ModelMutateResultData, Unit, UnitBmc, UnitFilter, UnitForCreate, UnitForUpdate,
};
use crate::unit::unit_cal::{get_unit_times, UnitTime};
use crate::unit::unit_stats::{
    get_due_date_unit, get_interest, get_left_income, get_payment, DueDateInfo, InterestInfo,
    LeftIncomeInfo, PaymentInfo,
};
use crate::Error;
use chrono::{DateTime, Local, NaiveDate};
use modql::filter::OpValString;
use serde::Deserialize;
use serde_json::Value;
use std::str::FromStr;
use tauri::{command, AppHandle, Wry};

#[derive(Deserialize, Debug)]
pub struct UnitParams {
    unit_ids: Option<Vec<String>>,
    start_date: Option<String>,
    end_date: Option<String>,
}

impl UnitParams {
    fn to_filter(&self) -> Option<UnitFilter> {
        if self.unit_ids.is_some() && !self.unit_ids.as_ref().unwrap().is_empty() {
            Some(UnitFilter {
                id: self
                    .unit_ids
                    .as_ref()
                    .map(|ids| OpValString::In(ids.to_vec()).into()),
                name: None,
            })
        } else {
            None
        }
    }
}

struct DateInfo {
    start_date: Option<NaiveDate>,
    end_date: Option<NaiveDate>,
}

impl From<UnitParams> for DateInfo {
    fn from(params: UnitParams) -> Self {
        let start_date = params.start_date.map(|s| {
            DateTime::<Local>::from_str(s.as_str())
                .unwrap()
                .date_naive()
        });
        let end_date = params.end_date.map(|s| {
            DateTime::<Local>::from_str(s.as_str())
                .unwrap()
                .date_naive()
        });
        DateInfo {
            start_date,
            end_date,
        }
    }
}

#[command]
pub async fn get_unit(app: AppHandle<Wry>, params: GetParams) -> IpcResponse<Unit> {
    match Ctx::from_app(app) {
        Ok(ctx) => UnitBmc::get(ctx, &params.id).await.into(),
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn get_unit_timeline(
    app: AppHandle<Wry>,
    params: GetParams,
) -> IpcResponse<Vec<UnitTime>> {
    match Ctx::from_app(app) {
        Ok(ctx) => UnitBmc::get(ctx, &params.id)
            .await
            .map(|f| get_unit_times(&f, None, None))
            .into(),
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
    params: UnitParams,
) -> IpcResponse<PaymentInfo> {
    match Ctx::from_app(app) {
        Ok(ctx) => {
            let filter = params.to_filter();
            let units = UnitBmc::list(ctx, filter).await.unwrap();
            let DateInfo {
                start_date,
                end_date,
            } = params.into();
            let ret = get_payment(&units, start_date, end_date);
            Ok(ret).into()
        }
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn get_valid_left_income(
    app: AppHandle<Wry>,
    params: UnitParams,
) -> IpcResponse<LeftIncomeInfo> {
    match Ctx::from_app(app) {
        Ok(ctx) => {
            let filter = params.to_filter();
            let units = UnitBmc::list(ctx, filter).await.unwrap();
            let DateInfo {
                start_date,
                end_date,
            } = params.into();
            let ret = get_left_income(&units, start_date, end_date);
            Ok(ret).into()
        }
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn get_due_date_units_in_peroid(
    app: AppHandle<Wry>,
    params: UnitParams,
) -> IpcResponse<DueDateInfo> {
    match Ctx::from_app(app) {
        Ok(ctx) => {
            let filter = params.to_filter();
            let units = UnitBmc::list(ctx, filter).await.unwrap();
            let DateInfo {
                start_date,
                end_date,
            } = params.into();
            let ret = get_due_date_unit(&units, start_date, end_date);
            Ok(ret).into()
        }
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn get_interest_in_period(
    app: AppHandle<Wry>,
    params: UnitParams,
) -> IpcResponse<InterestInfo> {
    match Ctx::from_app(app) {
        Ok(ctx) => {
            let filter = params.to_filter();
            let units = UnitBmc::list(ctx, filter).await.unwrap();
            let DateInfo {
                start_date,
                end_date,
            } = params.into();
            let ret = get_interest(&units, start_date, end_date);
            Ok(ret).into()
        }
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
pub async fn backup_units(app: AppHandle<Wry>) -> IpcResponse<bool> {
    match Ctx::from_app(app) {
        Ok(ctx) => match do_backup_units(ctx).await {
            Ok(r) => Ok(r).into(),
            Err(e) => match e {
                Error::OAUTH() => Ok(false).into(),
                _ => Err(Error::CtxFail).into(),
            },
        },
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn restore_units(app: AppHandle<Wry>) -> IpcResponse<bool> {
    match Ctx::from_app(app) {
        Ok(ctx) => match do_restore_units(ctx).await {
            Ok(r) => Ok(r).into(),
            Err(e) => match e {
                Error::OAUTH() => Ok(false).into(),
                _ => Err(Error::CtxFail).into(),
            },
        },
        Err(_) => Err(Error::CtxFail).into(),
    }
}
