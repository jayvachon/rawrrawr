'use strict';

exports = module.exports = function (app, mongoose) {

	var songSchema = new mongoose.Schema({
		title: String,
		songId: Number,
		artistName: String,
		artistId: Number,
		lyrics: String,
		songLyrics: String,
		releaseDate: Date,
		albumId: Number,
		dateCreated: { type: Date, default: Date.now }
	});
	app.db.model('Song', songSchema);
};