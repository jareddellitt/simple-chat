var express = require("express"),
    app = express(),
    routes = require('./routes'),
    chat = require('./app/chat'),    
    MongoStore = require('connect-mongo')(express),
    passportSocketIo = require("passport.socketio"),
    passport = require('./app/passport-strategy').createFrom(express),    
    port = 3700;

var sessionStore = new MongoStore({
    db: 'chat'
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