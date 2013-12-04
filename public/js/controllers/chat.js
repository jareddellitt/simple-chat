(function (app) {
    var self,
        VERY_FAR_DOWN = 99999999;

    function controller($scope, $element, socket) {
        var messages = $element.find('.messages')[0];

        $scope.messages = [];

        socket.on('new-message', function (data) {
            data.author = data.from.id === self._id ? 'Me' : data.from.name;
            $scope.messages.push(data);

            $scope.$apply();

            messages.scrollTop = VERY_FAR_DOWN;
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
            controller: ['$scope', '$element', 'socket', controller]
        };
    });

}(app));