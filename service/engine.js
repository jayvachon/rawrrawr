'use strict';

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
	}
};

module.exports = engine;