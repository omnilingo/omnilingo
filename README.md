# commonvoice-languagelearning

![Project in action](doc/demo.gif) 

The goal of the project is to help you practice listening comprehension.

It works by giving you random sentences in the language you're learning and
asking you to fill in the gaps. The sentences were submitted by contributors
to [Mozilla Common Voice](https://commonvoice.mozilla.org/) platform.

The sentences are ranked according to difficulty, and you can choose a level
from 1 to 10 where 1 is the easiest and 10 is the hardest.

# Keys

* `Tab`: Play the recording
* `Enter`: Submit and check if you got it right
* `Space`: Next sentence

# Deployment

To bootstrap the project, `git clone` the repository, then run the following
commands:

```bash
cd templates && wget --no-check-certificate http://cl.indiana.edu/\~ftyers/cv/cv-corpus-6.1-2020-12-11.tar.gz -O- | tar zxf - && cd ..
pip install -r requirements.txt
./main.py fi
```

With the above code it only works with Finnish language, but you can replace
`fi` with any language code you download from [Common Voice](https://commonvoice.mozilla.org/datasets)

The project should be accessible through http://localhost:5001/

Happy hacking! :)
