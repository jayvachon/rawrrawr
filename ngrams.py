import sys, json, nltk, string
from nltk import ngrams

def read_in():
	lines = sys.stdin.readlines()
	return json.loads(lines[0])

def main(argv):
	if argv:
		process(argv[0])
		sys.exit(1)
	else:
		process(read_in())

def process(lyrics):

	lyrics = lyrics.translate(None, string.punctuation)

	min_ngram = 4
	max_ngram = 6

	ngram_lists = [i+min_ngram for i in xrange(max_ngram-min_ngram+1)]
	
	# TODO: create list of ngrams between min and max and send out array of ngrams

	n = 4
	grams = ngrams(lyrics.split(), n)
	out = []
	for gram in grams:
		out.append(gram)
	print json.dumps(out)

if __name__ == '__main__':
	main(sys.argv[1:])