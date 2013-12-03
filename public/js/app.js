(function (global) {
    'use strict';

    global.app = angular
        .module('simple-chat', ['ngRoute'])
        .config(function ($routeProvider, $locationProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: '/js-templates/chat.html'
                });
        });

}(this));