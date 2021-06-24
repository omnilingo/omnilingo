"""Server for OmniLingo."""

from flask import Flask, send_file, send_from_directory
from flask_cors import CORS

APPLICATION = Flask("omnilingo", static_url_path="/client")
CORS(APPLICATION)
APPLICATION.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0  # For the index


@APPLICATION.route("/index.html")
def front():
    """Entrypoint for API."""
    return send_file("../client/index.html")


@APPLICATION.route("/favicon.ico")
def favicon():
    """Favicon for web brwosers."""
    return send_file("../client/favicon.ico")


@APPLICATION.route("/<path:path>")
def client(path):
    """Serve Javascript Client."""
    return send_from_directory("../client", path)


@APPLICATION.route("/indexes")
def indexes():
    """Serve language indexes."""
    return open("../static/indexes").read()


#    return send_from_directory("static", "indexes") # FIXME: Stop it caching


@APPLICATION.route("/index/<path:path>")
def index(path):
    """Index of static files."""
    return send_from_directory("../static/index/", path)


@APPLICATION.route("/static/<path:path>")
def serve_static(path):
    """Serve static assets."""
    return send_from_directory("../static", path)
