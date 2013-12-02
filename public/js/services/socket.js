(function (app) {

    app.factory('socket', function () {
        return io.connect('http://localhost:3700');
    });

}(app));