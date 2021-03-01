import sys, csv, re
from Levenshtein import *

#fran@ipek:~/source/commonvoice-languagelearning$ head templates/cv-corpus-6.1-2020-12-11/fi/validated.tsv
#client_id	path	sentence	up_votes	down_votes	age	gender	accent	locale	segment

def tokenise(question):
        return [ x for x in re.split("(\\w+)", question) if not x.strip() == '' ]

vocab = {}

PREFIX = "templates/cv-corpus-6.1-2020-12-11/"

language_name = sys.argv[1]

f = open(PREFIX + language_name + "/validated.tsv")
r = csv.reader(f, delimiter="\t")
h = next(r)
for row in r:
	tokens = [token.lower() for token in tokenise(row[2])]
	
	for token in tokens:
		if token in '.?!":;,“':
			continue
		if token not in vocab:
			vocab[token] = 0		
		vocab[token] += 1
m = {}

for token1 in vocab:
	for token2 in vocab:
		if token1 not in m:
			m[token1] = {}		
		if token2 not in m[token1]:
			m[token1][token2] = distance(token1, token2)

distractors = {}

for token1 in vocab:
	d = [(t, l) for (l, t) in m[token1].items()]
	d.sort()
	# do something better here with partitioning
	distractors[token1] = d[1:11] # skip the first one which will be 0
	print(token1 + '\t' + '#'.join([l + ':' + str(t) for (t, l) in distractors[token1]]))
