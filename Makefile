targets=$(foreach l,$(shell cd cv-corpus-6.1-2020-12-11/; ls),static/$(l) cache/$(l))

all: $(targets) static/indexes

lib/data/dict/zh:
	wget -O - https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz | zcat > $@

#v-corpus-6.1-2020-12-11/.d:
#	mkdir -p cv-corpus-6.1-2020-12-11
#	touch $@

#cv-corpus-6.1-2020-12-11/fi: cv-corpus-6.1-2020-12-11/.d
#	wget --no-check-certificate http://cl.indiana.edu/~ftyers/cv/cv-corpus-6.1-2020-12-11.tar.gz -O- | tar zxf -

static/indexes: $(targets)
	mkdir -p static
	./lib/collect.py ./cache/ ./static/

cache/%: ./cv-corpus-6.1-2020-12-11/%
	mkdir -p cache
	./lib/index.py ./cv-corpus-6.1-2020-12-11/$*

static/%: ./cache/%
	mkdir -p static
	./lib/deploy.py cv-corpus-6.1-2020-12-11/$* $< static/

distractors: cache/%
	./lib/distractors.py cache/$* static/$*

clean:
	rm -rf cache/* static/*
