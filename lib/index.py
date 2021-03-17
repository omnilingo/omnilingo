#!/usr/bin/env python3

import hashlib
import sys
import re
import os
from mutagen.mp3 import MP3

TRANSCRIPT_BLACKLIST = ['Hey', 'Hei', 'Firefox']
MAX_TEXT_LENGTH = 100 # in characters
MAX_AUDIO_LENGTH = 10 # in seconds
MAX_PER_BUCKET = 1000 # in clips

def index(input_path, output_file):
	"""
		Indexes a validated.tsv file
	"""

	buckets = {}
	for i in range(1,11):
		buckets[i] = []
	
	skipped = 0
	input_fd = open(input_path + '/validated.tsv', 'r')	
	output_fd = open(output_file, 'w+')
	line = input_fd.readline()
	# Skip the header
	line = input_fd.readline()
	i = 0
	full = 0
	while line:
		row = line.split('\t')
		fn = row[1]
		sent_orig = row[2].strip()

		if sent_orig in TRANSCRIPT_BLACKLIST:
			skipped += 1
			line = input_fd.readline()
			continue	

		locale = row[8].strip()
		sent = re.sub('[^\w ]+', '', sent_orig)
		nc = len(row[2])
		ns = len(row[2].split(' '))

		if nc >= MAX_TEXT_LENGTH:
			skipped += 1
			line = input_fd.readline()
			continue	

		hsh = hashlib.sha256(sent.encode('utf-8')).hexdigest()
		af =  input_path + '/clips/' + fn
		afd = open(af, 'rb')
		ahsh = hashlib.sha256(afd.read()).hexdigest()
		audio = MP3(afd)
		afd.close()

		audio_length = int(audio.info.length)

		if audio.info.length > MAX_AUDIO_LENGTH:
			skipped += 1
			line = input_fd.readline()
			continue	

		if audio_length in buckets and len(buckets[audio_length]) < MAX_PER_BUCKET:	
			buckets[audio_length].append([ns,nc,audio.info.length,fn,ahsh,sent_orig,hsh])

		if len(buckets[audio_length]) == MAX_PER_BUCKET:
			full += 1

		if full == len(buckets.keys()):
			break	

		line = input_fd.readline()
		i += 1

	for bucket in buckets:
		n_clips = len(buckets[bucket])
		print('bucket ' + str(bucket).zfill(2) + ' ->',n_clips,'.'*(n_clips//10), file=sys.stderr)
		for line in buckets[bucket]:
			print('%d\t%d\t%.2f\t%s\t%s\t%s\t%s' % (line[0], line[1], line[2], line[3], line[4], line[5], line[6]),file=output_fd)

	return (i, skipped)

if __name__ == "__main__":
	(n_lines, n_skipped) = index(sys.argv[1], 'cache/' + sys.argv[1].split('/')[-2])

	print(n_lines,'indexed,', n_skipped, 'skipped.', file=sys.stderr)
