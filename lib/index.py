#!/usr/bin/env python3

import hashlib
import sys
import re
import os
from mutagen.mp3 import MP3

MAX_TEXT_LENGTH = 100 # in characters
MAX_AUDIO_LENGTH = 10 # in seconds

def index(input_path, output_file):
	"""
		Indexes a validated.tsv file
	"""
	input_fd = open(input_path + '/validated.tsv', 'r')	
	output_fd = open(output_file, 'w+')
	line = input_fd.readline()
	# Skip the header
	line = input_fd.readline()
	i = 0
	while line:
		row = line.split('\t')
		fn = row[1]
		sent_orig = row[2].strip()
		locale = row[8].strip()
		sent = re.sub('[^\w ]+', '', sent_orig)
		nc = len(row[2])
		ns = len(row[2].split(' '))
		hsh = hashlib.sha256(sent.encode('utf-8')).hexdigest()
		af =  input_path + '/clips/' + fn
		afd = open(af, 'rb')
		ahsh = hashlib.sha256(afd.read()).hexdigest()
		audio = MP3(afd)
		afd.close()
		print('%d\t%d\t%d\t%s\t%s\t%s\t%s' % (ns,nc,audio.info.length,fn,ahsh, sent_orig,hsh),file=output_fd)
		line = input_fd.readline()
		i += 1

	return i

if __name__ == "__main__":
	n_lines = index(sys.argv[1], 'cache/' + sys.argv[1].split('/')[-2])

	print(n_lines,'indexed.')
