#!/usr/bin/env python3

import json
import random

import browser
import browser.ajax
import browser.local_storage


def on_audio_ended(_ev):
    try:
        browser.document.querySelectorAll('[data-focus="true"]')[0].focus()
    except IndexError:
        pass  # meh, user responded before audio finished


def on_correct_answer():
    responses = browser.local_storage.storage.get("responses", "")
    responses += "+"
    browser.local_storage.storage["responses"] = responses


def on_incorrect_answer():
    responses = browser.local_storage.storage.get("responses", "")
    responses += "-"
    browser.local_storage.storage["responses"] = responses


def clear_feedback():
    my_node = browser.document.getElementById("feedback")
    while my_node.firstChild:
        my_node.removeChild(my_node.firstChild)


def draw_feedback():
    responses = browser.local_storage.storage.get("responses", "?" * 10)
    feedback = browser.document.getElementById("feedback")
    style = "padding:2px;align:center;border: 1px solid black"
    for i in range(10):
        span = browser.document.createElement("span")
        if i > len(responses) - 1:
            t = browser.document.createTextNode(" ? ")
            span["style"] = style + ";color: white;"
            span.appendChild(t)
        elif responses[i] == "-":
            t = browser.document.createTextNode(" ✘ ")
            span["style"] = style + ";color: red;"
            span.appendChild(t)
        elif responses[i] == "+":
            t = browser.document.createTextNode(" ✔ ")
            span["style"] = style + ";color: green;"
            span.appendChild(t)
        feedback.attach(span)
        padding = browser.document.createElement("span")
        padding["style"] = "width: 20px"
        just_space = browser.document.createTextNode(" ")
        padding.attach(just_space)
        feedback.attach(padding)


