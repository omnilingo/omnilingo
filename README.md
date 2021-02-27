# commonvoice-languagelearning

The goal of the project is to help you practice listening comprehension.

It works by giving you random sentences in the language you're learning and
asking you to fill in the gaps. The sentences were submitted by contributors
to [https://commonvoice.mozilla.org/](Mozilla Common Voice) platform.

# Deployment

Right now it only works with Finnish. To bootstrap it, `git clone`
the repository, then run the following commands:

```
cd templates && wget --no-check-certificate http://cl.indiana.edu/\~ftyers/cv/cv-corpus-6.1-2020-12-11.tar.gz -O- | tar zxf -
pip install -r requirements.txt
./main.py
```

The project should be accessible through http://localhost:5001/

Happy hacking! :)
