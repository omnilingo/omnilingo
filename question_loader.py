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
from mutagen.mp3 import MP3
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
    return question


def get_mp3_length(mp3_path):
    if lengths_db is not None:
        sql = "SELECT length FROM mp3_lengths WHERE path=?"
        lengths_db.execute(sql, ["cv-corpus-6.1-2020-12-11/" + mp3_path])
        ret = float(lengths_db.fetchall()[0][0])
        return ret
    mp3 = MP3(PREFIX + mp3_path)
    return mp3.info.length


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
            question = dict(zip(h, row))
            mp3_path = language_name + "/clips/" + question["path"]
            #question["audio_length"] = get_mp3_length(mp3_path)
            #question["chars_sec"] = len(question["sentence"]) / float(
            #    question["audio_length"]
            #)
            question = process_question(question, word_frequency)
            questions.append(question)
        sys.stderr.write("Done loading.\n")

    # These are the various sorting schemes that could be used
    sorting_schemes = {}
    sorting_schemes["default"] = [(i, i) for i in range(0, len(questions))]
    sorting_schemes["length"] = [
        (i, len(j["sentence"])) for (i, j) in enumerate(questions)
    ]
    sorting_schemes["length"].sort(key=lambda x: x[1])

    print("[sorting_schemes]")
    print("default:", sorting_schemes["default"][0:10])
    print("length", sorting_schemes["length"][0:10])

    # FIXME: This is really slow...
    sys.stderr.write("Generating distractors.\n")
    distractors = get_distractors(word_frequency)

#    sys.stderr.write("Assigning distractors.\n")
#    for question in questions:
#        question["distractors"] = {}
#        for token in question["tokenized"]:
#            question["distractors"][token] = distractors[token]

    sys.stderr.write("Done.\n")

    return language_name, questions, word_frequency, sorting_schemes, distractors


def difficulty_function(question, word_frequency, most_common_word):
    chars_sec = question["chars_sec"]
    word_frequencies = [
        word_frequency[word] / most_common_word[1]
        for word in question["tokenized"]
    ]
    # if they speak fast, but use easy words
    if word_frequencies:
        return chars_sec * -min(word_frequencies)
    else:
        sys.stderr.write(
            "WTF: cannot calculate frequencies for question=%r\n" % question
        )
        return chars_sec


def load_all_languages(languages=None):
    word_frequency = collections.defaultdict(lambda: dict)
    most_common_word = collections.defaultdict(lambda: dict)
    questions = collections.defaultdict(lambda: dict)
    sorting_schemes = collections.defaultdict(lambda: dict)
    distractors = {}
    if languages is None:
        languages = [
            language.name for language in pathlib.Path(PREFIX).glob("*")
        ]
    with multiprocessing.Pool(4) as p:
        for lng, lng_questions, lng_word_frequency, lng_sorting, lng_distractors in p.map(
            load_questions, languages
        ):
            questions[lng] = lng_questions
            sorting_schemes[lng] = lng_sorting
            word_frequency[lng] = lng_word_frequency
            most_common_word[lng] = word_frequency[lng].most_common(1)[0]
            distractors[lng] = lng_distractors
    return languages, dict(questions), sorting_schemes, distractors


def regenerate_cache():
    languages, questions, sorting_schemes , distractors = load_all_languages()
    with gzip.open("cache/languages.pickle.gz", "wb") as languages_f:

        pickle.dump(languages, languages_f)
    for language in questions:
        with gzip.open(
            f"cache/questions__{language}.pickle.gz", "wb"
        ) as questions_f:
            sys.stderr.write("Saving the models...\n")
            pickle.dump(
                (questions[language], sorting_schemes[language], distractors[language]), questions_f
            )

    return languages, questions, sorting_schemes


def load_all_languages_cached():
    try:
        sys.stderr.write("Loading pre-cached question set...\n")
        with gzip.open("cache/languages.pickle.gz", "rb") as languages_f:
            languages = pickle.load(languages_f)
        print('[languages]', languages)
        questions = {}
        sorting_schemes = {}
        distractors = {}
        question_files = list(pathlib.Path("cache").glob("questions__*"))
        question_files = tqdm.tqdm(question_files)
        for path in question_files:
            with gzip.open(path, "rb") as questions_f:
                # extract whatever's between the __ and the extension
                language = path.name.split("__")[1].split(".")[0]
                (questions[language], sorting_schemes[language], distractors[language]) = pickle.load(
                    questions_f
                )
    except FileNotFoundError:
        try:
            os.mkdir("cache")
        except FileExistsError:
            pass
        languages, questions, sorting_schemes, distractors = regenerate_cache()
    return languages, questions, sorting_schemes, distractors


if __name__ == "__main__":
    regenerate_cache()
