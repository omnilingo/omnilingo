"""Implement alternative characters for some languages."""


def _bre():
    accept = {
        "ʼ": ["'", "’"],  # 02BC → [0027, 2019]
    }
    return accept


def _quc():
    accept = {
        "ʼ": ["'", "’"],  # 02BC → [0027, 2019]
    }
    return accept


def _tur():
    """Accept uppercase I without a dot for dotted uppercase İ."""
    accept = {
        "İ": ["I"],  # 0130 → [0049]
    }
    return accept


def _default():
    return {}


def alternatives(lang):
    """Return alternative characters for some languages."""
    if lang in ["br", "bre"]:
        return _bre()
    if lang in ["quc"]:
        return _quc()
    if lang in ["tr", "tur"]:
        return _tur()

    return _default()


if __name__ == "__main__":
    import doctest

    doctest.testmod()