def draw_languages():
    language_names = {
        "ab": "Аԥсуа",
        "ace": "Bahsa Acèh",
        "am": "አማርኛ",
        "an": "Aragonés",
        "ar": "العربية",
        "ast": "Asturianu",
        "as": "অসমীয়া",
        "az": "Azərbaycanca",
        "bas": "Basaa",
        "ba": "Башҡортса",
        "be": "Беларуская",
        "bg": "Български",
        "bn": "বাংলা",
        "br": "Brezhoneg",
        "bxr": "Буряад",
        "ca": "català",
        "cak": "Kaqchikel",
        "ckb": "کوردی ناوەندی",
        "cnh": "Laiholh (Hakha)",
        "co": "Corsu",
        "cs": "Čeština",
        "cv": "Чӑвашла",
        "cy": "Cymraeg",
        "da": "Dansk",
        "de": "Deutsch",
        "dsb": "Dolnoserbšćina",
        "dv": "ދިވެހި",
        "el": "Ελληνικά",
        "en": "English",
        "eo": "Esperanto",
        "es": "Español",
        "et": "eesti",
        "eu": "Euskara",
        "fa": "فارسی",
        "ff": "Pulaar-Fulfulde",
        "fi": "suomi",
        "fo": "Føroyskt",
        "fr": "Français",
        "fy-NL": "Frysk",
        "ga-IE": "Gaeilge",
        "gl": "Galego",
        "gn": "Guarani",
        "ha": "Hausa",
        "he": "עברית",
        "hi": "हिंदी",
        "hr": "Hrvatski",
        "hsb": "Hornjoserbšćina",
        "hu": "Magyar",
        "hy-AM": "Հայերեն",
        "ia": "Interlingua",
        "id": "Bahasa Indonesia",
        "is": "Íslenska",
        "it": "Italiano",
        "ja": "日本語",
        "kab": "Taqbaylit",
        "ka": "ქართული",
        "kbd": "Адыгэбзэ (Къэбэрдэй)",
        "kk": "Қазақ тілі",
        "kmr": "Kurdî (Kurmancî)",
        "ko": "한국어",
        "kpv": "Коми кыв",
        "kw": "Kernowek",
        "ky": "Кыргызча",
        "lg": "Luganda",
        "lij": "Lìgure",
        "lt": "Lietuvių",
        "lv": "Latviešu",
        "mk": "Македонски",
        "ml": "മലയാളം",
        "mn": "Монгол хэл",
        "ms": "Bahasa Melayu",
        "mt": "Malti",
        "myv": "Эрзякс",
        "my": "ဗမာ",
        "nb-NO": "Norsk (bokmål)",
        "ne-NP": "नेपाली",
        "nl": "Nederlands",
        "nn-NO": "Norsk (nynorsk)",
        "oc": "Occitan",
        "or": "ଓଡ଼ିଆ",
        "pa-IN": "ਪੰਜਾਬੀ",
        "pl": "polski",
        "pt": "Português",
        "rm-sursilv": "romontsch sursilvan",
        "rm-vallader": "Rumantsch vallader",
        "ro": "Română",
        "ru": "Русский",
        "rw": "Ikinyarwanda",
        "sah": "Саха тыла",
        "scn": "Sicilianu",
        "sc": "Sardu",
        "si": "සිංහල",
        "sk": "slovenčina",
        "sl": "slovenščina",
        "sq": "Shqip",
        "sr": "Српски",
        "sv-SE": "Svenska",
        "sw": "Kiswahili",
        "syr": "ܣܘܼܪܝܝܐ",
        "ta": "தமிழ்",
        "te": "తెలుగు",
        "tg": "Тоҷикӣ",
        "th": "ไทย",
        "tl": "Tagalog",
        "tr": "Türkçe",
        "tt": "Татарча",
        "uk": "Українська",
        "ur": "اردو",
        "uz": "O‘zbek",
        "vec": "Vèneto",
        "vi": "Việt",
        "vot": "vad̕d̕a",
        "zh-CN": "汉语（中国大陆）",
        "zh-HK": "中文（香港）",
        "zh-TW": "華語（台灣）",
    }

    def update_language_list(ajax_obj):
        j = json.loads(ajax_obj.read())
        current_language = browser.local_storage.storage["currentLanguage"]
        language_selector = browser.document.getElementById("languages")
        for language in sorted(j["languages"]):
            option = browser.document.createElement("option")
            text = browser.document.createTextNode(
                language_names.get(language, language)
            )
            if language == current_language:
                option["selected"] = True
            option["value"] = language
            option.attach(text)
            language_selector.attach(option)

    browser.ajax.get(
        "/get_languages", mode="text", oncomplete=update_language_list
    )


def get_clip_and_then(fn):
    def process_and_call(ajax_obj):
        j = json.loads(ajax_obj.read())
        fn(j)

    tasks = json.loads(browser.local_storage.storage["enabledTasks"])
    enabled = "|".join(k for k in tasks if tasks[k])
    current_language = browser.local_storage.storage["currentLanguage"]

    url = (
        f"/get_clips?nlevels=10&enabled={enabled}&level={get_current_level}"
        f"&language={current_language}"
    )
    return browser.ajax.get(url, mode="text", oncomplete=process_and_call)


def draw_answer(active_input):
    guess = active_input.value
    correct = active_input["data-value"]
    # TODO: improve styling, e.g. variable name should be like_this
    # TODO: also, maybe split it into two functions? also, can't we just
    # TODO: access the parent node by ID?
    if guess.lower() == correct.lower():
        on_correct_answer()
        answer = browser.document.createElement("span")
        answer["class"] = "correct"
        answer_text_node = browser.document.createTextNode(correct + " ")
        answer.attach(answer_text_node)
        active_input.parentNode.insertBefore(answer, active_input.nextSibling)
        active_input.remove()
    else:
        on_incorrect_answer()
        shouldBe = browser.document.createElement("span")
        shouldBe.setAttribute("style", "color: green")
        correctTextNode = browser.document.createTextNode(
            " [" + correct + "] "
        )
        shouldBe.appendChild(correctTextNode)
        active_input.parentNode.insertBefore(
            shouldBe, active_input.nextSibling
        )

        incorrectAnswer = browser.document.createElement("span")
        incorrectAnswer.setAttribute("style", "color: red")
        incorrectTextNode = browser.document.createTextNode(guess)
        incorrectAnswer.appendChild(incorrectTextNode)
        active_input.parentNode.insertBefore(
            incorrectAnswer, active_input.nextSibling
        )

        active_input.remove()


