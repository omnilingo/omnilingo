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
rows = []
h = next(r)
for row in r:
	tokens = [token.lower() for token in tokenise(row[2])]
	
	for token in tokens:
		if token in '.?!":;,“':
			continue
		if token not in vocab:
			vocab[token] = 0		
		vocab[token] += 1
	rows.append(row)
for row in rows:
	tokens = [token.lower() for token in tokenise(row[2])]
	t_freq = [vocab[token] for token in tokens if token in vocab]
	t_freq.sort()	
	median = len(t_freq) // 2
	mean = sum(t_freq) / 2
	
	print(t_freq[median], mean, t_freq, row[2])
