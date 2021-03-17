#!/usr/bin/env python3

import sys
import os

from lib import languages as codes
from pathlib import Path

from flask import Flask, send_from_directory
from flask import request

app = Flask(__name__, static_url_path="")


@app.route("/")
def front():
    return send_from_directory("client", "index.html")

@app.route("/favicon.ico")
def favicon():
    return send_from_directory("client", "favicon.ico")

@app.route("/client/<path:path>")
def client(path):
    return send_from_directory("client", path)

@app.route("/indexes")
def indexes():
    return {"indexes": indexes}

@app.route("/index/<path:path>")
def index(path):
    lines = [line.strip().split('\t') for line in open('cache/' + path).readlines()]
    return {"index": [[line[0], line[1], line[2], line[4], line[6]] for line in lines]}

@app.route("/static/<path:path>")
def serve_static(path):
    return send_from_directory("static", path)


if __name__ == "__main__":
    languages = [p.name for p in Path('cache/').glob('*')]
    print('[languages]', languages)
    indexes = {}
    for language in languages:
        indexes[language] = {}
        indexes[language]['display'] = codes.language_names[language]
        indexes[language]['size'] = os.path.getsize('cache/' + language)
    app.run(port=int(os.environ.get("FLASK_PORT", "5001")), host="127.0.0.1")
