// #![allow(unused)]

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// -- Re-Exports
pub use error::{Error, Result};

// -- Imports
use crate::server::start_server;
use model::ModelStore;
use std::{sync::Arc, thread};

// -- Sub-Modules
mod ctx;
mod error;
mod event;
mod ipc;
mod model;
mod prelude;
mod server;
mod unit;
mod utils;

#[tokio::main]
async fn main() -> Result<()> {
    // FIXME, only for debug
    // OsLogger::new("com.friping.hqm")
    //     .level_filter(LevelFilter::Info)
    //     .init()
    //     .unwrap();

    let model_manager = ModelStore::new().await?;
    let model_manager = Arc::new(model_manager);

    tauri::Builder::default()
        .manage(model_manager)
        .setup(|app: &mut tauri::App| {
            let handle = app.handle();
            thread::spawn(move || {
                // start web server
                start_server(handle);
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Unit
            ipc::get_unit,
            ipc::create_unit,
            ipc::update_unit,
            ipc::delete_unit,
            ipc::list_units,
            ipc::import_units,
            ipc::export_units,
            ipc::backup_units,
            ipc::restore_units,
            ipc::get_payment_in_period,
            ipc::get_valid_left_income,
            ipc::get_due_date_units_in_peroid,
            ipc::get_interest_in_period,
            ipc::get_unit_timeline,
            ipc::list_valid_time_units,
            // UnitBudget
            ipc::get_unit_budget,
            ipc::create_unit_budget,
            ipc::update_unit_budget,
            ipc::delete_unit_budget,
            ipc::list_unit_budgets,
            // oauth
            ipc::store_access_token
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
