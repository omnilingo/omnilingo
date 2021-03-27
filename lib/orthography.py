import re

def bre():
	accept = {
		"ʼ": ["'", "’"]	# 02BC → [0027, 2019]
	}	
	return accept

def quc():
	accept = {
		"ʼ": ["'", "’"]	# 02BC → [0027, 2019]
	}	
	return accept

def tur():
	accept = {
		"İ": ["I"]
	}	
	return accept

def default():
	return {}


def alternatives(lang):
	if lang in ["br", "bre"]:
		return bre()
	if lang in ["quc"]:
		return quc()
	if lang in ["tr", "tur"]:
		return tur()

	return default()


if __name__ == "__main__":
	import doctest
	doctest.testmod()
