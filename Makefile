targets=$(foreach l,$(shell cd cv-corpus-6.1-2020-12-11/; ls),static/$(l) cache/$(l))

all: $(targets) static/indexes

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
