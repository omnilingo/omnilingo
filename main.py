#!/usr/bin/env python3

import sys
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
    tipus = request.args.get("type", default="blank", type=str)
    sorting = request.args.get("sorting", default="difficulty", type=str)
    selected_questions = []
    print(questions.keys())
    sorting_scheme = []
    if language not in sorting_schemes:
        language = "fi"
    if sorting == "length":
        sorting_scheme = sorting_schemes[language]['length']
    else:
        sorting_scheme = sorting_schemes[language]['default']
    print("[first_n]", sorting_scheme[0:9])
    partition_size = len(sorting_scheme) // nlevels
    print("[partition_size]", partition_size)
    print("[slice]", partition_size * (level - 1), ":", partition_size * level)
    partition = sorting_scheme[
        partition_size * (level - 1) : partition_size * level
    ]
    ds = {}
    while len(selected_questions) < 3:
        clip = select_clip(partition)
        selected_question = questions[language][clip[0]]
        print('[selected_question]', clip, '||',  selected_question)
        if selected_question not in selected_questions:
            selected_questions.append(selected_question)
        if tipus == "choice" or tipus == "search":
            for tok in selected_question["tokenized"]:
                ds[tok] = [i[1] for i in distractors[language][tok] if not i[1].lower() == tok.lower()][1:]
        
    if tipus == "choice" or tipus == "search":
        return {"questions": selected_questions, "distractors": ds}
    else: 
        return {"questions": selected_questions}

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/get_languages")
def get_languages():
    return {"languages": list(languages)}


@app.route("/static/<path:path>")
def serve_static(path):
    return send_from_directory("templates", path)


if __name__ == "__main__":

    languages, questions, sorting_schemes, distractors = question_loader.load_all_languages_cached()
    app.run(port=int(os.environ.get("FLASK_PORT", "5001")), host="127.0.0.1")
