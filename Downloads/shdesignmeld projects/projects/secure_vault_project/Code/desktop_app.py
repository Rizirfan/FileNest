#!/usr/bin/env python3
import socket
import threading

import webview
from werkzeug.serving import make_server

from app import app


class FlaskServerThread(threading.Thread):
    def __init__(self, flask_app, host: str, port: int):
        super().__init__(daemon=True)
        self.server = make_server(host, port, flask_app)
        self.context = flask_app.app_context()
        self.context.push()

    def run(self):
        self.server.serve_forever()

    def shutdown(self):
        self.server.shutdown()
        self.context.pop()


def get_available_port(preferred_port: int = 5000) -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind(("127.0.0.1", preferred_port))
            return preferred_port
        except OSError:
            sock.bind(("127.0.0.1", 0))
            return sock.getsockname()[1]


def main():
    host = "127.0.0.1"
    port = get_available_port(5000)

    app.config["DEBUG"] = False
    app.config["TESTING"] = False

    server = FlaskServerThread(app, host, port)
    server.start()

    app_url = f"http://{host}:{port}/login"
    webview.create_window("FileNest", app_url, width=1280, height=820, min_size=(960, 640))

    try:
        webview.start()
    finally:
        server.shutdown()


if __name__ == "__main__":
    main()
