"""Character splitters."""
import re


def _bre(word):
    """Split words into characters using bre.

    >>> bre("arc'hant")
    ['a', 'r', "c'h", 'a', 'n', 't']
    >>> bre("Breizh")
    ['B', 'r', 'e', 'i', 'zh']
    """
    input_word = " ".join([c for c in word])
    input_word = re.sub(
        r"([Cc]) (['’ʼ]) ([Hh])",
        r"\g<1>\g<2>\g<3>",
        input_word,
    )
    input_word = re.sub(r"([Zz]) ([Hh])", r"\g<1>\g<2>", input_word)
    input_word = input_word.strip()

    return input_word.split(" ")


def _quc(word):
    """Split words into characters using quc.

    >>> quc("K'iche'")
    ["K'", 'i', 'ch', 'e', "'"]
    >>> quc("sotz'")
    ['s', 'o', "tz'"]
    """
    input_word = " ".join([c for c in word])
    input_word = re.sub(r"(C|c) (H|h)", r"\g<1>\g<2>", input_word)
    input_word = re.sub(r"(T|t) (Z|z)", r"\g<1>\g<2>", input_word)
    input_word = re.sub(
        r"(B|T|K|Q|TZ|CH|Tz|Ch|b|t|k|q|tz|ch) (['’ʼ])",
        r"\g<1>\g<2>",
        input_word,
    )
    input_word = input_word.strip()

    return input_word.split(" ")


def _default(word):
    """Split words into characters using native encoding.

    >>> default('Crewe')
    ['C', 'r', 'e', 'w', 'e']
    """
    return [c for c in word]


def characters(sentence, lang):
    """Break sentence into characters.

    Special casing for bre and quc languages.
    """
    if lang in ["br", "bre"]:
        return _bre(sentence)
    if lang in ["quc"]:
        return _quc(sentence)

    return _default(sentence)


if __name__ == "__main__":
    import doctest

    doctest.testmod()
