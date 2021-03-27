#!/usr/bin/env python3

import sys 
import os
from pathlib import Path
import languages as codes
from orthography import alternatives

import json

def collect(cache_dir, static_dir): 
	languages = [p.name for p in Path(cache_dir).glob('*') if p.name.count('.voc') == 0]
	languages.sort()
	indexes = {} 
	for language in languages:
		display_name = codes.language_names[language]
		lines = len(open(cache_dir + '/' + language).readlines())
		indexes[language] = {'display': display_name, 'length': lines}
		meta_fd = open(static_dir + '/' + language + '/meta', 'w')
		json.dump({'accept': alternatives(language)}, meta_fd)
		meta_fd.close()

	static_fd = open(static_dir + '/' + 'indexes', 'w')
	json.dump(indexes, static_fd)
	static_fd.close()

	return [i for i in indexes.keys()]

if __name__ == "__main__":
	indexed = collect(os.path.abspath(sys.argv[1]), 'static/')

	print('Indexed:', ' '.join(indexed), file=sys.stderr)

