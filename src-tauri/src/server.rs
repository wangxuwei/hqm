use std::{
    fs,
    io::prelude::*,
    net::{TcpListener, TcpStream},
    path::Path,
};

pub fn start_server(dist_dir: &str) {
    // FIXME conf
    let listener = TcpListener::bind("127.0.0.1:6128").unwrap();
    for stream in listener.incoming() {
        let stream = stream.unwrap();
        handle_connection(stream, dist_dir);
    }
}

fn handle_connection(mut stream: TcpStream, base_path: &str) {
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
    let contents = if path.starts_with("/assets") {
        let filename = Path::new(path).file_name().unwrap().to_str().unwrap();
        content_type = "text/javascript";
        fs::read_to_string(format!("{base_path}/assets/{}", filename)).unwrap()
    } else {
        fs::read_to_string(format!("{base_path}/oauth.html")).unwrap()
    };

    let length = contents.len();
    let response = format!("{status_line}\r\nContent-Length: {length}\r\nContent-Type:{content_type}\r\n\r\n{contents}\r\n\r\n");
    stream.write_all(response.as_bytes()).unwrap();
}
