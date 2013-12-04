var express = require("express"),
    app = express(),
    routes = require('./routes'),
    chat = require('./app/chat'),
    MongoStore = require('connect-mongo')(express),
    passportSocketIo = require("passport.socketio"),
    passport = require('./app/passport-strategy').createFrom(express),
    mongoose = require('mongoose'),
    port = 3700;

function shutdownGracefully(e) {
    console.error(e);
    console.error(e.stack);

    chat.shutdown(function () {
        process.exit();
    });
}

process.on('uncaughtException', shutdownGracefully);
process.on('SIGINT', shutdownGracefully);

var sessionStore = new MongoStore({
    db: 'chat',
    username: 'simpleChat',
    password: 's3wCy2tTy6vDesPFheVVYSqd'
});

mongoose.connect('mongodb://localhost/chat', {
    user: 'simpleChat',
    pass: 's3wCy2tTy6vDesPFheVVYSqd'
});

var sessionOpts = {
    secret:      'PY2WzwBtPTjMWSpRbglS',
    store:       sessionStore,
    key:         'connect.sid'
};

app.use(express.cookieParser());
app.use(express.session(sessionOpts));
app.set('views', __dirname + '/tmpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'));
app.use(passport.initialize());
app.use(passport.session(sessionOpts));

app.get('/', routes.index);
app.get('/chat', routes.chat);
app.get('/logout', routes.logout);
app.get('/auth/google', passport.authenticate('google'));
app.get('/auth/google/return', passport.authenticate('google', {
    successRedirect: '/chat', failureRedirect: '/'
}));

var io = require('socket.io').listen(app.listen(port));
io.set('authorization', passportSocketIo.authorize({
    cookieParser: express.cookieParser,
    passport:    passport,
    secret:      'PY2WzwBtPTjMWSpRbglS',
    store:       sessionStore,
    key:         'connect.sid',
    success:     function (data, accept) { accept(null, true); },
    fail:        function (data, message, error, accept) { accept(null, false); }
}));

chat.init(io);

console.log("Listening on port " + port);