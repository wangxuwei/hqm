//! All model and controller for the Item type
//!

use super::bmc_base::{bmc_create, bmc_list, bmc_update};
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

// region:    --- OAuthAccess

#[skip_serializing_none]
#[derive(Serialize, TS, Debug, Clone)]
#[ts(export, export_to = "../src/bindings/")]
pub struct OAuthAccess {
    pub id: String,
    pub access_token: String,
    pub exipre_date: String,
}

impl TryFrom<Object> for OAuthAccess {
    type Error = Error;
    fn try_from(mut val: Object) -> Result<OAuthAccess> {
        let oauth_access = OAuthAccess {
            id: val.x_take_val("id")?,
            access_token: val.x_take_val("access_token")?,
            exipre_date: val.x_take_val("exipre_date")?,
        };

        Ok(oauth_access)
    }
}

// endregion: --- OAuthAccess

// region:    --- OAuthAccessForCreate

#[skip_serializing_none]
#[derive(Deserialize, TS, Debug)]
#[ts(export, export_to = "../src/bindings/")]
pub struct OAuthAccessForCreate {
    pub access_token: String,
    pub exipre_date: String,
}

impl From<OAuthAccessForCreate> for Value {
    fn from(val: OAuthAccessForCreate) -> Self {
        let data: BTreeMap<String, Value> = map![
            "access_token".into() => val.access_token.into(),
            "exipre_date".into() => val.exipre_date.into()
        ];
        Value::Object(data.into())
    }
}

impl Creatable for OAuthAccessForCreate {}

// endregion: --- OAuthAccessForCreate

// region:    --- OAuthAccessForUpdate

#[skip_serializing_none]
#[derive(Deserialize, TS, Debug)]
#[ts(export, export_to = "../src/bindings/")]
pub struct OAuthAccessForUpdate {
    // 会ID
    pub access_token: Option<String>,
    // 标时间
    pub exipre_date: Option<String>,
}

impl From<OAuthAccessForUpdate> for Value {
    fn from(val: OAuthAccessForUpdate) -> Self {
        let mut data = BTreeMap::new();
        if let Some(access_token) = val.access_token {
            data.insert("access_token".into(), access_token.into());
        }
        if let Some(exipre_date) = val.exipre_date {
            data.insert("exipre_date".into(), exipre_date.into());
        }
        Value::Object(data.into())
    }
}

impl Patchable for OAuthAccessForUpdate {}

// endregion: --- OAuthAccessForUpdate

// region:    --- OAuthAccessFilter

#[derive(FilterNodes, Deserialize, Debug)]
pub struct OAuthAccessFilter {
    pub expire_date: Option<OpValsString>,
}

impl Filterable for OAuthAccessFilter {}

// endregion: --- OAuthAccessFilter

// region:    --- OAuthAccessBmc

pub struct OAuthAccessBmc;

impl OAuthAccessBmc {
    const ENTITY: &'static str = "oauth_access";

    // pub async fn get(ctx: Arc<Ctx>, id: &str) -> Result<OAuthAccess> {
    //     bmc_get::<OAuthAccess>(ctx, Self::ENTITY, id).await
    // }

    pub async fn get_token(ctx: Arc<Ctx>) -> Result<OAuthAccess> {
        let access_tokens = OAuthAccessBmc::list(ctx, None).await;
        match access_tokens {
            Ok(tokens) => {
                if tokens.is_empty() {
                    Err(Error::OAUTH())
                } else {
                    Ok(tokens[0].clone())
                }
            }
            Err(e) => Err(e),
        }
    }

    pub async fn create(
        ctx: Arc<Ctx>,
        data: OAuthAccessForCreate,
    ) -> Result<ModelMutateResultData> {
        bmc_create(ctx, Self::ENTITY, data).await
    }

    pub async fn update(
        ctx: Arc<Ctx>,
        id: &str,
        data: OAuthAccessForUpdate,
    ) -> Result<ModelMutateResultData> {
        bmc_update(ctx, Self::ENTITY, id, data).await
    }

    // pub async fn delete(ctx: Arc<Ctx>, id: &str) -> Result<ModelMutateResultData> {
    //     bmc_delete(ctx, Self::ENTITY, id).await
    // }

    pub async fn list(
        ctx: Arc<Ctx>,
        filter: Option<OAuthAccessFilter>,
    ) -> Result<Vec<OAuthAccess>> {
        let opts = ListOptions {
            limit: None,
            offset: None,
            order_bys: Some("!id".into()),
        };
        bmc_list(ctx, Self::ENTITY, filter, opts).await
    }
}

// endregion: --- OAuthAccessBmc
