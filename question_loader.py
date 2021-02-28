#!/usr/bin/env python3

import csv
import sys
import re
import collections
import pathlib
import pickle
import gzip

import tqdm
import jieba
from mutagen.mp3 import MP3

PREFIX = "templates/cv-corpus-6.1-2020-12-11/"


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


def load_questions(language_name):
    questions = []
    word_frequency = collections.Counter()
    with open(PREFIX + language_name + "/validated.tsv") as f:
        r = csv.reader(f, delimiter="\t")
        h = next(r)
        sys.stderr.write("Loading %r...\n" % language_name)
        for row in tqdm.tqdm(r):
            question = dict(zip(h, row))
            mp3 = MP3(PREFIX + language_name + "/clips/" + question["path"])
            question["audio_length"] = mp3.info.length
            question["chars_sec"] = len(question["sentence"]) / float(
                question["audio_length"]
            )
            question = process_question(question, word_frequency)
            questions.append(question)
        sys.stderr.write("Done loading.\n")
    return questions, word_frequency


def difficulty_function(question, word_frequency, most_common_word):
    chars_sec = question["chars_sec"]
    word_frequencies = [
        word_frequency[word] / most_common_word[1]
        for word in question["tokenized"]
    ]
    return chars_sec * -min(word_frequencies)


def load_all_languages(languages=None):
    word_frequency = collections.defaultdict(lambda: dict)
    most_common_word = collections.defaultdict(lambda: dict)
    questions = collections.defaultdict(lambda: dict)
    if languages is None:
        languages = [
            language.name for language in pathlib.Path(PREFIX).glob("*")
        ]
    for lng in languages:
        questions[lng], word_frequency[lng] = load_questions(lng)
        most_common_word[lng] = word_frequency[lng].most_common(1)[0]
        questions[lng].sort(
            key=lambda question: difficulty_function(
                question, word_frequency[lng], most_common_word[lng]
            )
        )
    return languages, dict(questions)


def load_all_languages_cached():
    with gzip.open(
        "cache/languages.pickle.gz", "rb"
    ) as questions_f, gzip.open(
        "cache/questions.pickle.gz", "rb"
    ) as languages_f:
        languages = pickle.load(languages_f)
        questions = pickle.load(questions_f)

    return languages, questions


if __name__ == "__main__":
    languages, questions = load_all_languages()
    with gzip.open(
        "cache/languages.pickle.gz", "wb"
    ) as questions_f, gzip.open(
        "cache/questions.pickle.gz", "wb"
    ) as languages_f:
        sys.stderr.write('Saving the models...\n')
        pickle.dump(languages, languages_f)
        pickle.dump(questions, questions_f)
