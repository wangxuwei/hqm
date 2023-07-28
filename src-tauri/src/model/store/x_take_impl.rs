//! XTakeImpl implementations for the surrealdb Object types.
//!
//! Note: Implement the `XTakeImpl' trait on objects, will provide the
//!       `XTake` trait (by blanket implementation)with `.x_take(key)`
//!        and `.x_take_val(key)`.

use crate::prelude::*;
use crate::utils::XTakeImpl;
use crate::Result;
use surrealdb::sql::Object;

#[macro_export]
macro_rules! bindable {
	($($t:ident),*) => {
		$(
            impl XTakeImpl<$t> for Object {
                fn x_take_impl(&mut self, k: &str) -> Result<Option<$t>> {
                    let v = self.remove(k).map(|v| W(v).try_into());
                    match v {
                        None => Ok(None),
                        Some(Ok(val)) => Ok(Some(val)),
                        Some(Err(ex)) => Err(ex),
                    }
                }
            }
		)*
	};
}

bindable!(String);

// Bind the boolean
bindable!(bool);
// Bind the numbers
// NOTE: Skipping u8, u16, u64 since not mapped by sqlx to postgres
bindable!(i8, i16, i32, i64, f32, f64);