def user_input(ev, active_input):
    if ev.key != "Enter":
        return
    draw_answer(active_input)
    clear_feedback()
    draw_feedback()


def draw_challenge_blanks_mode(current_text, gap):
    tbox = browser.document.getElementById("textbox")
    p = browser.document.createElement("p")
    for i in range(len(current_text)):
        if i == gap:
            el = browser.document.createElement("input")
            el.bind("keypress", lambda ev: user_input(ev, el))
            el["id"] = "t" + str(i)
            el["data-focus"] = "true"
            # TODO: this should actually be a class:
            el["style"] = "font-size: 110%; border: thin dotted #000; "
            el["style"] += f"width: {len(current_text[i])}ch"
            el["data-value"] = current_text[i]
            p.attach(el)
            p.attach(" ")
        else:
            p.attach(current_text[i] + " ")
    tbox.attach(p)


def init_audio_player(locale, audio_path):
    player = browser.document.getElementById("player")
    source = browser.document.getElementById("audioSource")
    source.src = (
        "/static/cv-corpus-6.1-2020-12-11/" + locale + "/clips/" + audio_path
    )
    player.load()
    player.bind("ended", on_audio_ended)


def check_input_search(e):
    res = e.target.getAttribute("data-value")
    if res == "false":
        e.target.setAttribute("class", "wordGuessIncorrect")
    else:
        e.target.setAttribute("class", "wordGuessCorrect")

    # TODO: actually give some feedback - tricky, because it has to happen once

    clear_feedback()
    draw_feedback()


def draw_challenge_search_mode(current_text, distractor):
    allWords = []
    distractors = []
    repl = []
    tbox = browser.document.getElementById("textbox")
    for i in range(3):
        distractors.append(random.randint(0, len(distractor) - 1))
        repl.append(random.randint(0, len(current_text) - 1))

    replacements = current_text
    for i in range(3):
        d = distractors[i]
        word = current_text[repl[i]]
        replacements.remove(word)

        tw = browser.document.createElement("span")
        tw.bind("click", check_input_search)
        tw["class"] = "wordGuess"
        tw["data-value"] = "true"
        text = browser.document.createTextNode(word.lower())
        tw.attach(text)
        allWords.append(tw)

        fw = browser.document.createElement("span")
        fw.bind("click", check_input_search)
        fw["class"] = "wordGuess"
        fw["data-value"] = "false"
        text = browser.document.createTextNode(distractor[d].lower())
        fw.attach(text)
        allWords.append(fw)

    random.shuffle(allWords)
    for i, word in enumerate(allWords):
        if i == 3:
            tbox.attach(browser.document.createElement("p"))
        tbox.attach(word)


def draw_clip(clip):
    current_text = clip["question"]["tokenized"]
    gap = clip["gap"]
    init_audio_player(clip["question"]["locale"], clip["question"]["path"])
    distractor = clip.get("distractor")
    if clip["task_type"] == "search":
        draw_challenge_search_mode(current_text, distractor)
    elif clip["task_type"] == "choice":
        draw_challenge_choice_mode(current_text, gap, distractor)
    else:
        draw_challenge_blanks_mode(current_text, gap)


def open_modal(el_):
    pass  # TODO


def change_level(el):
    browser.local_storage.storage["currentLevel"] = el.value
    browser.document.location.reload()


def update_task(el):
    task_type = el.children[0]["name"].split("enable")[1]
    tasks = json.loads(browser.local_storage.storage["enabledTasks"])
    if "checked" in el:
        tasks[task_type] = True
    else:
        tasks[task_type] = False
    browser.local_storage.storage["enabledTasks"] = json.dumps(tasks)


