(function (app) {
    'use strict';
    
    app.controller('loginController', ['$scope', '$location', 'localStorageService', 'socket', function ($scope, $location, localStorageService, socket) {
        var storedName = localStorageService.get('username');
        
        function redirect(name) {
            socket.emit('logged-in', { name: name });

            $location.path('/chat');
        }

        if (storedName) redirect(storedName);

        $scope.submit = function () {
            var name = $scope.name.trim();

            localStorageService.add('username', name);          

            redirect(name);
        };
    }]);

}(app));