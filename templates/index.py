import json

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
    responses += "-"
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
    pass  # TODO


def get_clip_and_then(fn):
    def process_and_call(ajax_obj):
        j = json.loads(ajax_obj.read())
        fn(j)

    url = "/get_clips?nlevels=10&enabled=blanks&level=1&language=pl"
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


def draw_clip(clip):
    current_text = clip["question"]["tokenized"]
    gap = clip["gap"]
    init_audio_player(clip["question"]["locale"], clip["question"]["path"])
    draw_challenge_blanks_mode(current_text, gap)


def open_modal(el_):
    pass  # TODO


def change_level(el_):
    pass  # TODO


def update_task(el_):
    pass  # TODO


def change_language(el_):
    pass  # TODO


def bind_events():
    find = browser.document.getElementById
    find("open_modal_empty_div").bind(
        "click", lambda ev: open_modal(find("open_modal_empty_div"))
    )
    find("help").bind("click", lambda ev: open_modal(find("help")))
    find('levels').bind('click', lambda ev: change_level(find('levels')))
    for el in browser.document.getElementsByClassName('cb'):
        el.bind('click', lambda ev: update_task(el))
    find('languages').bind(
        'change', lambda ev: change_language(find('languages'))
    )

def main():
    bind_events()
    draw_languages()
    draw_feedback()
    get_clip_and_then(draw_clip)


main()