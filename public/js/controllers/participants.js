(function (app) {

    app.directive('participants', function () {
        return {
            restrict: 'AE',
            templateUrl: '/js-templates/participants.html',
            scope: true,
            controller: ['$scope', 'socket', function ($scope, socket) {
                socket.emit('fetch-users');

                socket.on('users-list', function (d) {
                    $scope.$apply(function () {
                        $scope.users = d;
                    });
                });
            }]
        };
    });

}(app));