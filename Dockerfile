FROM python:3.9

ADD ./requirements.txt .
RUN python3 -m pip install -r requirements.txt
RUN mkdir -pv templates/cv-corpus-6.1-2020-12-11/ && echo !$ &&  wget --no-check-certificate https://cl.indiana.edu/~ftyers/cv/cv-corpus-6.1-2020-12-11/fi/validated.tsv https://cl.indiana.edu/~ftyers/cv/cv-corpus-6.1-2020-12-11/fi/validated.tsv && mkdir clips && cd clips && wget --no-check-certificate  https://cl.indiana.edu/~ftyers/cv/cv-corpus-6.1-2020-12-11/fi/clips/common_voice_fi_23997016.mp3

ADD ./main.py .
ADD templates templates

ENTRYPOINT ["./main.py"]
