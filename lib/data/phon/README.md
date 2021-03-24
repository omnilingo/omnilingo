# Grapheme to phoneme 

This directory contains grapheme to phoneme lookup tables for languages in Common Voice 
that are not in [Epitran](https://github.com/dmort27/epitran). These are used
for calculating the phonetic edit distance using [Panphon](https://github.com/dmort27/panphon).

The files are two column. The first column is orthographic sequence, the second
column is IPA symbol.

```
...
c	k
ch	χ
d	d
dd	ð
...
```

The algorithm that processes the file first segments the input token in sequences in
an LRLM fashion. Then it looks up the segments in the table.

The system is very rudimentary and it would be better to implement real g2p systems.
