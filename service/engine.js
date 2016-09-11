'use strict';

var ngrams = require('./ngrams');

var engine = {

	findReferences: function(app, cache, phrase) {
		cache.getAllSongs(app, function(songs) {
			var matches = [];
			for (var i = 0; i < songs.length; i++) {
				if (songs[i].songLyrics.toLowerCase().indexOf(phrase) !== -1)
					matches.push(songs[i]);
			}
			console.log('matches: ' + matches.length);
			for (var i = 0; i < matches.length; i++) {
				console.log((i+1) + ': ' + matches[i].title + ' by ' + matches[i].artistName);
			}
		});
	},

	findReferencesFromSong: function(app, cache, songId) {
		cache.getSong(app, songId, function(song) {
			
			if (!song) {
				console.log("no song with id " + songId + " was found");
				return;
			}

			ngrams.getSongs(song.songLyrics, function(n) {
				console.log(n);
			});
		});
	},

	processLyrics: function(app, cache, songId) {
		cache.getSong(app, songId, function(song) {
			if (!song) {
				console.log("no song with id " + songId + " was found");
				return;
			}

			// console.log(song.songLyrics);

			ngrams.getLyrics(song.songLyrics, function(n) {
				console.log(n);
			});
		})
	}
};

module.exports = engine;