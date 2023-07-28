//! TryFrom implementations for store related types

use crate::prelude::*;
use crate::{Error, Result};
use surrealdb::sql::{Array, Object, Value};

impl TryFrom<W<Value>> for Object {
    type Error = Error;
    fn try_from(val: W<Value>) -> Result<Object> {
        match val.0 {
            Value::Object(obj) => Ok(obj),
            _ => Err(Error::XValueNotOfType("Object")),
        }
    }
}

impl TryFrom<W<Value>> for Array {
    type Error = Error;
    fn try_from(val: W<Value>) -> Result<Array> {
        match val.0 {
            Value::Array(obj) => Ok(obj),
            _ => Err(Error::XValueNotOfType("Array")),
        }
    }
}

#[macro_export]
macro_rules! try_from_value_int {
	($($t:ident),*) => {
		$(
            impl TryFrom<W<Value>> for $t {
                type Error = Error;
                fn try_from(val: W<Value>) -> Result<$t> {
                    match val.0 {
                        Value::Number(obj) => Ok(obj.as_int() as $t),
                        _ => Err(Error::XValueNotOfType("$t")),
                    }
                }
            }
		)*
	};
}

#[macro_export]
macro_rules! try_from_value_float {
	($($t:ident),*) => {
		$(
            impl TryFrom<W<Value>> for $t {
                type Error = Error;
                fn try_from(val: W<Value>) -> Result<$t> {
                    match val.0 {
                        Value::Number(obj) => Ok(obj.as_float() as $t),
                        _ => Err(Error::XValueNotOfType("$t")),
                    }
                }
            }
		)*
	};
}

try_from_value_int!(i8, i16, i32, i64);
try_from_value_float!(f32, f64);

impl TryFrom<W<Value>> for bool {
    type Error = Error;
    fn try_from(val: W<Value>) -> Result<bool> {
        match val.0 {
            Value::False => Ok(false),
            Value::True => Ok(true),
            _ => Err(Error::XValueNotOfType("bool")),
        }
    }
}

impl TryFrom<W<Value>> for String {
    type Error = Error;
    fn try_from(val: W<Value>) -> Result<String> {
        match val.0 {
            Value::Strand(strand) => Ok(strand.as_string()),
            Value::Thing(thing) => Ok(thing.to_string()),
            _ => Err(Error::XValueNotOfType("String")),
        }
    }
}
