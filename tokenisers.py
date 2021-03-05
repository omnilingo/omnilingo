import re
import jieba
import thai_segmenter
#import nagisa

def cat(sentence):
    """
        tokenisers.tokenise("L'eslògan \"that'd be great\" (\"això seria genial\") de Lumbergh també s'ha transformat en un popular mem d'internet.", lang="cat")
        ["L'", 'eslògan', '"that\'d', 'be', 'great"', '(', '"això', 'seria', 'genial"', ')', 'de', 'Lumbergh', 'també', "s'", 'ha', 'transformat', 'en', 'un', 'popular', 'mem', "d'", 'internet', '.']
    """
    o = sentence
    o = re.sub(r"([!()*+,./:;?@|~¡«°·»¿–—―’“”…]+)", " \g<1> ", o)
    o = re.sub(r"([DLSM]['’])", "\g<1> ", o)
    o = re.sub(r"( [dlsm]['’])", " \g<1> ", o)
    o = re.sub(r"  *", " ", o)
    return [i.replace("ʼ", "'") for i in o.split(" ") if not i.strip() == ""]

def fra(sentence):
    """
    """
    o = sentence
    o = re.sub(r"([!*+,./:;?@|~¡«°·»¿–—―’“”…]+)", " \g<1> ", o)
    o = re.sub(r"([JDLSM]['’])", "\g<1> ", o)
    o = re.sub(r"( [jdlsm]['’])", " \g<1> ", o)
    o = re.sub(r"  *", " ", o)
    return [i.replace("ʼ", "'") for i in o.split(" ") if not i.strip() == ""]


def eng(sentence):
    """
        tokenisers.tokenise("O'Brien's protege and eventual successor in Hollywood was Ray Harryhausen.", lang="eng")
        ["O'Brien", "'s", 'protege', 'and', 'eventual', 'successor', 'in', 'Hollywood', 'was', 'Ray', 'Harryhausen', '.']
    """
    o = sentence
    o = re.sub(r'(["&()+,-./:;<>?–—‘’“”]+)', " \g<1> ", o)
    o = o.replace("'ve ", " 've ")
    o = o.replace("'s ", " 's ")
    o = o.replace("I'm ", "I 'm ")
    o = re.sub(r"  *", " ", o)
    return [i.replace("ʼ", "'") for i in o.split(" ") if not i.strip() == ""]


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

    return [i.replace("ʼ", "'") for i in o.split(" ") if not i.strip() == ""]


def ukr(sentence):
    """
        tokenisers.tokenise("— А далій не вб'єш, — проказав коваль.", lang="ukr")
        ['— ', 'А', 'далій', 'не', "вб'єш", ', — ', 'проказав', 'коваль', '.']
    """
    o = re.sub("'", "ʼ", sentence)

    return [
        i.replace("ʼ", "'")
        for i in re.split("(\\w+)", o)
        if not i.strip() == ""
    ]


def tur(sentence):
    """
        tokenise.tokenise("İlk Balkan Schengen'i mi?", lang="tur")
        ['İlk', 'Balkan', "Schengen'i", 'mi', '?']
    """
    o = re.sub("'", "ʼ", sentence)

    return [
        i.replace("ʼ", "'")
        for i in re.split("(\\w+)", o)
        if not i.strip() == ""
    ]


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

    return [x for x in re.split(" ", o) if not x.strip() == ""]


def asm(sentence):
    """
        tokenisers.tokenise("“অ’ গৰখীয়া, অ’ গৰখীয়া গৰু নাৰাখ কিয়?”", lang="asm")
        ['“', 'অ’', 'গৰখীয়া,', 'অ’', 'গৰখীয়া', 'গৰু', 'নাৰাখ', 'কিয়', '?', '”']
    """
    o = sentence
    o = re.sub(r"([!',-.:;°।৷৹‘’“]+)", " \g<1> ", o)
    o = re.sub(r'"', ' " ', o)
    o = o.replace("?", " ? ")
    o = re.sub(r"  *", " ", o)

    return [x for x in re.split(" ", o) if not x.strip() == ""]


def jpn(sentence):
    """
        tokenisers.tokenise("自然消滅することは目に見えてるじゃん。", lang="jpn")
        ['自然', '消滅', 'する', 'こと', 'は', '目', 'に', '見え', 'てる', 'じゃん', '。']
    """
    return nagisa.tagging(sentence).words


