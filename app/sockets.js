var client = require("redis").createClient(6379, 'localhost'),
    _ = require('lodash'),
    moment = require('moment'),
    io,
    sockets = {},
    names = {},
    events = {
        USERS: 'users-list',
        CONNECTION: 'connection',
        FETCH_USERS: 'fetch-users',
        DISCONNECT: 'disconnect',
        LOGGED_IN: 'logged-in',
        CHAT: 'chat',
        NEW_MESSAGE: 'new-message'
    };

function getNames() {
    return _.values(names).sort();
}

function broadcast(event, data) {
    _.each(sockets, function (s) {
        s.emit(event, data);
    });
}

function broadcastToOthers(event, data, sender) {
    var otherSessions = _.filter(_.keys(names), function (sessionId) {
        return sender !== sessionId;
    });

    _.each(otherSessions, function (sessionId) {
        sockets[sessionId].emit(event, data);
    });
}

function handleLoggedIn(sessionId, socket, data) {
    if (!_.contains(_.values(names), data.name)) {
        names[sessionId] = data.name;

        client.hset('chat-users', sessionId, data.name);

        broadcast(events.USERS, getNames());
    }
}

function handleDisconnected(sessionId) {
    delete sockets[sessionId];
    delete names[sessionId];

    broadcast(events.USERS, getNames());    
}

function handleConnected(socket) {
    var sessionId = socket.handshake.sessionID;

    client.hget('chat-users', sessionId, function (err, reply) {
        if (reply) {
            names[sessionId] = reply;
            broadcast(events.USERS, getNames());
        }
    });

    sockets[sessionId] = socket;

    socket.on(events.LOGGED_IN, function (data)  {
        handleLoggedIn(sessionId, socket, data);
    })

    socket.on(events.FETCH_USERS, function () {
        socket.emit(events.USERS, getNames());
    });

    socket.on(events.DISCONNECT, function () {      
        handleDisconnected(sessionId);
    });

    socket.on(events.CHAT, function (data) {
        console.log('broadcasting the new message');

        broadcast(events.NEW_MESSAGE, {
            timestamp: new Date(),
            prettyTime: moment().format('h:mm:ss a'),
            message: data.message,
            from: names[sessionId]
        });
    });
}

exports.init = function (server) {
    io = server;

    io.sockets.on(events.CONNECTION, handleConnected);
};