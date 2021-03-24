# Functions for doing grapheme to phoneme for supported languages
# The default functions first do LRLM segmentation of the orthography
# and then lookup the segments in a lookup table. Any symbols which
# do not appear are discarded.

import sys 

def maxmatch(dictionary, line):
	line += ' '

	if line.strip() == '':
		return []

	for i in range(0, len(line)+1):
		firstWord = line[0:-i]
		remainder = line[-i:]
		if firstWord in dictionary:
			return [firstWord] + maxmatch(dictionary, remainder)

	firstWord = line[0]
	remainder = line[1:]

	return [firstWord] + maxmatch(dictionary, remainder)

def maxphon(lkp, token):
	ks = list(lkp.keys())
	ks.sort(key=lambda x : len(x), reverse=True)
	segs = maxmatch(ks, token.lower())	
	op = ''
	for seg in segs:
		if seg in lkp:
			op += lkp[seg][0]
	return op

def bre(token):
	"""
		>>> phonemise('Breizh', lang="bre")
		'breiz'
		>>> phonemise('gwelout', lang="bre")
		'ɡʷelut'
		>>> phonemise("deoc'h", lang="bre")
		'deoɣ'
	"""
	lkp = { 'i':['i'], 
		'u':['y'], 
		'ou':['u'], 
		'e':['e', 'ɛ'], 
		'eu':['ø', 'œ'],
		'a':['a','ɑ'], 
		'o':['o','ɔ'], 
		'm':['m'], 
		'n':['n'], 
		'gn':['ɲ'], 
		'b':['b'], 
		'd':['d'], 
		'g':['g'], 
		'gw':['ɡʷ'], 
		'gou':['ɡʷ'], 
		'p':['p'], 
		't':['t'], 
		'k':['k'], 
		'kw':['kʷ'], 
		'kou':['kʷ'], 
		'v':['v'], 
		'zh':['z'], 
		'j':['ʒ'], 
		"c'h":['ɣ', 'x'], 
		'f':['f'], 
		's':['s'], 
		'ch':['ʃ'], 
		'h':['h'], 
		'r':['r'], 
		'y':['j'], 
		'w':['w'], 
		'l':['l'], 
		'lh':['ʎ']}

	return maxphon(lkp, token)

def fin(token): 
	"""
		>>> phonemise('anekdootti', lang='fin')
		'ɑnekdoːtti'
	"""
	lkp = { 'i': ['i'],
		'y': ['y'],
		'u': ['u'],
		'e': ['e'],
		'ö': ['ø'],
		'o': ['o'],
		'ä': ['æ'],
		'a': ['ɑ'],
		'ii': ['iː'],
		'yy': ['yː'],
		'uu': ['uː'],
		'ee': ['eː'],
		'öö': ['øː'],
		'oo': ['oː'],
		'ää': ['æː'],
		'aa': ['ɑː'],
		'm':['m'],
		'n':['n'],
		'ng':['ŋ'],
		'p':['p'],
		'b':['b'],
		't':['t'],
		'd':['d'],
		'k':['k'],
		'ɡ':['ɡ'],
		'f':['f'],
		's':['s'],
		'š':['ʃ'],
		'h':['h'],
		'v':['ʋ'],
		'l':['l'],
		'j':['j'],
		'r':['r'] }

	return maxphon(lkp, token)

def tur(token):
	"""
		>>> phonemise('arabasında', lang='tur')
		'aɾabasɯnda'
	"""
	lkp = { 'i':['i'],
		'ı':['ɯ'],
		'ü':['y'],
		'u':['u'],
		'ö':['œ'],
		'o':['o'],
		'e':['e'],
		'a':['a'],
		'm':['m'],
		'n':['n'],
		'p':['p'],
		't':['t'],
		'ç':['t͡ʃ'],
		'k':['k'],
		'b':['b'],
		'd':['d'],
		'c':['d͡ʒ'],
		'ɡ':['ɡ'],
		'f':['f'],
		's':['s'],
		'ʃ':['ʃ'],
		'h':['h'],
		'v':['v'],
		'z':['z'],
		'j':['ʒ'],
		'l':['l'],
		'y':['j'],
		'r':['ɾ']}
		
	return maxphon(lkp, token)

def quc(token):
	"""
		>>> phonemise('chikop', lang='quc')
		'tʃʰikʰopʰ'
	"""
	lkp = { 'm':['m'],
		'bʼ':['ɓ'],
		'p':['pʰ'],
		'w':['ʋ'],
		'n':['n'],
		'tʼ':['tʼ'],
		't':['tʰ'],
		'tzʼ':['tsʼ'],
		'tz':['tsʰ'],
		'x':['ʃ'],
		'r':['ɻ'],
		'chʼ':['tʃʼ'],
		'ch':['tʃʰ'],
		'j':['χ'],
		'kʼ':['kʼ'],
		'k':['kʰ'],
		'qʼ':['qʼ'],
		'q':['qʰ'],
		'ʼ':['ʔ'],
		'h':['h'],
		's':['s'],
		'l':['l'],
		'a':['a'],
		'e':['e'],
		'i':['i'],
		'o':['o'],
		'u':['u'],
		'd':['d'],
		'y':['j']}
		
	return maxphon(lkp, token)

def default(token):
    return token

def phonemise(token, lang):
    if lang in ["br", "bre"]:
        return bre(token)
    if lang in ["fi", "fin"]:
        return fin(token)
    if lang in ["quc"]:
        return quc(token)
    if lang in ["tr", "tur"]:
        return tur(token)

    return default(token)

if __name__ == "__main__":
    import doctest
    doctest.testmod()

