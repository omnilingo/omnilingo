#!/usr/bin/env python3
"""Index a language by collecting clips in buckets of difficulty."""
import hashlib
import re
import sys

from mutagen.mp3 import MP3
from taggers import tag
from tokenisers import tokenise

TRANSCRIPT_BLACKLIST = ["Hey", "Hei", "Firefox"]
MAX_TEXT_LENGTH = 100  # in characters
MAX_AUDIO_LENGTH = 10  # in seconds
MAX_PER_BUCKET = 1000  # in clips


def _index(input_path, output_file):
    """Index a validated.tsv file."""
    # FIXME: The buckets should contain only the text hashes, having one
    # example per text should be enough for a first version.
    buckets = {}
    for i in range(1, 11):
        buckets[i] = []

    skipped = 0
    vocab = {}
    input_fd = open(input_path + "/validated.tsv", "r")
    output_fd = open(output_file, "w+")
    vocab_fd = open(output_file + ".voc", "w+")
    line = input_fd.readline()
    # Skip the header
    line = input_fd.readline()
    i = 0
    total = 0
    full = 0
    locale = None
    while line:
        if full == len(buckets.keys()):
            row = line.split("\t")
            sent_orig = row[2].strip()
            tokens = tokenise(sent_orig, lang=locale)
            labels = tag(tokens, lang=locale)
            # 			print(tokens, labels)
            for (token, label) in zip(tokens, labels):
                if label == "PUNCT" or label == "PROPN":
                    continue
                if token not in vocab:
                    vocab[token] = 0
                vocab[token] += 1
            total += 1
            line = input_fd.readline()
            continue

        row = line.split("\t")
        fn = row[1]
        sent_orig = row[2].strip()

        if sent_orig in TRANSCRIPT_BLACKLIST:
            skipped += 1
            line = input_fd.readline()
            continue

        locale = row[8].strip()

        tokens = tokenise(sent_orig, lang=locale)
        labels = tag(tokens, lang=locale)
        for (token, label) in zip(tokens, labels):
            if label == "PUNCT" or label == "PROPN":
                continue
            if token not in vocab:
                vocab[token] = 0
            vocab[token] += 1

        sent = re.sub(r"[^\w ]+", "", sent_orig)
        nc = len(row[2])
        ns = len(row[2].split(" "))

        if nc >= MAX_TEXT_LENGTH:
            skipped += 1
            line = input_fd.readline()
            continue

        hsh = hashlib.sha256(sent.encode("utf-8")).hexdigest()
        af = input_path + "/clips/" + fn
        afd = open(af, "rb")
        ahsh = hashlib.sha256(afd.read()).hexdigest()
        audio = MP3(afd)
        afd.close()

        audio_length = int(audio.info.length)

        if audio.info.length > MAX_AUDIO_LENGTH:
            skipped += 1
            line = input_fd.readline()
            continue

        if audio_length == 0:
            audio_length = 1

        if audio_length in buckets and len(buckets[audio_length]) < MAX_PER_BUCKET:
            buckets[audio_length].append(
                [ns, nc, audio.info.length, fn, ahsh, sent_orig, hsh],
            )

        if len(buckets[audio_length]) == MAX_PER_BUCKET:
            full += 1

        line = input_fd.readline()
        i += 1
        total += 1

    for token in vocab:
        print("%d\t%s" % (vocab[token], token), file=vocab_fd)

    for bucket in buckets:
        n_clips = len(buckets[bucket])
        print(
            "bucket " + str(bucket).zfill(2) + " -> " + str(n_clips).rjust(5),
            "." * (n_clips // 10),
            file=sys.stderr,
        )
        for line in buckets[bucket]:
            print(
                "%d\t%d\t%.2f\t%s\t%s\t%s\t%s"
                % (
                    line[0],
                    line[1],
                    line[2],
                    line[3],
                    line[4],
                    line[5],
                    line[6],
                ),
                file=output_fd,
            )

    return (total, i, skipped, len(vocab.keys()))


if __name__ == "__main__":
    (n_total, n_lines, n_skipped, n_voc) = _index(
        sys.argv[1],
        "cache/" + sys.argv[1].split("/")[-1],
    )

    print(
        n_lines,
        "/",
        n_total,
        "indexed,",
        n_skipped,
        "skipped. Vocabulary size:",
        n_voc,
        file=sys.stderr,
    )
