# Format guidelines for data

This document aims to give information on how data should be stored in order
to be able to use it. This is for deployment of languages which are not currently
in Common Voice, although we highly recommend that languages get into Common Voice.

## Files

Data consists of two things:

- a directory called `clips/` with `.mp3` files inside
- a file `validated.tsv`

An example for K'iche':

```bash
$ find quc/ | head -5
quc/
quc/validated.tsv
quc/clips
quc/clips/02_19_2.mp3
quc/clips/01_11_6.mp3
```

The file `validated.tsv` should consist of a tab-separated file with a header and 10 columns.
Each line corresponds to one audio file,

```
$ head -5 quc/validated.tsv
client_id	path	sentence	up_votes	down_votes	age	gender	accent	locale	segment
_	01_01_5.mp3	Xkotiʼ pa qʼayes xoqʼik.	_	_	_	_	_	quc	_
_	01_01_7.mp3	Xutaʼ sachbʼal umak che ri unan.	_	_	_	_	_	quc	_
_	01_01_9.mp3	Rajawaxik ri akʼalabʼ kikinimaj kitzij le kinan, kitat.	_	_	_	_	_	quc	_
_	03_15_14.mp3	kawaj kimbʼe pa tinamit	_	_	_	_	_	quc	_
```

The only columns currently relevant are the `path`, `sentence` and `locale`. The other columns can be left blank.
