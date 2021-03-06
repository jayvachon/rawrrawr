'use strict';

var config = require('./config'),
	express = require('express'),
	http = require('http'),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	path = require('path'),
	morgan = require('morgan'),
	cors = require('cors'),
	fs = require('fs'),
	request = require('request'),
	cheerio = require('cheerio'),
	engine = require('./service/engine'),
	cache = require('./service/cache'),
	argv = require('minimist')(process.argv.slice(2));

/*var spawn = require('child_process').spawn,
	py = spawn('python', ['ngrams.py']),
	data = [1, 2, 4],
	dataString = '';

py.stdout.on('data', function(data) {
	dataString += data.toString();
});
py.stdout.on('end', function() {
	console.log(dataString);
});
py.stdin.write(JSON.stringify(data));
py.stdin.end();*/

// create express app
var app = module.exports = express();

// keep reference to config
app.config = config;

// setup web server
app.server = http.createServer(app);

// configure cors
var whitelist = ['https://api.genius.com'];
var corsOptions = {
  origin: function(origin, callback){
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(originIsWhitelisted ? null : 'Bad Request', originIsWhitelisted);
  }
};

// setup mongoose
app.db = mongoose.createConnection(config.mongodb.uri);
app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
app.db.once('once', function () {
	console.log('mongoose ready');
});

// configure data models
require('./models')(app, mongoose);

// settings
app.disable('x-powered-by');
app.set('port', config.port);

// middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(morgan('dev'));
app.use(cors());
app.use(require('./service/http').http500);

// setup routes
app.get('/auth', function (req, res) {
	
});

function reset() {
	cache.reset(app, function() {
		/*cache.getSong(app, 702629, function(song) {
			console.log(song);
		});
		cache.getSong(app, 526, function(song) {
			console.log(song);
		});*/
	});
}

// start the app
app.server.listen(app.config.port, function() {
	console.log('App listening on port ' + config.port);
	fs.writeFile(__dirname + '/start.log', 'started');

	cache.testConnection(app);

	// fetch songs
	if (argv.f) {
		var from = argv.f,
			to = argv._[0];
		console.log("fetch songs from " + from + " to " + to);
		cache.fetchSongs(app, from, to);
	}

	// reset cache
	/*if (argv.r) {
		cache.reset(app);
	}*/

	if (argv.p) {
		cache.printSongs(app);
	}

	if (argv.s) {
		engine.findReferencesFromSong(app, cache, argv.r);

		// TODO: check if value is string, and if so process it as a reference
		// engine.findReferences(app, cache, "how could you be so heartless");
		// engine.findReferences(app, cache, "face it");
	}

	if (argv.l) {
		engine.processLyrics(app, cache, 1);
	}

	if (argv.k) {
		engine.processSongs(app, cache, 1)
	}

	if (argv.r) {
		engine.processSongs(app, cache, 'Scenario');
	}
});
