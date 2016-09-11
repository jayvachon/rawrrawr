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

	# remove punctuation
	lyrics = lyrics.translate(None, string.punctuation)

	min_ngram = 4
	max_ngram = 6

	ngram_lists = [i+min_ngram for i in xrange(max_ngram-min_ngram+1)]
	
	all_ngrams = []

	for n in ngram_lists:
		grams = ngrams(lyrics.split(), n)
		all_ngrams.append({ n: [list(gram) for gram in grams] })

	print all_ngrams

if __name__ == '__main__':
	main(sys.argv[1:])