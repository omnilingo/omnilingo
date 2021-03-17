all: cache/fi static/fi

pip: cv-corpus-6.1-2020-12-11/fi
	pip3 install -r requirements.txt

cv-corpus-6.1-2020-12-11/fi:
	wget --no-check-certificate http://cl.indiana.edu/~ftyers/cv/cv-corpus-6.1-2020-12-11.tar.gz -O- | tar zxf -

cache/%: ./cv-corpus-6.1-2020-12-11/% pip
	mkdir -p cache
	./lib/index.py ./cv-corpus-6.1-2020-12-11/$*

static/%: ./cache/%
	mkdir -p static
	./lib/deploy.py cv-corpus-6.1-2020-12-11/$* $< static/

clean:
	rm -rf cache/* static/*
