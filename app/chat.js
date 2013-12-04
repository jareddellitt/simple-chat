var _ = require('lodash'),
    moment = require('moment'),
    sockets = {},
    User = require('./users').User,
    events = {
        USERS: 'users-list',
        CONNECTION: 'connection',
        FETCH_USERS: 'fetch-users',
        DISCONNECT: 'disconnect',
        LOGGED_IN: 'logged-in',
        CHAT: 'chat',
        NEW_MESSAGE: 'new-message',
        USER: 'user'
    };

function broadcast(event, data) {
    _.each(sockets, function (s) {
        s.emit(event, data);
    });
}

function broadcastParticipants() {
    User.find({ loggedIn: true }, function (err, users) {
        var names = users.map(function (u) {
            return { 
                name: u.firstName + ' ' + u.lastName,
                image: u.gravatar
            };
        });
        
        broadcast(events.USERS, names);
    });
}

function handleDisconnected(userId) {
    delete sockets[userId];

    User.findOne({ id: userId }, function (err, user) {
        user.loggedIn = false;
        user.save(function () {
            broadcastParticipants();
        });
    });    
}

function handleMessageSent(data, userId) {
    User.findOne({ id: userId }, function (err, user) {
        broadcast(events.NEW_MESSAGE, {
            timestamp: new Date(),
            prettyTime: moment().format('h:mm:ss a'),
            message: data.message,
            from: {
                id: user._id,
                name: user.firstName + ' ' + user.lastName
            }
        });
    });
}

function bindEventsTo(socket) {
    var userId = socket.handshake.user;
    
    socket.on(events.LOGGED_IN, function (data)  {
        handleLoggedIn(userId, socket, data);
    })

    socket.on(events.FETCH_USERS, function () {
        broadcastParticipants();
    });

    socket.on(events.DISCONNECT, function () {      
        handleDisconnected(userId);
    });

    socket.on(events.CHAT, function (data) {
        handleMessageSent(data, userId);
    });    
}

function handleConnected(socket) {
    var userId = socket.handshake.user;    
    sockets[userId] = socket;

    User.findOne({ id: userId }, function (err, user) {
        if (user) {
            user.loggedIn = true;
            user.save(function () {
                socket.emit(events.USER, user);
                
                broadcastParticipants();     
                bindEventsTo(socket);          
            });            
        }        
    });
}

exports.init = function (io) {
    io.sockets.on(events.CONNECTION, handleConnected);
};