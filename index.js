var express = require("express"),
    app = express(),
    routes = require('./routes'),
    sockets = require('./app/sockets.js'),
    RedisStore = require('connect-redis')(express),
    port = 3700;
 
app.use(express.cookieParser());
app.use(express.session({
    store: new RedisStore({
        host: 'localhost',
        port: 6379,
        db: 2
    }),
    secret: 'PY2WzwBtPTjMWSpRbglS'
}));

app.set('views', __dirname + '/tmpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'));

app.get("/", routes.index);

var io = require('socket.io').listen(app.listen(port));
var cookie = require('cookie');

io.set('authorization', function (data, accept) {
    if (data.headers.cookie) {      
        data.cookie = cookie.parse(data.headers.cookie);
        data.sessionID = data.cookie['connect.sid'];
    } else {
       return accept('No cookie transmitted.', false);
    }
    
    accept(null, true);
});

console.log("Listening on port " + port);

sockets.init(io);