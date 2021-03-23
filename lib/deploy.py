#!/usr/bin/env python3

import sys
import pathlib
import os 
import json

from tokenisers import tokenise
from taggers import tag
from segments import characters

import pybktree
from panphon import distance

def get_multitree(voc_fd):
	# Get a dict() where each key is a letter and each value
	# is a BK tree of the words that start with that letter
	dst = distance.Distance()
	distractors = {}
	for line in voc_fd.readlines():
		(f, w) = line.strip('\n').split('\t')
		first_letter = w[0].lower()
		if first_letter not in distractors:
			distractors[first_letter] = []
		distractors[first_letter].append(w)

	distractors_tree = {}
	for letter in distractors:
		distractors_tree[letter] = pybktree.BKTree(dst.weighted_feature_edit_distance, distractors[letter])

	return distractors_tree
	

def deploy(dump_dir, cache_file, static_dir):
	#0	1	2	3				4									5									6
	#8       69      6       common_voice_fi_24001101.mp3    fa032123ba94a9aafc037ca10a5eac754ef410288c8dde2b2c666ed5e10222f2        Mysteerimies oli oppinut moraalinsa taruista, elokuvista ja peleistä.   a8f9eb3f56f2048df119a9ad1d210d0b98fda56f3e2a387f14fe2d652241f3ec

	# Keep track of which audio we've seen (in case there are multiple 
	# files with the same hash) and which text we've seen (we only want
	# two files per transcript
	seen_audio = []
	seen_text = []

	lang_id = cache_file.split('/')[-1]

	index_dir = static_dir + '/index/'
	clips_dir = dump_dir + '/clips/'

	pathlib.Path(index_dir).mkdir(parents=True, exist_ok=True)

	cache_fd = open(cache_file, 'r')
	voc_fd = open(cache_file + '.voc', 'r')
	index_fd = open(index_dir + '/' + lang_id, 'w')

	distractors_tree = get_multitree(voc_fd)
	distractors = {}

	# Datastructure for the index
	index = {"index": []}

	i = 0
	line = cache_fd.readline()
	while line:
		row = line.strip().split('\t')
		index["index"].append(row)
		fname = row[3]
		ahash = row[4]
		text = row[5]
		thash = row[6]

		if seen_audio.count(ahash) > 0:
			line = cache_fd.readline()
			continue	
		else:
			seen_audio.append(ahash)
			
		if seen_text.count(thash) > 2:
			line = cache_fd.readline()
			continue	
		else:
			seen_text.append(thash)

		tokens = tokenise(row[5], lang=lang_id)
		labels = tag(tokens, lang=lang_id)
		chars = [characters(token, lang=lang_id) for token in tokens]
		distractors_sentence = {}
		for (token, label) in zip(tokens, labels):
			if label == 'PUNCT' or label == 'PROPN':
				continue
			first_letter = token[0].lower()
			if token not in distractors:
				distractors[token] = [d for d in distractors_tree[first_letter].find(token, 4) if d[0] > 0]
			distractors_sentence[token] = distractors[token]	

		audio_dir = static_dir + '/' + lang_id + '/clip/' + ahash[0:2] + '/' + ahash[2:6] + '/' + ahash
		text_dir = static_dir + '/' + lang_id + '/text/' + thash[0:2] + '/' + thash[2:6] + '/' + thash
		#print(audio_dir)
		#print(text_dir)
		pathlib.Path(text_dir).mkdir(parents=True, exist_ok=True)
		pathlib.Path(audio_dir).mkdir(parents=True, exist_ok=True)
		audio_path = audio_dir + '/audio.mp3'
		# Symlink the audio file in the clips directory to the audio_path
		os.symlink(clips_dir + '/' + fname, audio_path)
		text_fd = open(text_dir + '/text', 'w')
		print(text, file=text_fd)
		# Symlink the text metadata file to the audio directory
		os.symlink(os.path.abspath(text_dir + '/text'), audio_dir + '/text')
		metadata = {
			'text': text,
			'tokens': [[i, j, k] for (i, j, k) in zip(tokens, labels, chars)],
			'distractors': distractors_sentence
		}
		metadata_fd = open(text_dir + '/info', 'w')
		json.dump(metadata, metadata_fd)
		text_fd.close()
		metadata_fd.close()
		line = cache_fd.readline()
		i+= 1

	json.dump(index, index_fd)
	index_fd.close()

	return (i, len([d for d in distractors.keys() if len(distractors[d]) > 1]), len(distractors.keys())) 


if __name__ == "__main__":
	(n_lines, n_distractors, n_tokens) = deploy(os.path.abspath(sys.argv[1]), sys.argv[2], 'static/')

	print(n_lines,'deployed. %d/%d words with distractors.' % (n_distractors, n_tokens))