def change_language(el):
    browser.local_storage.storage["responses"] = ""
    browser.local_storage.storage["currentLanguage"] = el.value
    browser.document.location.reload()


def bind_events():
    find = browser.document.getElementById
    find("open_modal_empty_div").bind(
        "click", lambda ev: open_modal(find("open_modal_empty_div"))
    )
    find("help").bind("click", lambda ev: open_modal(find("help")))
    find("levels").bind("click", lambda ev: change_level(find("levels")))
    for el in browser.document.getElementsByClassName("cb"):
        el.bind("click", lambda ev: update_task(el))
    find("languages").bind(
        "change", lambda ev: change_language(find("languages"))
    )


def get_current_level():
    return int(browser.local_storage.storage.get("currentLevel", "1"))


def draw_levels():
    levels = browser.document.getElementById("levels")
    current_level = get_current_level()
    for i in range(1, 11):
        level = browser.document.createElement("option")
        level_text = browser.document.createTextNode(str(i))
        if i == current_level:
            level.selected = "true"
        level.value = str(i)
        level.attach(level_text)
        levels.attach(level)


def draw_challenge_types():
    tasks = json.loads(browser.local_storage.storage["enabledTasks"])
    for el in browser.document.getElementsByClassName("cb"):
        task_type = el.children[0]["name"].split("enable")[1]
        if tasks.get(task_type):
            el.checked = True


def user_input_choice(e, correct, tid):
    # FIXME: if user already answered, don't mark feedback
    responses = browser.local_storage.storage["responses"]
    answer = browser.document.getElementById(tid)
    other = (
        browser.document.getElementById(tid[1:])
        if tid[0] == "d"
        else browser.document.getElementById("d" + tid)
    )
    if correct == 1:
        answer.setAttribute("class", "correct")
        responses += "+"
    else:
        answer.setAttribute("class", "incorrect")
        other.setAttribute("class", "correct")
        responses += "-"
    answer.removeAttribute("onClick")
    other.removeAttribute("onClick")
    browser.local_storage.storage["responses"] = responses
    clear_feedback()
    draw_feedback()


def draw_challenge_choice_mode(current_text, gap, distractors):
    tbox = browser.document.getElementById("textbox")
    distractor = distractors[0]
    for i in range(len(current_text)):
        if i != gap:
            tbox.attach(browser.document.createTextNode(current_text[i] + " "))
            continue
        if i == 0:
            distractor = distractor[0].upper() + distractor[1:]
        else:
            distractor = distractor.lower()

        def put_correct():
            span = browser.document.createElement("span")
            span["id"] = "t" + str(i)
            span[
                "style"
            ] = f"border: thin dotted #000; width: {len(current_text[i])}ch"
            span["data-value"] = "{current_text[i]}"
            span.bind(
                "click", lambda event: user_input_choice(event, 1, span["id"])
            )
            text = browser.document.createTextNode(current_text[i])
            span.attach(text)

            tbox.attach(span)

        def put_distractor():
            span = browser.document.createElement("span")
            span["id"] = "dt" + str(i)
            span[
                "style"
            ] = f"border: thin dotted #000; width: {len(current_text[i])}ch"
            span["data-value"] = "{current_text[i]}"
            span.bind(
                "click", lambda event: user_input_choice(event, 0, span["id"])
            )
            text = browser.document.createTextNode(distractor)
            span.attach(text)
            tbox.attach(span)

        if random.random() > 0.5:
            tbox.attach(browser.document.createTextNode("{"))
            put_correct()
            tbox.attach(browser.document.createTextNode(","))
            put_distractor()
            tbox.attach(browser.document.createTextNode("}"))
        else:
            tbox.attach(browser.document.createTextNode("{"))
            put_distractor()
            tbox.attach(browser.document.createTextNode(","))
            put_correct()
            tbox.attach(browser.document.createTextNode("}"))


def main():
    bind_events()
    draw_languages()
    draw_feedback()
    draw_levels()
    draw_challenge_types()
    get_clip_and_then(draw_clip)


if __name__ == "__brython__":
    main()