def kab(sentence):
    """
        tokenisers.tokenise("Leqbayel ttemḥaddin lawan-nni m'ara mmlaqan deg leswaq n Waεraben, leǧwayeh n Sṭif.", lang="kab")
        ['Leqbayel', 'ttemḥaddin', 'lawan-nni', "m'ara", 'mmlaqan', 'deg', 'leswaq', 'n', 'Waεraben', ',', 'leǧwayeh', 'n', 'Sṭif', '.']
    """

    o = sentence
    o = re.sub(r"([!&(),./:;?«»–‘’“”‟…↓̣$€]+)", " \g<1> ", o)
    o = re.sub(r"  *", " ", o)

    return [x for x in re.split(" ", o) if not x.strip() == ""]


def kat(sentence):
    """
        tokenisers.tokenise("გიორგიმ შენზე თქვა, წერა-კითხვა არ იცისო, მართალია?", lang="kat")
        ['გიორგიმ', 'შენზე', 'თქვა', ',', 'წერა-კითხვა', 'არ', 'იცისო', ',', 'მართალია', '?']
    """
    o = sentence
    o = re.sub(r"([!,.:;?–—“„]+)", " \g<1> ", o)
    o = re.sub(r"  *", " ", o)

    return [x for x in re.split(" ", o) if not x.strip() == ""]


def mlt(sentence):
    """
        tokenisers.tokenise("Ħadd ma weġġa' f'dan l-inċident.", lang="mlt")
        ['Ħadd', 'ma', "weġġa'", "f'", 'dan', 'l-', 'inċident', '.']
    """
    o = sentence
    for tok in [
        "ad-",
        "al-",
        "an-",
        "as-",
        "bħall-",
        "bħar-",
        "bħas-",
        "bħat-",
        "biċ-",
        "bid-",
        "bil-",
        "bin-",
        "bir-",
        "bis-",
        "bit-",
        "bix-",
        "bl-",
        "ċ-",
        "d-",
        "dal-",
        "dar-",
        "das-",
        "emm-",
        "erbatax-",
        "feed-",
        "fiċ-",
        "fid-",
        "fil-",
        "fin-",
        "fir-",
        "fis-",
        "fit-",
        "fix-",
        "fl-",
        "għaċ-",
        "għad-",
        "għal-",
        "għall-",
        "għan-",
        "għar-",
        "għas-",
        "għat-",
        "għax-",
        "ġod-",
        "ġol-",
        "ħal-",
        "ħall-",
        "ħdax-",
        "iċ-",
        "id-",
        "il-",
        "ill-",
        "in-",
        "ir-",
        "is-",
        "it-",
        "ix-",
        "kemm-",
        "l-",
        "lid-",
        "lill-",
        "lin-",
        "lir-",
        "lis-",
        "lit-",
        "maċ-",
        "mad-",
        "mal-",
        "man-",
        "mar-",
        "mas-",
        "mat-",
        "max-",
        "maz-",
        "mid-",
        "mil-",
        "mill-",
        "min-",
        "mir-",
        "mis-",
        "mit-",
        "mix-",
        "n-",
        "r-",
        "s-",
        "sal-",
        "sas-",
        "sat-",
        "sbatax-",
        "sittax-",
        "t-",
        "taċ-",
        "tad-",
        "tal-",
        "tan-",
        "tar-",
        "tas-",
        "tat-",
        "tax-",
        "tmintax-",
        "tnax-",
        "x-",
        "z-",
    ]:
        o = o.replace(" " + tok, " " + tok + " ")
    for tok in ["b'", "f'", "m'", "s'", "t'", "x'"]:
        o = o.replace(" " + tok, " " + tok + " ")
    o = re.sub(r"([!,.:;`’]+)", " \g<1> ", o)
    o = o.replace('"', ' " ')
    o = o.replace("?", " ? ")
    o = re.sub(r"  *", " ", o)

    return [x for x in re.split(" ", o) if not x.strip() == ""]


def ori(sentence):
    o = sentence
    o = re.sub(r"([!',-.:;?|°।–—‘’“]+)", " \g<1> ", o)
    o = o.replace('"', ' " ')
    o = re.sub(r"  *", " ", o)
    return [x for x in re.split(" ", o) if not x.strip() == ""]


