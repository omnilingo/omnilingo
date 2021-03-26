import re

def deu(sentence):
    """
        >>> deu(['Ich', 'habe', 'schlechte', 'Nachrichten', 'für', 'ihn', '.'])
        ['X', 'X', 'X', 'X', 'X', 'X', 'PUNCT']
    """
    tags = []
    first = True
    for token in sentence:
        if re.match('^[^\w+]+$', token):
            tags.append('PUNCT')
        else:
            tags.append('X')
        first = False

    return tags

def jpn(sentence):
    """
	>>> jpn(['切手', 'を', '十', '枚', 'と', 'はがき', 'を', '三', '枚', '買い', 'ます', '。'])
	['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'PUNCT']
    """
    tags = []
    first = True
    for token in sentence:
        if re.match('^[^\w+]+$', token):
            tags.append('PUNCT')
        else:
            tags.append('X')
        first = False

    return tags



def default(sentence):
    """
        >>> default(['This', 'is', 'not', 'Crewe', '.'])
        ['X', 'X', 'X', 'PROPN', 'PUNCT']
    """
    tags = []
    first = True
    for token in sentence:
        if re.match(r'^\W+$', token):
            tags.append('PUNCT')
        elif token[0] == token[0].upper() and not first:
            tags.append('PROPN')
        else:
            tags.append('X')
        first = False

    return tags


def tag(sentence, lang):
    if lang in ["de", "deu"]:
        return deu(sentence)
    if lang in ["ja", "jpn"]:
        return jpn(sentence)

    return default(sentence)


if __name__ == "__main__":
    import doctest
    doctest.testmod()
