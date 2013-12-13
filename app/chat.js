var _ = require('lodash'),
    moment = require('moment'),
    sockets = {},
    User = require('./users').User,
    messages = require('./messages'),
    events = {
        USERS: 'users-list',
        CONNECTION: 'connection',
        FETCH_USERS: 'fetch-users',
        DISCONNECT: 'disconnect',
        LOGGED_IN: 'logged-in',
        CHAT: 'chat',
        NEW_MESSAGE: 'new-message',
        USER: 'user',
        FETCH_DAY: 'fetch-day'
    };

function broadcast(event, data) {
    _.each(sockets, function (s) { s.emit(event, data); });
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
        messages.add(user, data.message, function (msg) {
            broadcast(events.NEW_MESSAGE, msg);
        });
    });
}

function fetchDay(data, socket) {
    var day = moment(data.date).format('MM-DD-YYYY');

    messages.getForDay(day, function (messages) {
        socket.emit('previous-messages', messages);
    });
}

function bindEventsTo(socket) {
    var userId = socket.handshake.user;

    socket.on(events.FETCH_USERS, broadcastParticipants);

    socket.on(events.DISCONNECT, function () {
        handleDisconnected(userId);
    });

    socket.on(events.CHAT, function (data) {
        handleMessageSent(data, userId);
    });

    socket.on(events.FETCH_DAY, function (data) {
        fetchDay(data.date, socket);
    });

    socket.emit('start');
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

exports.shutdown = function (done) {
    User.find({ loggedIn: true }, function (err, users) {
        var saved = 0,
            checkedSaved = function () {
                saved += 1;
                if (saved == users.length) done();
            };

        users.forEach(function (u) {
            u.loggedIn = false;
            u.save(checkedSaved);
        });
    });

    //Just in case something blows up and the program can't exit
    setTimeout(function () {
        done();
    }, 1000);
};