(function (global) {
    'use strict';

    angular.module('LocalStorageModule').value('prefix', 'dwolla-chat');

    global.app = angular
        .module('dwolla-chat', ['ngRoute', 'LocalStorageModule'])
        .config(function ($routeProvider, $locationProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: '/js-templates/login.html',
                    controller: 'loginController'
                })
                .when('/chat', {
                    templateUrl: '/js-templates/chat.html'
                });
        });

}(this));