import math
import collections

from Levenshtein import distance

# $ head templates/cv-corpus-6.1-2020-12-11/fi/validated.tsv
# client_id	path	sentence	up_votes	down_votes	age	gender	accent	locale	segment


def split_into_buckets(
    seq, key_fn, nbuckets=10, build_reverse_partitions=True
):
    seq = list(seq)
    seq.sort(key=key_fn)
    partition_size = len(seq) // nbuckets
    if build_reverse_partitions:
        reverse_partitions = {level: [] for level in range(nbuckets)}
    partitions = {}
    for level in range(nbuckets):
        partitions[level] = seq[
            partition_size * level : partition_size * (level + 1)
        ]
        if build_reverse_partitions:
            for item in partitions[level]:
                reverse_partitions[item] = level
    if build_reverse_partitions:
        return partitions, reverse_partitions
    else:
        return partitions


def get_distractors(frequencies):

    # TODO: buckets should be dependent on size of input, more lines -> more buckets
    print('[frequencies]', len(frequencies))
    if len(frequencies) == 0:
        return distractors

    m = {}

    distractors = collections.defaultdict(list)

    MIN_FREQ = 1
    if len(frequencies) < 5000:
        for token1 in frequencies:
            if token1 not in m:
                m[token1] = {}
            for token2 in frequencies:
                if token2 not in m[token1]:
                    m[token1][token2] = distance(token1, token2)
    else:
        MIN_FREQ = 5
        frequencies = collections.Counter({k: frequencies[k] for k in frequencies if frequencies[k] > MIN_FREQ})
        nbuckets = 10 ** int(math.log(len(frequencies), 50))
        buckets = split_into_buckets(
            frequencies,
            nbuckets=nbuckets,
            key_fn=lambda x: frequencies[x],
            build_reverse_partitions=False,
        )
        for level in buckets:
            for token1 in buckets[level]:
                for token2 in buckets[level]:
                    if token1 not in m:
                        m[token1] = {}
                    if token2 not in m[token1]:
                        m[token1][token2] = distance(token1, token2)


    for token1 in frequencies:
        if token1 not in m:
            continue
        # (4, 'ollen')
        d = [(t, l) for (l, t) in m[token1].items()]
        d.sort()
        # do something better here with partitioning
        if d[1:11]:
            distractors[token1] = d[1:11]  # skip the first one which will be 0
        #print((token1, distractors[token1]))
    print('[distractors] generated',len(distractors.keys()),'distractors')
    return distractors

