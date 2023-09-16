use crate::{
    ctx::Ctx,
    ipc::service::{convert_units, parse_units},
    model::{OAuthAccessBmc, UnitBmc},
    Error,
};
use chrono::{DateTime, Local};
use reqwest::{
    multipart::{Form, Part},
    Client,
};
use serde_json::{Map, Value};
use std::str::FromStr;
use std::{borrow::Cow, collections::HashMap, sync::Arc};
use urlencoding::encode;

async fn get_valid_token(ctx: Arc<Ctx>) -> Result<String, Error> {
    let token = OAuthAccessBmc::get_token(ctx.clone()).await?;

    let expired_date = token.exipre_date;
    match DateTime::<Local>::from_str(&expired_date) {
        Ok(v) => {
            let now = Local::now();
            if v > now {
                return Ok(token.access_token);
            }
            Err(Error::OAUTH())
        }
        Err(_e) => Err(Error::OAUTH()),
    }
}

pub async fn backup_units(ctx: Arc<Ctx>) -> Result<bool, Error> {
    let token = get_valid_token(ctx.clone()).await?;
    let now = Local::now().naive_local();
    let filename = format!("units_{}.json", now.format("%Y-%m-%d-%H-%M-%S"));
    let units = UnitBmc::list(ctx.clone(), None).await?;
    let json_obj = convert_units(&units);
    let json_str = serde_json::to_string_pretty(&json_obj)?;
    // do sync
    let file_byte = json_str.as_bytes().to_vec();
    // 一定要有file_name方法，且参数不能为空，否则数据上传失败
    let part = Part::bytes(Cow::from(file_byte)).file_name(filename.clone());
    let form = Form::new().part("file", part);
    Client::new()
                .post(format!(
                    "https://d.pcs.baidu.com/rest/2.0/pcs/file?method=upload&access_token={}&ondup=overwrite&path=/apps/工具管理/{}",
                    token,
                    filename
                ))
                .multipart(form)
                .send()
                // FIXME, baidu http(一般也不会panic)错误返回好像没有panic！，是否处理, 错误吗“31064”-上传路径权限
                .await
                .unwrap();
    Ok(true)
}

pub async fn restore_units(ctx: Arc<Ctx>) -> Result<bool, Error> {
    let token = get_valid_token(ctx.clone()).await?;
    // FIXME, put info in common conf
    let url = format!("https://pan.baidu.com/rest/2.0/xpan/file?method=list&dir={}&order=time&start=0&limit=1&desc=1&access_token={}", encode("/apps/工具管理"),token);
    let resp = Client::new()
        .get(url)
        .header("User-Agent", "pan.baidu.com")
        .send()
        .await
        .unwrap()
        .json::<HashMap<String, Value>>()
        .await
        .unwrap();

    let file_list = resp.get("list").unwrap().as_array().unwrap();
    if file_list.is_empty() {
        println!("no restore files, ignored");
        return Ok(true);
    }

    let file_info: &Map<String, Value> = file_list[0].as_object().unwrap();

    // get dlink
    let fs_str = format!("[{}]", file_info["fs_id"].as_i64().unwrap());
    let url = format!("http://pan.baidu.com/rest/2.0/xpan/multimedia?method=filemetas&thumb=1&dlink=1&extra=1&fsids={}&access_token={}", encode(fs_str.as_str()),token);
    let resp = Client::new()
        .get(url)
        .header("User-Agent", "pan.baidu.com")
        .send()
        .await
        .unwrap()
        .json::<HashMap<String, Value>>()
        .await
        .unwrap();

    let file_list = resp.get("list").unwrap().as_array().unwrap();
    if file_list.is_empty() {
        println!("no restore files, ignored");
        return Ok(true);
    }

    let file_info: &Map<String, Value> = file_list[0].as_object().unwrap();

    // download
    let dlink = file_info["dlink"].as_str().unwrap();
    let url = format!("{}&access_token={}", dlink, token);
    let resp = Client::new()
        .get(url)
        .header("User-Agent", "pan.baidu.com")
        .send()
        .await
        .unwrap()
        .bytes()
        .await
        .unwrap();

    let json_str = String::from_utf8(resp.to_vec()).unwrap();

    let units = parse_units(&json_str);
    for u in units {
        // FIXME: batch create
        UnitBmc::create(ctx.clone(), u).await.unwrap();
    }

    Ok(true)
}
