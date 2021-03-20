import re

def bre(word):
	"""
	>>> bre("arc'hant")
	['a', 'r', "c'h", 'a', 'n', 't']
	>>> bre("Breizh")
	['B', 'r', 'e', 'i', 'zh']
	"""
	input_word = ' '.join([c for c in word])
	input_word = re.sub(r"([Cc]) (['’ʼ]) ([Hh])", "\g<1>\g<2>\g<3>", input_word)
	input_word = re.sub(r"([Zz]) ([Hh])", "\g<1>\g<2>", input_word)
	input_word = input_word.strip()
			
	return input_word.split(' ')

def quc(word):
	"""
	>>> quc("K'iche'")
	["K'", 'i', 'ch', 'e', "'"]
	>>> quc("sotz'")
	['s', 'o', "tz'"]
	"""
	input_word = ' '.join([c for c in word])
	input_word = re.sub(r"(C|c) (H|h)", "\g<1>\g<2>", input_word)
	input_word = re.sub(r"(T|t) (Z|z)", "\g<1>\g<2>", input_word)
	input_word = re.sub(r"(B|T|K|Q|TZ|CH|Tz|Ch|b|t|k|q|tz|ch) (['’ʼ])", "\g<1>\g<2>", input_word)
	input_word = input_word.strip()
			
	return input_word.split(' ')

def default(word):
	"""
	>>> default('Crewe')
	['C', 'r', 'e', 'w', 'e']
	"""
	return [c for c in word]


def characters(sentence, lang):
	if lang in ["br", "bre"]:
		return bre(sentence)
	if lang in ["quc"]:
		return quc(sentence)

	return default(sentence)


if __name__ == "__main__":
	import doctest
	doctest.testmod()
