(function (app) {
    var self,
        VERY_FAR_DOWN = 99999999;

    function controller($scope, $element, socket) {
        var messages = $element.find('.messages')[0];

        $scope.messages = [];


        function addMessage(m) {
            m.author = m.userId === self._id ? 'Me' : m.userName;
            m.prettyTime = moment(m.timestamp).format('h:mm:ss a'),

            $scope.messages.push(m);

            $scope.$apply();

            messages.scrollTop = VERY_FAR_DOWN;
        }

        socket.on('new-message', addMessage);

        socket.on('user', function (userData) {
            self = userData;
        });

        socket.on('previous-messages', function (messages) {
            messages.forEach(addMessage);
        });

        socket.on('start', function () {
            socket.emit('fetch-day', {
                date: new Date()
            });
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