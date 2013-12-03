var User = require('../app/users.js').User;

exports.index = function (req, res) {
    res.render('index');
};

exports.chat = function (req, res) {
    res.render('chat')
};