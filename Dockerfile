FROM python:3.9

ADD ./requirements.txt .
RUN python3 -m pip install -r requirements.txt
RUN mkdir templates && wget --no-check-certificate http://cl.indiana.edu/~ftyers/cv/cv-corpus-6.1-2020-12-11.tar.gz -O- | tar zxf -

ADD ./main.py .
ADD templates templates

ENTRYPOINT ["./main.py"]
