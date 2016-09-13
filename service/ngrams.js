'use strict';

var cp = require('child_process');

// sends data to the python script for processing

var ngrams =  {

	getLyrics: function(lyrics, cb) {
		this.sendData(lyrics, 'lyrics', function(data) {
			console.log(data);
		});
	},

	getSongs: function(songs, cb) {
		this.sendData(songs, 'songs', function(data) {
			cb(data);
		});
	},

	sendData: function(data, arg, cb) {

		var spawn = cp.spawn,
			py = spawn('python', ['ngrams.py', '--' + arg]),
			dataString = '';

		py.stdout.on('data', function(data) {
			dataString += data.toString();
		});
		py.stdout.on('end', function() {
			cb(dataString);
		});
		py.stdin.write(JSON.stringify(data));
		py.stdin.end();
	}
}

module.exports = ngrams;