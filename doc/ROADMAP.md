# Roadmap

## 0.1.0

* ~~Functional proof of concept~~
* ~~Four task types~~

## 0.2.0 

* ~~Rewrite using more maintainable design~~
* ~~Implement a graph-based structure for task selection~~
* ~~Generate distractors using panphon~~
* ~~Phonemisers for every non-Latin based language~~
* ~~Blacklist tracks functionality~~

## 0.3.0

* User data storage, remote storage optional
* Settings modal
* Better internal datastructures/data management
  * It might be worth each question having a single index id, e.g. the hash
* Implement some kind of testing framework

## 0.4.0

* Better modelling of difficulty (perplexity/sec)
* Better phonemisers for Latin-based languages (e.g. Irish)
* Better distractors for English, German, Japanese and Chinese
  * Implement phonemisation for English
  * Take into account frequency and do something more clever with capitalisation (truecasing)
  * Do something sensible with CJK characters when building the tree (e.g. not 400 trees) 

## 0.5.0

* Better tokenisation and tagging, 
  * e.g. to distinguish `PROPN`/`NOUN` in `de`

## 0.6.0

* More beautiful end-user UI (CSS etc.)

## 0.7.0 

* Better distractor generation
  * Should perhaps be tunable with features like embedding similiarity, POS, etc. in addition to surface form

## Post 1.0.0

* Distractor generation tailored to the user, perhaps an online version that learns like a GAN?
