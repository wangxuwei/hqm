use crate::{
    ipc::{store_access_token, AccessConf, CreateParams},
    utils::map,
};
use std::{
    collections::BTreeMap,
    io::prelude::*,
    net::{TcpListener, TcpStream},
};
use tauri::{AppHandle, Manager};
use tokio::runtime::Runtime;
use url::Url;

pub fn start_server(handle: AppHandle) {
    // FIXME conf
    let listener = TcpListener::bind("127.0.0.1:6128").unwrap();
    for stream in listener.incoming() {
        let stream = stream.unwrap();
        handle_connection(stream, handle.clone());
    }
}

fn handle_connection(mut stream: TcpStream, handle: AppHandle) {
    let status_line = "HTTP/1.1 200 OK";

    let mut buffer = [0; 4048];
    if let Err(io_err) = stream.read(&mut buffer) {
        println!("Error reading incoming connection: {}", io_err);
    };

    let mut headers = [httparse::EMPTY_HEADER; 16];
    let mut request = httparse::Request::new(&mut headers);
    request.parse(&buffer).ok();

    let path = request.path.unwrap_or_default();
    let mut content_type = "text/html";
    let contents = if path.starts_with("/cb") {
        // FIXM store token, need to move outside for the window logic
        let mut url = String::new();
        for header in &headers {
            if header.name == "Full-Url" {
                url = String::from_utf8_lossy(header.value).to_string();
                break;
            }
        }

        if !url.is_empty() {
            let access_conf = get_token(url);
            Runtime::new().unwrap().block_on(store_access_token(
                handle.clone(),
                CreateParams {
                    data: access_conf.clone(),
                },
            ));
            // send event to close window
            let win = handle.get_window("oauth_login");
            if let Some(login_window) = win {
                login_window
                    .emit::<BTreeMap<String, String>>(
                        "SEND_OAUTH_TOKEN",
                        map!["oauth".into() => access_conf.access_token],
                    )
                    .unwrap();
            }
        }
        content_type = "application/json";
        "Success"
    } else {
        // FIXME to config
        r#"
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <link rel="icon" type="image/svg+xml" href="/vite.svg" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>hqm-登录成功</title>
        </head>

        <body>
            <div style="text-align:center"><br/><h1>登录成功</h1><br/></div>
            <script>
                fetch("http://localhost:6128/cb",{
                    headers:{
                        "Full-Url":window.location.href
                    }
                });
                
            </script>
        </body>
        </html>
        "#
    };

    let length = contents.len();
    let response = format!("{status_line}\r\nContent-Length: {length}\r\nContent-Type:{content_type}\r\n\r\n{contents}\r\n\r\n");
    stream.write_all(response.as_bytes()).unwrap();
}

fn get_token(url: String) -> AccessConf {
    // FIXME 防止错误
    let parsed = Url::parse(&url).unwrap();
    let hash = parsed.fragment().unwrap();
    let mut access_token = String::new();
    let mut expires_in = 0;
    hash.split('&').for_each(|pstr| {
        let a: Vec<&str> = pstr.split('=').collect();
        if a[0] == "access_token" {
            access_token = a[1].to_string();
        } else if a[0] == "expires_in" {
            expires_in = a[1].parse().unwrap();
        }
    });

    AccessConf {
        access_token,
        expires_in: expires_in as i64,
    }
}
