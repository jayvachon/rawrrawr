import sys, json, nltk, string, argparse
from nltk import ngrams

min_ngram = 4 # minimum word string to search for
max_ngram = 5 # maximum word string to search for
ngram_lists = [i+min_ngram for i in xrange(max_ngram-min_ngram+1)] # array of ngram lengths

parser = argparse.ArgumentParser()
parser.add_argument('--songs', nargs='*')
parser.add_argument('--lyrics')

def read_in():
	lines = sys.stdin.readlines()
	return json.loads(lines[0])

def main(argv):
	try:
		process_type = argv[0]
		data = argv[1:]

		if '--lyrics' in process_type:
			# print 'LYRICS: ' + lyrics
			print process_lyrics(data if data else read_in())
		if '--songs' in process_type:
			# print 'SONGS:'
			# print songs
			print process_songs(data if data else read_in())
		sys.exit(1)
	except Exception, e:
		return 'python error: ' + str(e)

'''
Takes a string
'''
def process_lyrics(lyrics):

	try:
		lyrics = str(lyrics)

		# remove punctuation
		lyrics = lyrics.translate(None, string.punctuation)
		all_ngrams = []

		for n in ngram_lists:
			grams = ngrams(lyrics.split(), n)
			all_ngrams.append([' '.join(gram) for gram in grams])

		# print all_ngrams
		return all_ngrams

	except Exception, e:
		return 'python error: ' + str(e)
'''
Takes an array of strings
'''
def process_songs(songs):

	# first song in array = song to compare
	# every other song in array is indexed by its Genius Song ID
	# (except for the song to compare, which is removed from its original index)

	try:
		if type(songs) is not list:
			songs = songs.split('" "')
		song = songs.pop(0)

		lyrics = process_lyrics(song)
		matches = []

		for idx, song in enumerate(songs):
			compare_lyrics = process_lyrics(song)
			matches.append([])
			for i in xrange(0, len(ngram_lists)):
				matches[idx].append(list(set(lyrics[i]).intersection(set(compare_lyrics[i]))))

		return matches
	except Exception, e:
		return 'python error: ' + str(e)

if __name__ == '__main__':
	main(sys.argv[1:])