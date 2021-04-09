#!/usr/bin/env python3

import json
import os
import pathlib
import sys

import pybktree
from panphon import distance
from phonemiser import phonemise


class EditDistanceWrapper:
    def __init__(self, lang_id, dst, phonemise):
        self.lang_id = lang_id
        self.dst = dst
        self.phonemise = phonemise

    def edit_distance(self, a, b):
        pa = self.phonemise(a, lang=self.lang_id)
        pb = self.phonemise(b, lang=self.lang_id)
        return self.dst.weighted_feature_edit_distance(pa, pb)


def get_multitree(voc_fd, lang_id):
    # Get a dict() where each key is a letter and each value
    # is a BK tree of the words that start with that letter
    dst = distance.Distance()
    ed = EditDistanceWrapper(lang_id, dst, phonemise)
    distractors = {}
    for line in voc_fd.readlines():
        (f, w) = line.strip("\n").split("\t")
        first_letter = w[0].lower()
        if first_letter not in distractors:
            distractors[first_letter] = []
        distractors[first_letter].append(w.lower())

    distractors_tree = {}
    for letter in distractors:
        distractors_tree[letter] = pybktree.BKTree(
            ed.edit_distance,
            distractors[letter],
        )

    return distractors_tree


def generate_distractors(cache_file, static_dir):
    # 0	1	2	3				4									5									6
    # 8       69      6       common_voice_fi_24001101.mp3    fa032123ba94a9aafc037ca10a5eac754ef410288c8dde2b2c666ed5e10222f2        Mysteerimies oli oppinut moraalinsa taruista, elokuvista ja peleistä.   a8f9eb3f56f2048df119a9ad1d210d0b98fda56f3e2a387f14fe2d652241f3ec

    lang_id = cache_file.split("/")[-1]

    voc_fd = open(cache_file + ".voc", "r")

    result = list(pathlib.Path(static_dir).rglob("info"))
    print("%d info files." % len(result))

    distractors_tree = get_multitree(voc_fd, lang_id)
    print("Got multitree: %d keys." % (len(distractors_tree.keys())))

    distractors = {}

    i = 0
    missing = 0
    n_tokens = 0
    for info_fn in result:
        info_fd = open(info_fn, "r")
        info = json.load(info_fd)

        if i % 500 == 0:
            print(".", end="", file=sys.stderr)
            sys.stderr.flush()

        distractors_sentence = {}
        for (token, label, chars) in info["tokens"]:
            if label == "PUNCT" or label == "PROPN":
                continue
            first_letter = token[0].lower()
            if token not in distractors:
                found = []
                if first_letter in distractors_tree:
                    for k in range(1, 6):
                        found = [
                            d
                            for d in distractors_tree[first_letter].find(
                                token,
                                k,
                            )
                            if d[0] > 0
                        ]
                        if len(found) > 0:
                            break
                distractors[token] = found
            if len(distractors[token]) == 0:
                missing += 1
            n_tokens += 1
            distractors_sentence[token] = distractors[token]

        info_dir = os.path.dirname(info_fn)
        metadata = {
            "distractors": distractors_sentence,
        }
        metadata_fn = info_dir + "/dist"
        metadata_fd = open(metadata_fn, "w")
        json.dump(metadata, metadata_fd)
        metadata_fd.close()

        i += 1

    print("", file=sys.stderr)

    return (i, len(distractors.keys()), n_tokens, missing)


if __name__ == "__main__":
    (n_lines, n_types, n_tokens, n_missing) = generate_distractors(
        sys.argv[1],
        sys.argv[2],
    )

    print(
        "%d processed. %d types. %d tokens. %d tokens miss distractors."
        % (
            n_lines,
            n_types,
            n_tokens,
            n_missing,
        ),
    )
