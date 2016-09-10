'use strict';

exports = module.exports = function (app, mongoose) {
	require('./models/Song')(app, mongoose);
};