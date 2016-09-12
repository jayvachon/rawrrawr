'use strict';

var ngrams = require('./ngrams');
var _ = require('lodash');

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
	},

	processSongs: function(app, cache, songIds) {
		cache.getSongs(app, songIds, function(songs) {
			if (!songs) {
				console.log('no songs were found');
				return;
			}
			ngrams.getSongs(_.map(songs, function(n) { return n.songLyrics; }), function(n) {
				console.log(n);
			});
		})
	}
};

module.exports = engine;