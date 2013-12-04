(function (app) {
    var self;

    function controller($scope, $element, $location, socket) {
        var messages = $element.find('.messages')[0];

        $scope.messages = [];

        socket.on('new-message', function (data) {
            data.author = data.from.id === self._id ? 'Me' : data.from.name;
            $scope.messages.push(data);

            $scope.$apply(function () {
                setTimeout(function () {
                    messages.scrollTop = 99999999;
                }, 10);
            });
        });

        socket.on('user', function (userData) {
            self = userData;
        });

        $scope.submit = function () {
            if ($scope.message)
                socket.emit('chat', { message: $scope.message });

            $scope.message = "";
        };
    }

    app.directive('chatter', function () {
        return {
            restrict: 'AE',
            templateUrl: '/js-templates/chatter.html',
            scope: true,
            controller: ['$scope', '$element', '$location', 'socket', controller]
        };
    });

}(app));