#!/usr/bin/env python3

import random
import csv

import flask

app = flask.Flask(__name__)


def process_question(question):
    question["sentence"] = question["sentence"].split()
    return question


def load_questions():
    questions = []
    with open("cv-corpus-6.1-2020-12-11/fi/validated.tsv") as f:
        r = csv.reader(f, delimiter="\t")
        h = next(r)
        for row in r:
            question = dict(zip(h, row))
            question = process_question(question)
            questions.append(question)
    return questions


questions = load_questions()


@app.route("/get_clips")
def get_clips():
    return {"questions": [random.choice(questions) for x in range(3)]}


if __name__ == "__main__":
    app.run(port=5000, host="0.0.0.0")
