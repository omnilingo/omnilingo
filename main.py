#!/usr/bin/env python3

import os
import random
import csv
import sys
import re

import tqdm
import jieba
from flask import Flask, render_template, send_from_directory
from mutagen.mp3 import MP3

app = Flask(__name__, static_url_path="")

LANGUAGE = "fi"
PREFIX = "templates/cv-corpus-6.1-2020-12-11/" + LANGUAGE + "/"
CLIPS_DIR = PREFIX + "/clips/"
VALIDATED_CSV_PATH = PREFIX + "/validated.tsv"


def tokenize_sentence(question):
    if question["locale"].startswith("zh-"):
        return jieba.lcut(question["sentence"])
    else:
        return [
            x for x in re.split("(\\w+)", question["sentence"]) if x.strip()
        ]


def process_question(question):
    question["tokenized"] = tokenize_sentence(question)
    return question


def load_questions():
    questions = []
    with open(VALIDATED_CSV_PATH) as f:
        r = csv.reader(f, delimiter="\t")
        h = next(r)
        sys.stderr.write("Loading questions...\n")
        for row in tqdm.tqdm(r):
            question = dict(zip(h, row))
            mp3 = MP3(CLIPS_DIR + question["path"])
            question["audio_length"] = mp3.info.length
            question = process_question(question)
            questions.append(question)
        sys.stderr.write("Done loading.\n")
    return questions


questions = load_questions()


def select_clip(questions):
    return random.choice(questions)


@app.route("/get_clips")
def get_clips():
    selected_questions = []
    while len(selected_questions) < 3:
        selected_question = select_clip(questions)
        if selected_question not in selected_questions:
            selected_questions.append(selected_question)
    return {"questions": selected_questions}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/static/<path:path>")
def serve_static(path):
    return send_from_directory("templates", path)


if __name__ == "__main__":
    app.run(port=int(os.environ.get("FLASK_PORT", "5001")), host="0.0.0.0")
