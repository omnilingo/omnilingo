#!/usr/bin/env python3
"""Flask Web Server for omnilingo."""

import os
from pathlib import Path

from flask import Flask, send_from_directory

app = Flask(__name__, static_url_path="/client")
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0  # For the index


@app.route("/index.html")
def front():
    """Entrypoint for API."""
    return send_from_directory("client", "index.html")


@app.route("/favicon.ico")
def favicon():
    """Favicon for web brwosers."""
    return send_from_directory("client", "favicon.ico")


@app.route("/<path:path>")
def client(path):
    """Serve Javascript Client."""
    return send_from_directory("client", path)


@app.route("/indexes")
def indexes():
    """Serve language indexes."""
    return open("static/indexes").read()


#    return send_from_directory("static", "indexes") # FIXME: Stop it caching


@app.route("/index/<path:path>")
def index(path):
    """Index of static files."""
    return send_from_directory("static/index/", path)


@app.route("/static/<path:path>")
def serve_static(path):
    """Serve static assets."""
    return send_from_directory("static", path)


if __name__ == "__main__":
    languages = [p.name for p in Path("cache/").glob("*")]
    print("[languages]", languages)
    app.run(port=int(os.environ.get("FLASK_PORT", "5001")), host="127.0.0.1")
