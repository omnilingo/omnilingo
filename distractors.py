from Levenshtein import *

#fran@ipek:~/source/commonvoice-languagelearning$ head templates/cv-corpus-6.1-2020-12-11/fi/validated.tsv
#client_id	path	sentence	up_votes	down_votes	age	gender	accent	locale	segment

def get_distractors(vocab):
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
		#print(token1 + '\t' + '#'.join([l + ':' + str(t) for (t, l) in distractors[token1]]))

	return distractors
