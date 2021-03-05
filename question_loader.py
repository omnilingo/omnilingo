#!/usr/bin/env python3

import csv
import sys
import collections
import multiprocessing
import pathlib
import random
import pickle
import gzip
import os
import sqlite3

import tqdm
from distractors import get_distractors
from tokenisers import tokenise

PREFIX = "templates/cv-corpus-6.1-2020-12-11/"


if "LENGTHS_SQLITE_PATH" in os.environ:
    lengths_db = sqlite3.connect(os.environ["LENGTHS_SQLITE_PATH"]).cursor()
else:
    lengths_db = None


def tokenize_sentence(question):
    return tokenise(question["sentence"], lang=question["locale"])


def process_question(question, word_frequency):
    words = tokenize_sentence(question)
    for word in words:
        word_frequency[word] += 1
    question["tokenized"] = words
    question["sentence_len"] = len(question["sentence"])
    del question["sentence"]
    return question


def load_questions(language_name):
    questions = []
    word_frequency = collections.Counter()
    distractors = {}
    with open(PREFIX + language_name + "/validated.tsv") as f:
        r = csv.reader(f, delimiter="\t")
        h = next(r)
        sys.stderr.write("Loading %r...\n" % language_name)
        rows = list(r)
        if "QUESTION_COUNT_LIMIT" in os.environ:
            random.shuffle(rows)
            rows = rows[: int(os.environ["QUESTION_COUNT_LIMIT"])]
        for row in tqdm.tqdm(rows):
            question = {
                k: v
                for k, v in zip(h, row)
                if k in ["path", "locale", "sentence"]
            }
            question = process_question(question, word_frequency)
            questions.append(question)
        sys.stderr.write("Done loading.\n")

    # These are the various sorting schemes that could be used
    sorting_schemes = {}
    sorting_schemes["default"] = [(i) for i in range(len(questions))]
    sorting_schemes["length"] = [(i) for i in range(len(questions))]
    sorting_schemes["length"].sort(key=lambda x: questions[x]["sentence_len"])

    words = collections.Counter(
        {x: word_frequency[x] for x in word_frequency if word_frequency[x] > 5}
    )
    # FIXME: This is really slow...
    sys.stderr.write(
        "%sGenerating distractors for %d input words.\n"
        % (language_name, len(word_frequency))
    )
    distractors = get_distractors(words)

    sys.stderr.write("%s: Assigning distractors.\n" % language_name)
    for question in questions:
        question["distractors"] = {}
        for token in question["tokenized"]:
            if len(distractors[token]) > 0:
                question["distractors"][token] = distractors[token]

    assigned = sum(1 for x in distractors if distractors[x])
    sys.stderr.write(
        "%s: Done. Assigned distractors for %d out of %d words (%0.2f%%).\n"
        % (
            language_name,
            assigned,
            len(words),
            (assigned / len(words) * 100) if len(words) else 0,
        )
    )

    return language_name, questions, sorting_schemes


def load_all_languages(languages=None):
    questions = collections.defaultdict(lambda: dict)
    sorting_schemes = collections.defaultdict(lambda: dict)
    if languages is None:
        languages = [
            language.name for language in pathlib.Path(PREFIX).glob("*")
        ]
    with multiprocessing.Pool(4) as p:
        for lng, lng_questions, lng_sorting in p.map(
            load_questions, languages
        ):
            questions[lng] = lng_questions
            sorting_schemes[lng] = lng_sorting
    return dict(questions), sorting_schemes


def regenerate_cache():
    questions, sorting_schemes = load_all_languages()
    try:
        pathlib.Path("cache").mkdir()
    except FileExistsError:
        pass
    for language in questions:
        with gzip.open(
            f"cache/questions__{language}.pickle.gz", "wb"
        ) as questions_f:
            sys.stderr.write("Saving the models...\n")
            pickle.dump(
                (questions[language], sorting_schemes[language]), questions_f
            )

    return questions, sorting_schemes


def load_all_languages_cached():
    try:
        sys.stderr.write("Loading pre-cached question set...\n")
        questions = {}
        sorting_schemes = {}
        question_files = list(pathlib.Path("cache").glob("questions__*"))
        question_files = tqdm.tqdm(question_files)
        for path in question_files:
            with gzip.open(path, "rb") as questions_f:
                # extract whatever's between the __ and the extension
                language = path.name.split("__")[1].split(".")[0]
                (questions[language], sorting_schemes[language]) = pickle.load(
                    questions_f
                )
    except FileNotFoundError:
        try:
            pathlib.Path("cache").mkdir()
        except FileExistsError:
            pass
        questions, sorting_schemes = regenerate_cache()
    return list(questions.keys()), questions, sorting_schemes


if __name__ == "__main__":
    regenerate_cache()
