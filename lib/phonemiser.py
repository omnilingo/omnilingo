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
	'te':'tel-Telu',
	'th':'tha-Thai',
	'uk':'ukr-Cyrl',
	'uz':'uzb-Latn',
	'vi':'vie-Latn',
	'zh-CN':'cmn-Hans',
	'zh-TW':'cmn-Hant',
	'zh-HK':'cmn-Hans'
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

def jpn(token):
	from cjktools import scripts
	from cjktools.resources import kanjidic
	lkp = {}
	for fn in ['lib/data/phon/jp-Hira', 'lib/data/phon/jp-Kata']:
		lines = open(fn).readlines()		
		if len(lines) == 0:
			continue
		for line in lines:
			if line.strip() == '': continue
			kv = line.strip().split('\t')
			if len(kv) != 2:
				print('!', kv, file=sys.stderr)
				continue
			k = kv[0].strip()
			v = kv[1].strip()
			if k not in lkp:
				lkp[k] = []
			lkp[k].append(v)

	kjd = kanjidic.Kanjidic(kanjidic_files=['lib/data/dict/jp'])
	op = ''
	missing = ''
	segs = scripts.script_boundaries(token)
	for seg in segs:
		tipus = scripts.script_types(seg)
		if 3 in tipus:
			if seg in kjd:
				op += kjd[seg].on_readings[0]
		else:
			op += seg

	res = maxphon(lkp, op)
	if res == '':
		return '?'	
	return res


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
		>>> phonemise('为什么', lang='zh-CN')
		'weiʂenme'
		>>> phonemise('αβαλσάμωτος', lang='el')
		'abalsmɔːtos'
		>>> phonemise('আক্ৰমণ', lang='as')
		'akrmn'
	"""
	if lang in iso_2to3:
		return lookup_tables[lang].transliterate(token)
	if lang in iso_3to2:
		lang = iso_3to2[lang]
		return lookup_tables[lang].transliterate(token)
	if lang in ["ab", "abk"]:
		return maxphon(lookup_tables["ab"], token)
	if lang in ["as", "asm"]:
		return maxphon(lookup_tables["as"], token)
	if lang in ["br", "bre"]:
		return maxphon(lookup_tables["br"], token)
	if lang in ["cv", "chv"]:
		return maxphon(lookup_tables["cv"], token)
	if lang in ["cy", "cym"]:
		return maxphon(lookup_tables["cy"], token)
	if lang in ["dv"]:
		return maxphon(lookup_tables["dv"], token)
	if lang in ["el", "ell"]:
		return maxphon(lookup_tables["el"], token)
	if lang in ["fi", "fin"]:
		return maxphon(lookup_tables["fi"], token)
	if lang in ["jp", "jpn"]:
		return jpn(token)
	if lang in ["mn", "mon"]:
		return maxphon(lookup_tables["mn"], token)
	if lang in ["or", "ori"]:
		return maxphon(lookup_tables["or"], token)
	if lang in ["quc"]:
		return maxphon(lookup_tables["quc"], token)
	if lang in ["tr", "tur"]:
		return maxphon(lookup_tables["tr"], token)
	if lang in ["tt", "tat"]:
		return maxphon(lookup_tables["tt"], token)
	if lang in ["sah"]:
		return maxphon(lookup_tables["sah"], token)
	if lang in ["ur", "urd"]:
		return maxphon(lookup_tables["ur"], token)
	if lang.startswith("zh-"):
		return lookup_tables[lang].transliterate(token)

	return token

def init():
	languages = [p.name for p in pathlib.Path('lib/data/phon/').glob('*') if not p.name == 'README.md']
	lookup_tables = {}

	# If we have Epitran
	for language in iso_2to3:
		if language.startswith('zh-'):
			lookup_tables[language] = epitran.Epitran(iso_2to3[language], cedict_file="lib/data/dict/zh")
		else:
			lookup_tables[language] = epitran.Epitran(iso_2to3[language])

	# Otherwise fallback to TSV-style
	for language in languages:
		if language == 'zh':
			continue
		if language.startswith('jp-'):
			continue
		lines = open('lib/data/phon/'+language).readlines()
		if len(lines) == 0:
			continue
		lookup_tables[language] = {}
		for line in lines:
			if line.strip() == '': continue
			kv = line.strip().split('\t')
			if len(kv) != 2:
				print('!', kv, file=sys.stderr)
				continue
			k = kv[0].strip()
			v = kv[1].strip()
			if k not in lookup_tables[language]:
				lookup_tables[language][k] = []
			lookup_tables[language][k].append(v)

	return lookup_tables

lookup_tables = init()	

if __name__ == "__main__":
	import doctest
	doctest.testmod()

