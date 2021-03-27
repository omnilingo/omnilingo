# OmniLingo

![Project in action](doc/demo.gif) 

# What is this?

The goal of the project is to help you practice listening comprehension.

It works by giving you random sentences in the language you're learning and
asking you to fill in the gaps. The sentences were submitted by contributors
to [Mozilla Common Voice](https://commonvoice.mozilla.org/) platform.

The project aims to not require any knowledge of a meta language in order to start
learning.  If you are interested in a more traditional course creation project,
check out [LibreLingo](https://github.com/kantord/LibreLingo/).

The game works by ordering the the questions by difficulty, then
you are given batches of five with a random task for each of the questions. When you
sucessfully answer a batch of five in less time than the audio takes to play, then
you advance a level and get given a new batch of five. 

# Tasks

* Fill in the blanks: A cloze-style task
* Drag and drop: Get a set of tiles and click on them to build a word or sentence
* Pick the right one: Get two options and choose the right one
* Spot the word: Get set of six tiles and click on the ones that appear in the audio

# Keys

* `Space`: Play the recording
* `Enter`: 
  1. Submit and check if you got it right 
  2. If already submitted, move to the next recording

# Data

The data comes from the Common Voice [dataset releases](http://commonvoice.mozilla.org/datasets).

# Target audience

This system is designed with two main user groups in mind:

* People who want to learn a new language
* People who want to learn how to write their native language

The system endeavours to be audio first, with knowledge of writing built 
up by hearing.

# Contact

## Talk to us!

* IRC: `irc.freenode.net` `#OmniLingo`
* Matrix: `#OmniLingo:matrix.org`  (access via [Element](https://app.element.io/#/room/#OmniLingo:matrix.org))
* Telegram: [OmniLingo](https://t.me/omnilingo)

## Follow us!

* https://polyglot.city/@omnilingo
* https://www.reddit.com/r/OmniLingo/
* https://twitter.com/OmniLingo

# Available languages

All of the languages available in [Common Voice 6.1](https://commonvoice.mozilla.org/datasets) dataset.

Abkhaz · Arabic · Assamese · Breton · Catalan · Hakha Chin · Czech · Chuvash · Welsh · German · Dhivehi · Greek · English · Esperanto · Spanish · Estonian · Basque · Persian · Finnish · French · Frisian · Irish · Hindi · Upper Sorbian · Hungarian · Interlingua · Indonesian · Italian · Japanese · Georgian · Kabyle · Kyrgyz · Luganda · Lithuanian · Latvian · Mongolian · Maltese · Dutch · Odia · Punjabi · Polish · Portuguese · Romansh Sursilvan · Romansh Vallader · Romanian · Russian · Kinyarwanda · Sakha · Slovenian · Swedish · Tamil · Thai · Turkish · Tatar · Ukrainian · Vietnamese · Votic · Chinese (China) · Chinese (Hong Kong) · Chinese (Taiwan)

If you want to work with a language not yet in Common Voice, we highly recommend that you [get set up in Common Voice](https://github.com/common-voice/common-voice/blob/main/docs/LANGUAGE.md), but 
in the meantime, you can check out the [format guidelines](docs/FORMAT.md).

# Releases 

* [0.1.0](https://github.com/omnilingo/omnilingo/tree/v0.1.0) Functional proof of concept

# Deployment

To bootstrap the project for Finnish, `git clone` the repository, then run the following
commands:

```bash
pip install -r requirements.txt
make
./main.py
```

The project should be accessible through http://localhost:5001/index.html

To add more languages, download a dataset from [Common Voice](https://commonvoice.mozilla.org/datasets) and 
put it in `cv-corpus-6.1-2020-12-11/`.

Happy hacking! :)

## Dependencies

For those who prefer to install their dependencies through their package manager in Debian/Ubuntu, the 
following dependencies are available there:
```
python3-mutagen - audio metadata editing library (Python 3)
python3-jieba - Jieba Chinese text segmenter (Python 3)
python3-flask - micro web framework based on Werkzeug and Jinja2 - Python 3.x
```

# Acknowledgements

Logo by [Fabi Yamada](https://society6.com/yamadamx)! Licensed under CC-BY.