def roh(sentence):
    """
        tokenisers.tokenise("L'unic chi güda forsa, es ün chic sco effet da placebo.", lang="roh")
        ["L'", 'unic', 'chi', 'güda', 'forsa,', 'es', 'ün', 'chic', 'sco', 'effet', 'da', 'placebo.']
    """
    o = sentence
    o = re.sub(r"([!,-.:;?«»–‘“„…‹›]+)", " \g<1> ", o)
    for tok in [
        "l'",
        "d'",
        "s'",
        "ch'",
        "süll'",
        "l’",
        "d’",
        "s’",
        "ch’",
        "süll’",
    ]:
        o = o.replace(" " + tok, " " + tok + " ")
    o = re.sub("([LSD][’']|Ün[’'])", " \g<1> ", o)
    o = re.sub(r"  *", " ", o)
    return [x.strip() for x in re.split(" ", o) if not x.strip() == ""]


def div(sentence):
    """
        tokenisers.tokenise("ތީ ޝަބާބޭ! ތިހެންވީއިރު ޓްވިންސެއް ހުރޭތަ؟ ރީޙާން ޙައިރާންވި", lang="div")
        ['ތީ', 'ޝަބާބޭ', '!', 'ތިހެންވީއިރު', 'ޓްވިންސެއް', 'ހުރޭތަ', '؟', 'ރީޙާން', 'ޙައިރާންވި']
    """
    o = sentence
    o = re.sub(r"([!.:;،؟–‘’]+)", " \g<1> ", o)
    o = o.replace("-", " - ")
    o = re.sub(r"  *", " ", o)
    return [x.strip() for x in re.split(" ", o) if not x.strip() == ""]


def gle(sentence):
    """
        tokenisers.tokenise("A sheansailéir, a leas-sheansailéir, a mhic léinn, a dhaoine uaisle", lang="gle")
        ['A', 'sheansailéir', ',', 'a', 'leas-sheansailéir', ',', 'a', 'mhic', 'léinn', ',', 'a', 'dhaoine', 'uaisle']
    """
    o = sentence
    o = re.sub(r"([!(),.:;?–‘’]+)", " \g<1> ", o)
    o = o.replace('"', ' " ')
    for tok in ["an-", "n-", "t-"]:
        o = o.replace(" " + tok, " " + tok + " ")
    o = re.sub(r"([DB]['’])", "\g<1> ", o)
    o = re.sub(r"( [db]['’])", " \g<1> ", o)
    o = re.sub(r"  *", " ", o)
    return [x.strip() for x in re.split(" ", o) if not x.strip() == ""]


def pes(sentence):
    """
        tokenisers.tokenise("اوه خدا، چه بهم ریختگی!", lang="pes")
        ['اوه', 'خدا', '،', 'چه', 'بهم', 'ریختگی', '!']
    """
    o = sentence
    o = re.sub(r"([!#%&,./:;«»،؛؟٪٫٬–…]+)", " \g<1> ", o)
    o = o.replace('"', ' " ')
    o = o.replace("(", " ( ")
    o = o.replace(")", " ) ")
    o = o.replace("]", " ] ")
    o = o.replace("[", " [ ")
    o = o.replace("-", " - ")
    o = re.sub(r"  *", " ", o)
    return [x.strip() for x in re.split(" ", o) if not x.strip() == ""]


def default(sentence):
    return [x for x in re.split("(\\w+)", sentence) if x.strip()]


def tokenise(sentence, lang):
    if lang in ["as", "asm"]:
        return asm(sentence)
    if lang in ["br", "bre"]:
        return bre(sentence)
    if lang in ["ca", "cat"]:
        return cat(sentence)
    if lang in ["dv", "div"]:
        return div(sentence)
    if lang in ["en", "eng"]:
        return eng(sentence)
    if lang in ["fa", "pes"]:
        return pes(sentence)
    if lang in ["fr", "fra"]:
        return fra(sentence)
    if lang in ["ga", "gle"] or lang.startswith("ga-"):
        return gle(sentence)
    #     if lang in ["ja", "jpn"]:
    #         return jpn(sentence)
    if lang in ["kab"]:
        return kab(sentence)
    if lang in ["ka", "kat"]:
        return kat(sentence)
    if lang in ["hi", "hin"]:
        return hin(sentence)
    if lang in ["mt", "mlt"]:
        return mlt(sentence)
    if lang in ["or", "ori"]:
        return ori(sentence)
    if lang in ["rm", "roh"] or lang.startswith("rm-"):
        return roh(sentence)
    if lang in ["th", "tha"]:
        return thai_segmenter.tokenize(sentence)
    if lang in ["tr", "tur"]:
        return tur(sentence)
    if lang in ["uk", "ukr"]:
        return ukr(sentence)
    if lang in ["zh", "zho"] or lang.startswith("zh-"):
        return jieba.lcut(sentence)

    return default(sentence)
