'use strict';

function useAngular (req, res, next) {
	res.sendFile(require('path').join(__dirname, './public/index.html'));
};

exports = module.exports = function (app, passport) {

	// get/post routes here
	app.get('/', function(req, res) {
		console.log("OK");
		res.send("hey");
	});

	// app.all(/^(?!\/api).*$/, useAngular);
};