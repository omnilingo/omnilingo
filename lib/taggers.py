"""Grammatical tagging for sentences."""
import re


def _deu(sentence):
    """Convert deu sentences to tags.

    >>> deu(['Ich', 'habe', 'schlechte', 'Nachrichten', 'für', 'ihn', '.'])
    ['X', 'X', 'X', 'X', 'X', 'X', 'PUNCT']
    """
    tags = []
    for token in sentence:
        if re.match(r"^[^\w+]+$", token):
            tags.append("PUNCT")
        else:
            tags.append("X")

    return tags


def _jpn(sentence):
    """Convert jpn sentences to tags.

    >>> jpn(['切手', 'を', '十', '枚', 'と', 'はがき', 'を', '三', '枚', '買い', 'ます', '。'])
    ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'PUNCT']
    """
    tags = []
    for token in sentence:
        if re.match(r"^[^\w+]+$", token):
            tags.append("PUNCT")
        else:
            tags.append("X")

    return tags


def _default(sentence):
    """Defaut tags for sentences.

    >>> default(['This', 'is', 'not', 'Crewe', '.'])
    ['X', 'X', 'X', 'PROPN', 'PUNCT']
    """
    tags = []
    first = True
    for token in sentence:
        if re.match(r"^\W+$", token):
            tags.append("PUNCT")
        elif token[0] == token[0].upper() and not first:
            tags.append("PROPN")
        else:
            tags.append("X")
        first = False

    return tags


def tag(sentence, lang):
    """Grammatical tags for sentence components."""
    if lang in ["de", "deu"]:
        return _deu(sentence)
    if lang in ["ja", "jpn"]:
        return _jpn(sentence)

    return _default(sentence)


if __name__ == "__main__":
    import doctest

    doctest.testmod()
