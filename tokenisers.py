import re 
import jieba
import thai_segmenter
import nagisa

def eng(sentence):
	"""
		tokenisers.tokenise("O'Brien's protege and eventual successor in Hollywood was Ray Harryhausen.", lang="eng")
		["O'Brien", "'s", 'protege', 'and', 'eventual', 'successor', 'in', 'Hollywood', 'was', 'Ray', 'Harryhausen', '.']
	"""
	o = sentence
	o = re.sub(r'(["&()+,-./:;<>?–—‘’“”]+)', ' \g<1> ', o)
	o = o.replace("'ve ", " 've ")
	o = o.replace("'s ", " 's ")
	o = o.replace("I'm ", "I 'm ")
	o = re.sub(r"  *", " ", o)
	return [i.replace("ʼ", "'") for i in o.split(" ") if not i.strip() == "" ]

def bre(sentence):
	"""
		tokenise.tokenise("Tennañ a rit da'm c'hoar.", lang="bre")
		['Tennañ', 'a', 'rit', 'da', "'m", "c'hoar", '.']
	"""
	o = sentence
	o = o.replace(r"c'h", "cʼh")
	o = o.replace(r"C'h", "Cʼh")
	o = o.replace(r"C'H", "CʼH")
	o = re.sub(r"([!%()*+,\./:;=>?«»–‘’“”…€½]+)", " \g<1> ", o)
	o = re.sub(r"'", " '", o)
	o = re.sub(r"  *", " ", o)

	return [i.replace("ʼ", "'") for i in o.split(" ") if not i.strip() == "" ]

def tur(sentence):
	"""
		tokenise.tokenise("İlk Balkan Schengen'i mi?", lang="tur")
		['İlk', 'Balkan', "Schengen'i", 'mi', '?']
	"""
	o = re.sub("'", "ʼ", sentence)

	return [i.replace("ʼ", "'") for i in re.split("(\\w+)", o) if not i.strip() == "" ]


def hin(sentence):
	"""
		tokenisers.tokenise("हिट एंड रन केस: भाग्यश्री के खिलाफ भी सलमान खान जैसी शिकायत!", lang="hin")
		['हिट', 'एंड', 'रन', 'केस', ':', 'भाग्यश्री', 'के', 'खिलाफ', 'भी', 'सलमान', 'खान', 'जैसी', 'शिकायत', '!']
		NOTE: not using \w as it won't match certain Devanagari chars.
		FIXME: Improve this, 
	"""
	o = sentence
	o = re.sub(r"([!&,-.:?|।‘]+)", " \g<1> ", o)
	o = re.sub(r'"', ' " ', o)
	o = re.sub(r"'", " ' ", o)
	o = re.sub(r"  *", " ", o)

	return [ x for x in re.split(" ", o) if not x.strip() == "" ]

def asm(sentence):
	"""
		tokenisers.tokenise("“অ’ গৰখীয়া, অ’ গৰখীয়া গৰু নাৰাখ কিয়?”", lang="asm")
		['“', 'অ’', 'গৰখীয়া,', 'অ’', 'গৰখীয়া', 'গৰু', 'নাৰাখ', 'কিয়', '?', '”']
	"""
	o = sentence
	o = re.sub(r"([!',-.:;°।৷৹‘’“]+)", "\g<1> ", o)
	o = re.sub(r'"', ' " ', o)
	o = o.replace('?', ' ? ')
	o = re.sub(r"  *", " ", o)

	return [ x for x in re.split(" ", o) if not x.strip() == "" ]

def jpn(sentence):
	"""
		tokenisers.tokenise("自然消滅することは目に見えてるじゃん。", lang="jpn")
		['自然', '消滅', 'する', 'こと', 'は', '目', 'に', '見え', 'てる', 'じゃん', '。']
	"""
	return nagisa.tagging(sentence).words

def default(sentence):
        return [ x for x in re.split("(\\w+)", sentence) if x.strip() ]

def tokenise(sentence, lang):
	if lang in ["as", "asm"]:
		return asm(sentence)
	if lang in ["br", "bre"]:
		return bre(sentence)
	if lang in ["en", "eng"]:
		return eng(sentence)
	if lang in ["tr", "tur"]:
		return tur(sentence)
	if lang in ["hi", "hin"]:
		return hin(sentence)
	if lang in ["zh", "zho"] or lang.startswith("zh-"):
	        return jieba.lcut(sentence)
	if lang in ["th", "tha"]:
	        return thai_segmenter.tokenize(sentence)
	if lang in ["ja", "jpn"]:
		return jpn(sentence)
	else:
		return default(sentence)
