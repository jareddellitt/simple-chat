var express = require("express"),
    app = express(),
    routes = require('./routes'),
    sockets = require('./app/sockets.js'),
    User = require('./app/users.js').User,
    MongoStore = require('connect-mongo')(express),
    passport = require('passport'),
    passportSocketIo = require("passport.socketio"),
    GoogleStrategy = require('passport-google').Strategy,    
    crypto = require('crypto'),   
    port = 3700;

passport.use(new GoogleStrategy({
        returnURL: 'http://10.0.0.17:3700/auth/google/return',
        realm: 'http://10.0.0.17:3700/'
    },
    function (identifier, profile, done) {
        User.findOne({ id: identifier }, function (err, user) {
            if (!user) {
                var u = new User({
                    id: identifier,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    email: profile.emails[0].value,
                    loggedIn: true,
                    gravatar: 'http://www.gravatar.com/avatar/' + crypto.createHash('md5').update(profile.emails[0].value.toLowerCase().trim()).digest('hex') + '?s=100&d=mm&r=g'
                });

                u.save(function (err) {
                    if (!err) {
                        done(null, { id: identifier });
                    }
                });

            } else {
                done(null, { id: identifier });
            }
        });
    }
));
 
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(obj, done) {  
    done(null, obj);
});

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

sockets.init(io);

console.log("Listening on port " + port);