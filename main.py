#!/usr/bin/env python3

import os
import random
import csv
import sys
import re
import collections

import tqdm
import jieba
from flask import Flask, render_template, send_from_directory
from flask import request
from mutagen.mp3 import MP3

app = Flask(__name__, static_url_path="")


def tokenize_sentence(question):
    if question["locale"].startswith("zh-"):
        return jieba.lcut(question["sentence"])
    else:
        return [
            x for x in re.split("(\\w+)", question["sentence"]) if x.strip()
        ]


def process_question(question, word_frequency):
    words = tokenize_sentence(question)
    for word in words:
        word_frequency[word] += 1
    question["tokenized"] = words
    return question


def load_questions():
    questions = []
    word_frequency = collections.Counter()
    with open(VALIDATED_CSV_PATH, encoding="utf8") as f:
        r = csv.reader(f, delimiter="\t")
        h = next(r)
        sys.stderr.write("Loading questions...\n")
        for row in tqdm.tqdm(r):
            question = dict(zip(h, row))
            mp3 = MP3(CLIPS_DIR + question["path"])
            question["audio_length"] = mp3.info.length
            question["chars_sec"] = len(question["sentence"]) / float(
                question["audio_length"]
            )
            question = process_question(question, word_frequency)
            questions.append(question)
        sys.stderr.write("Done loading.\n")
    return questions, word_frequency


def select_clip(questions):
    return random.choice(questions)


@app.route("/get_clips")
def get_clips():
    nlevels = request.args.get("nlevels", default=10, type=int)
    level = request.args.get("level", default=1, type=int)
    selected_questions = []
    partition_size = len(questions) // nlevels
    print("partition_size:", partition_size)
    print("slice:", partition_size * (level - 1), ":", partition_size * level)
    partition = questions[
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


@app.route("/static/<path:path>")
def serve_static(path):
    return send_from_directory("templates", path)


def difficulty_function(question, word_frequency, most_common_word):
    chars_sec = question["chars_sec"]
    word_freq_sum = sum(
        [
            word_frequency[word] / most_common_word[1]
            for word in question["tokenized"]
        ]
    )
    return chars_sec * word_freq_sum


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("./main.py [language code]", file=sys.stderr)
        sys.exit(-1)

    LANGUAGE = sys.argv[1]
    PREFIX = "templates/cv-corpus-6.1-2020-12-11/" + LANGUAGE + "/"
    CLIPS_DIR = PREFIX + "/clips/"
    VALIDATED_CSV_PATH = PREFIX + "/validated.tsv"

    questions, word_frequency = load_questions()
    most_common_word = word_frequency.most_common(1)[0]
    questions.sort(
        key=lambda question: difficulty_function(
            question, word_frequency, most_common_word
        )
    )

    app.run(port=int(os.environ.get("FLASK_PORT", "5001")), host="0.0.0.0")
