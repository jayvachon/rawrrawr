'use strict';

var ngrams = require('./ngrams');
var _ = require('lodash');

// TODO
/*String.prototype.replaceAll = function(fromString, toString) {
	return this.replace(/[fromString]/g, toString);
};*/

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

	processSongs: function(app, cache, compareSong) {
		console.log('process songs...');
		// cache.getSongs(app, songIds, function(songs) {
		cache.getAllSongs(app, function(songs) {

			if (!songs) {
				console.log('no songs were found');
				return;
			}

			// 1. populate an array with the songs
			// index the songs by their songId + 1
			var idArray = []
			for (var i = 0; i < songs.length; i++) {
				idArray[songs[i].songId+1] = songs[i];
			}

			// 2. move the first song in the supplied ids list (song to check for references) to the first index
			// remove the song from its original position
			var firstSong = _.find(songs, function(n) { return n.songId = /*songIds[0]*/compareSong; });
			idArray[firstSong.songId+1] = '';
			idArray[0] = firstSong;

			// 3. prepare the array for the python script by turning the array into a string
			var input = '';
			var lyrics = _.map(idArray, function(n) { return n ? n.songLyrics : ' '; });
			for (var i = 0; i < lyrics.length; i++) {
				var l = lyrics[i].replace(/"/g, '');
				input += '"' + l + '" ';
			}

			// 4. send out the data and wait for a response
			console.log('find ngrams...');
			ngrams.getSongs(input, function(n) {

				n = JSON.parse(n.replace(/'/g, '"'));

				// rebuild the array opposite the way from above
				var found = [];

				// 1. remove the song being compared
				var matchSongs = _.filter(songs, function(n) { return n.songId !== firstSong.songId; });

				// 2. build an array of matches, including the song info
				for (var i = 0; i < matchSongs.length; i++) {
					var songId = matchSongs[i].songId;
					found[songId] = {
						song: matchSongs[i],
						matches: n[songId]
					};
				}

				var matches = _.filter(found, function(n) { 
					return n !== null && n !== undefined && (n.matches[0].length > 0 || n.matches[1].length > 0)
				});

				console.log(
					_.map(matches, function(n) { 
						return n.song.title + ' by ' + n.song.artistName + '\n' + _.flatten(n.matches);
						/*return {
							title: n.song.title + ' by ' + n.song.artistName,
							matches: n.matches
						};*/
					}));

				console.log("found " + matches.length + " matches");
				// console.log("found these matches:");
				// console.log(_.map(found, function(n) { return n ? n.matches : ''; }));
				
			});
		})
	}
};

module.exports = engine;