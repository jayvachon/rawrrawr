'use strict';

(function() {

	var app = angular.module('app', [
		'ngRoute'
	]);

	app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

		$locationProvider.html5Mode({ enabled: true, requireBase: true });
		$routeProvider
			.when('/', {
				templateUrl: 'views/main.html'
			})
			.when('/login', {
				templateUrl: 'views/login.html'
			})
			.otherwise({
				templateUrl: 'views/404.html'
			});
	}]);

	app.controller('MainController', ['$scope', '$http', function($scope, $http) {
		$http.get('http://localhost:8000/auth')
			.success(function(data) {
				console.log(data);
			})
			.error(function(err) {
				console.log('error: ' + err);
			});
	}]);
})();