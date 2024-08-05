//! model module and sub-modules contain all of the model types and
//! backend model controllers for the application.
//!
//! The application code call the model controllers, and the
//! model controller calls the store and fire model events as appropriate.
//!

use crate::ctx::Ctx;
use crate::event::HubEvent;
use serde::Serialize;
use store::SurrealStore;
use ts_rs::TS;

mod bmc_base;
mod model_store;
mod oauth_access;
mod store;
mod unit;
mod unit_budget;

// --- Re-exports
pub use model_store::*;
pub use oauth_access::*;
pub use unit::*;
pub use unit_budget::*;

// region:    --- Model Event

fn fire_model_event<D>(ctx: &Ctx, entity: &str, action: &str, data: D)
where
    D: Serialize + Clone,
{
    ctx.emit_hub_event(HubEvent {
        hub: "Model".to_string(),
        topic: entity.to_string(),
        label: Some(action.to_string()),
        data: Some(data),
    });
}

// endregion: --- Model Event

// region:    --- Common Model Result Data

/// For now, all mutation queries will return an {id} struct.
/// Note: Keep it light, and client can do a get if needed.
#[derive(TS, Serialize, Clone)]
#[ts(export, export_to = "../src/bindings/")]
pub struct ModelMutateResultData {
    pub id: String,
}

impl From<String> for ModelMutateResultData {
    fn from(id: String) -> Self {
        Self { id }
    }
}

// endregion: --- Common Model Result Data

// region:    --- Tests
#[cfg(test)]
mod tests {
    use crate::model::{ModelStore, UnitFilter};
    use modql::{
        filter::{FilterNodes, IntoFilterNodes, OpValString, OpValsString},
        ListOptions,
    };

    #[derive(Debug, FilterNodes)]
    struct ProjectFilter {
        id: Option<OpValsString>,
    }

    #[test]
    fn test_simple() -> anyhow::Result<()> {
        let pf = ProjectFilter {
            id: Some(OpValString::Eq("hello".to_string()).into()),
        };
        println!("{pf:?}");
        Ok(())
    }

    #[tokio::test]
    async fn test_fileter() -> anyhow::Result<()> {
        let filter = UnitFilter {
            id: Some(OpValString::Eq("unit:3ui1vlqxap8rz4l93rme".to_string()).into()),
            name: None,
        };
        let store = ModelStore::new().await?;
        let objects = store
            .store()
            .exec_select(
                "unit",
                Some(filter.filter_nodes(None)),
                ListOptions::default(),
            )
            .await?;
        println!("{:?}", objects);
        Ok(())
    }
}
// endregion: --- Tests
