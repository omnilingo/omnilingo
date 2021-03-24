# Functions for doing grapheme to phoneme for supported languages
# The default functions first do LRLM segmentation of the orthography
# and then lookup the segments in a lookup table. Any symbols which
# do not appear are discarded.

import sys 
import pathlib
import epitran

iso_2to3 = {
	'am':'amh-Ethi',
	'ar':'ara-Arab',
	'az':'aze-Latn',
	'bn':'ben-Beng',
	'ca':'cat-Latn',
	'ckb':'ckb-Arab',
	'de':'deu-Latn',
	'fa':'fas-Arab',
	'fr':'fra-Latn',
	'hi':'hin-Deva',
	'id':'ind-Latn',
	'it':'ita-Latn',
	'kk':'kaz-Cyrl',
	'rw':'kin-Latn',
	'ky':'kir-Cyrl',
	'kmr':'kmr-Latn',
	'mt':'mlt-Latn',
	'nl':'nld-Latn',
	'pa-IN':'pan-Guru',
	'pl':'pol-Latn',
	'ro':'ron-Latn',
	'ru':'rus-Cyrl',
	'es':'spa-Latn',
	'sw':'swa-Latn',
	'sv-SE':'swe-Latn',
	'ta':'tam-Taml',
	'th':'tha-Thai',
	'uk':'ukr-Cyrl',
	'uz':'uzb-Latn',
	'vi':'vie-Latn'
}

iso_3to2 = {y.split('-')[0]: x for (x, y) in iso_2to3.items()}

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

def phonemise(token, lang):
	"""
		>>> phonemise('Breizh', lang="bre")
		'breiz'
		>>> phonemise('gwelout', lang="bre")
		'ɡʷelut'
		>>> phonemise("deoc'h", lang="bre")
		'deoɣ'
		>>> phonemise('anekdootti', lang='fin')
		'ɑnekdoːtti'
		>>> phonemise('arabasında', lang='tur')
		'aɾabasɯnda'
		>>> phonemise('chikop', lang='quc')
		'tʃʰikʰopʰ'
		>>> phonemise('Schnur', lang='deu')
		'ʃnuə'
		>>> phonemise('llyfrgell', lang='cy')
		'ɬəvrɡɛɬ'
	"""
	if lang in iso_2to3:
		return lookup_tables[lang].transliterate(token)
	if lang in iso_3to2:
		lang = iso_3to2[lang]
		return lookup_tables[lang].transliterate(token)
	if lang in ["br", "bre"]:
		return maxphon(lookup_tables["br"], token)
	if lang in ["cv", "chv"]:
		return maxphon(lookup_tables["cv"], token)
	if lang in ["fi", "fin"]:
		return maxphon(lookup_tables["fi"], token)
	if lang in ["quc"]:
		return maxphon(lookup_tables["quc"], token)
	if lang in ["cy", "cym"]:
		return maxphon(lookup_tables["cy"], token)
	if lang in ["tr", "tur"]:
		return maxphon(lookup_tables["tr"], token)
	if lang in ["tt", "tat"]:
		return maxphon(lookup_tables["tt"], token)
	if lang in ["sah"]:
		return maxphon(lookup_tables["sah"], token)

	return token

def init():
	languages = [p.name for p in pathlib.Path('data/phon/').glob('*')]
	lookup_tables = {}

	# If we have Epitran
	for language in iso_2to3:
		lookup_tables[language] = epitran.Epitran(iso_2to3[language])

	# Otherwise fallback to TSV-style
	for language in languages:
		lookup_tables[language] = {}
		for line in open('data/phon/'+language).readlines():
			if line.strip() == '': continue
			(k, v) = line.strip().split('\t')
			if k not in lookup_tables[language]:
				lookup_tables[language][k] = []
			lookup_tables[language][k].append(v)

	return lookup_tables

lookup_tables = init()	

if __name__ == "__main__":
	import doctest
	doctest.testmod()

