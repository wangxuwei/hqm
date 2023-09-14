//! Tauri IPC commands to bridge Unit Frontend Model Controller to Backend Model Controller
//!

use super::IpcResponse;
use crate::ipc::CreateParams;
use crate::model::{ModelMutateResultData, OAuthAccessForCreate, OAuthAccessForUpdate};
use crate::Error;
use crate::{ctx::Ctx, model::OAuthAccessBmc};
use chrono::{Duration, Local, SecondsFormat};
use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use tauri::{command, AppHandle, Wry};
use ts_rs::TS;

const GAP_SECS: u8 = 20;

#[skip_serializing_none]
#[derive(Serialize, Deserialize, TS, Debug, Clone)]
#[ts(export, export_to = "../src/bindings/")]
pub struct AccessConf {
    access_token: String,
    expires_in: i64,
}

#[command]
pub async fn store_access_token(
    app: AppHandle<Wry>,
    params: CreateParams<AccessConf>,
) -> IpcResponse<ModelMutateResultData> {
    match Ctx::from_app(app) {
        Ok(ctx) => {
            let token = OAuthAccessBmc::get_token(ctx.clone()).await;
            let at = match token {
                Ok(t) => {
                    OAuthAccessBmc::update(
                        ctx.clone(),
                        &t.id,
                        OAuthAccessForUpdate {
                            access_token: Some(params.data.access_token),
                            exipre_date: Some(
                                (Local::now()
                                    + Duration::seconds(params.data.expires_in - GAP_SECS as i64))
                                .to_rfc3339_opts(SecondsFormat::Millis, false),
                            ),
                        },
                    )
                    .await
                }
                Err(_) => {
                    OAuthAccessBmc::create(
                        ctx.clone(),
                        OAuthAccessForCreate {
                            access_token: params.data.access_token,
                            exipre_date: (Local::now()
                                + Duration::seconds(params.data.expires_in - GAP_SECS as i64))
                            .to_rfc3339_opts(SecondsFormat::Millis, false),
                        },
                    )
                    .await
                }
            };
            at.into()
        }
        Err(_) => Err(Error::CtxFail).into(),
    }
}
