'use strict';

var cp = require('child_process');

// sends data to the python script for processing

var ngrams =  {

	get: function(lyrics, cb) {

		var spawn = cp.spawn,
			py = spawn('python', ['ngrams.py']),
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
}

module.exports = ngrams;