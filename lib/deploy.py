#!/usr/bin/env python3

import sys
import pathlib
import os 
from tokenisers import tokenise


def deploy(dump_dir, cache_file, static_dir):
	#8       69      6       common_voice_fi_24001101.mp3    fa032123ba94a9aafc037ca10a5eac754ef410288c8dde2b2c666ed5e10222f2        Mysteerimies oli oppinut moraalinsa taruista, elokuvista ja peleistä.   a8f9eb3f56f2048df119a9ad1d210d0b98fda56f3e2a387f14fe2d652241f3ec
	cache_fd = open(cache_file, 'r')
	clips_dir = dump_dir + '/clips/'
	lang_id = cache_file.split('/')[-1]
	line = cache_fd.readline()
	i = 0
	while line:
		row = line.strip().split('\t')
		ahash = row[4]
		thash = row[6]
		tokens = tokenise(row[5], lang=lang_id)
		audio_dir = static_dir + '/' + lang_id + '/clip/' + ahash[0:2] + '/' + ahash[2:6] + '/' + ahash
		text_dir = static_dir + '/' + lang_id + '/text/' + thash[0:2] + '/' + thash[2:6] + '/' + thash
		#print(audio_dir)
		#print(text_dir)
		pathlib.Path(text_dir).mkdir(parents=True, exist_ok=True)
		pathlib.Path(audio_dir).mkdir(parents=True, exist_ok=True)
		audio_path = audio_dir + '/audio.mp3'
		os.symlink(clips_dir + '/' + row[3], audio_path)
		text_fd = open(text_dir + '/text', 'w')
		tokens_fd = open(text_dir + '/tokens', 'w')
		print(row[5], file=text_fd)
		print(' '.join(tokens), file=tokens_fd)
		text_fd.close()
		tokens_fd.close()
		line = cache_fd.readline()
		i+= 1

	return i


if __name__ == "__main__":
	n_lines = deploy(os.path.abspath(sys.argv[1]), sys.argv[2], 'static/')

	print(n_lines,'deployed.')

