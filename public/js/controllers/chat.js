(function (app) {
    var striped = false,
        self;

    function createMessageFrom(time, author, content) {
        var author = author.id === self._id ? 'Me' : author.name,
            stripe = striped ? ' striped' : '';

        striped = !striped;

        return '<li class="message' + stripe + '">' +
                '<span class="time">' + time + '</span>' +
                '<span class="author">' + author + ':</span>' +
                '<span class="content">' + content + '</span>' +
                '</li>';
    }

    app.directive('chatter', function () {
        return {
            restrict: 'AE',
            templateUrl: '/js-templates/chatter.html',
            scope: true,
            controller: ['$scope', '$element', '$location', 'socket', function ($scope, $element, $location, socket) {
                var $messages = $element.find('.messages');                

                socket.on('new-message', function (data) {                  
                    $messages.append(createMessageFrom(data.prettyTime, data.from, data.message));
                    $messages[0].scrollTop = 99999999;
                });

                socket.on('user', function (userData) {
                    self = userData;
                });

                $scope.submit = function () {
                    socket.emit('chat', { message: $scope.message });

                    $scope.message = "";                    
                };
            }]
        };
    });

}(app));