'use strict';

var config = require('./config'),
	express = require('express'),
	http = require('http'),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	path = require('path'),
	// passport = require('passport'),
	// OAuth2Strategy = require('passport-oauth2'),
	morgan = require('morgan'),
	cors = require('cors'),
	fs = require('fs'),
	request = require('request'),
	cheerio = require('cheerio'),
	engine = require('./service/engine'),
	cache = require('./service/cache');

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

/*passport.use(new OAuth2Strategy({
    authorizationURL: 'https://api.genius.com/oauth/authorize',
    tokenURL: 'https://api.genius.com/oauth2/token',
    clientID: config.genius.id,
    clientSecret: config.genius.secret,
    callbackURL: 'http://localhost:8000/auth/callback'
  },
  function(accessToken, refreshToken, profile, cb) {
  	console.log("heard");
    User.findOrCreate({ exampleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));*/

// middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride('X-HTTP-Method-Override'));
// app.use(passport.initialize());
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

	// reset();
	// cache.getSong(app, 1000, function(song) { console.log(song);});
	// cache.reset(app);
	// cache.testit(app);
	// engine.findReferences(app, cache, "how could you be so heartless");
	// engine.findReferences(app, cache, "face it");
	cache.fetchSongs(app, 0, 10);
	// cache.printSongs(app);
});