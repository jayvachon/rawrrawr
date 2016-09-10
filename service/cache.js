'use strict';

var request = require('request');
var cheerio = require('cheerio');

var cache = {

	// TODO: check date created and update song if X amount of time has elapsed

	reset: function(app, cb) {
		app.db.models.Song.remove({}, function(err) {
			if (err) {
				console.log(err);
				return;
			}
			console.log('cache reset');
			cb();
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

	printSongs: function(app, cd) {
		this.getAllSongs(app, function(songs) {
			for (var i = 0; i < songs.length; i++) {
				console.log(songs[i].title + ' by ' + songs[i].artistName);
			}
		});
	},

	getSong: function(app, songId, cb) {

		var log = function(msg) {
			// console.log(msg);
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
			request('http://api.genius.com/songs/' + songId + '?access_token=' + app.config.genius.token, function(err, response, body) {
				
				if (err) {
					log('request error:' + err);
					return cb(null);
				}
				
				var response = JSON.parse(body).response;
				if (!response) {
					log("no song with id " + songId);
					return cb(null);
				}

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
					// var lyrics = $('.lyrics').text().replace(/\[[^\]]*\]/g, '').replace('\n', '');
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
			});
		});
	},

	fetchSongs: function(app, startIndex, endIndex) {
		if (!startIndex) startIndex = 0;
		if (!endIndex) endIndex = 1000;
		// this.getSong(app, 520, function() {});
		var counter = 0;
		var totalCount = endIndex-startIndex;

		for (var i = startIndex; i < endIndex; i++) {
			this.getSong(app, i, function(song) {
				counter ++;
				var title = '';
				if (song)
					title = song.title + ' by ' + song.artistName;
				console.log((counter/totalCount*100) + "% " + title);
			});
		}
	}
};

module.exports = cache;