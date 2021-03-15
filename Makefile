all: static/fi

pip: cv-corpus-6.1-2020-12-11/fi
	pip install -r requirements.txt

cv-corpus-6.1-2020-12-11/fi:
	wget --no-check-certificate http://cl.indiana.edu/~ftyers/cv/cv-corpus-6.1-2020-12-11.tar.gz -O- | tar zxf -

cache/fi: cv-corpus-6.1-2020-12-11/fi
	mkdir -p cache
	./lib/index.py ./cv-corpus-6.1-2020-12-11/fi/

static/fi: cache/fi
	mkdir -p static
	./lib/deploy.py cv-corpus-6.1-2020-12-11/fi/ cache/fi static/
clean:
	rm -rf cache/* static/*
