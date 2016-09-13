'use strict';

var request = require('request');
var cheerio = require('cheerio');

var buildUrl = function(app, path, term) {
	return 'http://api.genius.com/' + path + '/' + term + '?access_token=' + app.config.genius.token;
};

var cache = {

	// TODO: check date created and update song if X amount of time has elapsed

	reset: function(app, cb) {
		app.db.models.Song.remove({}, function(err) {
			if (err) {
				console.log(err);
				return;
			}
			console.log('cache reset');
			if (cb) cb();
		})
	},

	getAllSongs: function(app, cb) {
		app.db.models.Song.find({}).exec(function(err, songs) {
			if (err) {
				console.log(err);
				return;
			}
			cb(songs);
		});
	},

	getSongs: function(app, songIds, cb) {
		app.db.models.Song.find({ songId: { $in: songIds } }).exec(function(err, songs) {
			if (err) {
				console.log(err);
				return;
			}
			cb(songs);
		});
	},

	printSongs: function(app, cd) {
		this.getAllSongs(app, function(songs) {
			for (var i = 0; i < songs.length; i++) {
				console.log(songs[i].title + ' by ' + songs[i].artistName);
			}
			console.log('found ' + songs.length + ' songs');
		});
	},

	searchSong: function(app, term, cb) {
		request(buildUrl(app, 'search', term), function(err, response, body) {
			response = JSON.parse(body).response;
			if (!response) {
				console.log('no song was found using the search term ' + term);
				return cb(null);
			}
			console.log(reponse);
			// getSong(app, )
		});
	},

	getSong: function(app, songId, cb) {

		var log = function(msg) {
			console.log(msg);
		}

		// search for the song
		app.db.models.Song.findOne({ 'songId': songId }).exec(function(err, song) {
			if (err) {
				log('error: ' + err);
				return cb(null);
			}
			
			// if the song has been cached, return it
			if (song) {
				log('found song in cache');
				return cb(song);
			}

			// otherwise, call the api and scrape the lyrics
			log("requesting song...");
			// request('http://api.genius.com/songs/' + songId + '?access_token=' + app.config.genius.token, function(err, response, body) {
			request(buildUrl(app, 'songs', songId), function(err, response, body) {
				
				if (err) {
					log('request error:' + err);
					return cb(null);
				}
				
				response = JSON.parse(body).response;
				if (!response) {
					log("no song with id " + songId);

					// create an empty model for the song with the given id
					app.db.models.Song.create({
						title: '',
						songId: songId
					}, function(err, song) {
						if (err) {
							log('mongo error: ' + err);
						}
						return cb(null);
					});
				} else {

					var song = response.song;
					if (!song) {
						log("no song with id " + songId);
						return cb(null);
					}

					// scrape lyrics
					log("scraping lyrics...");
					request(song.url, function(err, res, body) {

						if (err) {
							log('request error: ' + err);
							return cb(null);
						}

						var $ = cheerio.load(body);
						var lyrics = $('.lyrics').text();

						app.db.models.Song.create({
							title: song.title,
							songId: song.id,
							artistName: song.primary_artist.name,
							artistId: song.primary_artist.id,
							songLyrics: lyrics,
							releaseDate: song.releaseDate,
							albumId: song.album ? song.album.id : null
						}, function(err, song) {
							if (err) {
								log('mongo error: ' + err);
								return cb(null);
							}

							// return the new song
							log('added song with id ' + songId + ' to cache');
							cb(song);
						});
					});
				}
			});
		});
	},


	asyncLoop: function(o){
	    var i=-1;

	    var loop = function(){
	        i++;
	        if(i==o.length){o.callback(); return;}
	        o.functionToLoop(loop, i);
	    } 
	    loop();//init
	},

	fetchSongs: function(app, startIndex, endIndex) {

		if (!startIndex) startIndex = 0;
		if (!endIndex) endIndex = 1000;

		var counter = 0;
		var totalCount = endIndex-startIndex;

		var that = this;

		that.asyncLoop({
		    length : totalCount,
		    functionToLoop : function(loop, i){
		    	that.getSong(app, i+startIndex, function(song) {
		    		counter ++;
		    		var title = '';
		    		if (song)
		    			title = song.title + ' by ' + song.artistName;
		    		console.log((counter/totalCount*100) + "% " + title);
		    		loop();
		    	});
		    },
		    callback : function(){
		        console.log('finished :)');
		    }    
		});
	}
};

module.exports = cache;