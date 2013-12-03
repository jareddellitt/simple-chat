(function (app) {

    app.factory('socket', function () {
        return io.connect();
    });

}(app));