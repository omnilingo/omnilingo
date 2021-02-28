#!/usr/bin/env python3

import os
import random
import question_loader

from flask import Flask, render_template, send_from_directory
from flask import request

app = Flask(__name__, static_url_path="")


def select_clip(questions):
    return random.choice(questions)


@app.route("/get_clips")
def get_clips():
    nlevels = request.args.get("nlevels", default=10, type=int)
    level = request.args.get("level", default=1, type=int)
    language = request.args.get("language", default="fi", type=str)
    selected_questions = []
    partition_size = len(questions[language]) // nlevels
    print("partition_size:", partition_size)
    print("slice:", partition_size * (level - 1), ":", partition_size * level)
    partition = questions[language][
        partition_size * (level - 1) : partition_size * level
    ]
    while len(selected_questions) < 3:
        selected_question = select_clip(partition)
        if selected_question not in selected_questions:
            selected_questions.append(selected_question)
    return {"questions": selected_questions}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/get_languages")
def get_languages():
    return list(languages)


@app.route("/static/<path:path>")
def serve_static(path):
    return send_from_directory("templates", path)


if __name__ == "__main__":

    languages, questions = question_loader.load_all_languages_cached()
    app.run(port=int(os.environ.get("FLASK_PORT", "5001")), host="0.0.0.0")
