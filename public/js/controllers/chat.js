(function (app) {
    var myName,
        striped = false;

    function createMessageFrom(time, author, content) {
        var author = author === myName ? 'Me' : author,
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
            controller: ['$scope', '$element', '$location', 'socket', 'localStorageService', function ($scope, $element, $location, socket, localStorageService) {
                var $messages = $element.find('.messages');
                myName = localStorageService.get('username');

                if (!myName) $location.path('/');

                socket.on('new-message', function (data) {                  
                    $messages.append(createMessageFrom(data.prettyTime, data.from, data.message));
                    $messages[0].scrollTop = 99999999;
                });

                $scope.submit = function () {
                    socket.emit('chat', { message: $scope.message });

                    $scope.message = "";                    
                };
            }]
        };
    });

}(app));