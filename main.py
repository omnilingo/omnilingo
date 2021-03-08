#!/usr/bin/env python3

import sys
import os
import random
import re
import question_loader

from flask import Flask, render_template, send_from_directory
from flask import request

app = Flask(__name__, static_url_path="")


def select_clip(questions):
    return random.choice(questions)

# The backend needs to select a task between the ones that the user has enabled
# then return a clip and relevant data (question + distractors)

@app.route("/get_clips") # This should be get clip 
def get_clips():
    print('======================================================================')
    MAX_LENGTH = 18

    enabled = request.args.get("enabled", default='blank|choice|scramble|search', type=str)
    task_type = random.choice(enabled.split('|'))
    nlevels = request.args.get("nlevels", default=10, type=int)
    ngaps = request.args.get("ngaps", default=1, type=int)
    level = request.args.get("level", default=1, type=int)
    language = request.args.get("language", default="fi", type=str)
    print('[task_type]', task_type)
    sorting_scheme = []

    if language not in sorting_schemes:
        language = "fi"

    partition = []
    # For the scramble task it seems to be better to have a limited size
    # in terms of length, this can be improved later to take into account
    # frequency for datasets where there are more shorter items.
    if task_type == "scramble":
        sorting_scheme = sorting_schemes[language]['length']
        print("[first_n]", sorting_scheme[0:9])
        partition = [i for i in sorting_scheme if i[1] < MAX_LENGTH]
        print("[slice] 0 :", len(partition))
    else:
        # FIXME: Replace this with difficulty-based sorting
        sorting_scheme = sorting_schemes[language]['default']
        print("[first_n]", sorting_scheme[0:9])
        partition_size = len(sorting_scheme) // nlevels
        print("[partition_size]", partition_size)
        print("[slice]", partition_size * (level - 1), ":", partition_size * level)
        partition = sorting_scheme[
            partition_size * (level - 1) : partition_size * level
        ]

    ds = {}
    clip = select_clip(partition)
    selected_question = questions[language][clip[0]]
    print('[selected_question]', clip, '||',  selected_question)
    if task_type == "choice" or task_type == "search":
        for (i, tok) in enumerate(selected_question["tokenized"]):
            d = []
            for j in distractors[language][tok]:
                print(j)
                if j[1].lower() != tok.lower() and re.match('\w+', tok):
                    d.append(j[1])
            if len(d) != 0:
                ds[i] = d
                print(i, tok, ds[i]) 

    if len(ds.items()) < 1:
        # If we didn't find any distractors then we can't generate a choice/search task
        print('[ERROR] No distractors:', ds)
        if len(selected_question["sentence"]) < MAX_LENGTH:
            task_type = random.choice(["blank", "scramble"])
        else:
            task_type = "blank"
        print('[ERROR] len:', len(selected_question["sentence"]), ', selected', task_type)
  
    gap = -1
    if task_type == "choice" or task_type == "search":
        gap = random.choice([i for i in ds.keys()])
        print('[distractor]', ds[gap])
        return {"question": selected_question, "gap": gap, "distractor": ds[gap], "task_type": task_type}
    else:
        gap = random.randint(0, len(selected_question["tokenized"]) - 1)
        val = re.match('\w+', selected_question["tokenized"][gap])
        while not val:
            gap = random.randint(0, len(selected_question["tokenized"]) - 1)
            val = re.match('\w+', selected_question["tokenized"][gap])
        return {"question": selected_question, "gap": gap, "task_type": task_type}

    # Work out a way of encoding gaps + distractors here      
    # distractorsForGaps = {3: ["the", "he"], "2": ["cat", "bat"]}

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
