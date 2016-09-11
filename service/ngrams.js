'use strict';

var cp = require('child_process');

// sends data to the python script for processing

var ngrams =  {

	getLyrics: function(lyrics, cb) {

		var spawn = cp.spawn,
			py = spawn('python', ['ngrams.py', '--lyrics']),
			dataString = '';

		py.stdout.on('data', function(lyrics) {
			dataString += lyrics.toString();
		});
		py.stdout.on('end', function() {
			console.log('END');
			cb(dataString);
		});
		py.stdin.write(JSON.stringify(lyrics));
		py.stdin.end();
	}

	/*getSongs: function(songs, cb) {

	}*/
}

module.exports = ngrams;