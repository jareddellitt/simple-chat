var User = require('../app/users.js').User;

exports.index = function (req, res) {
    res.render('index');
};

exports.chat = function (req, res) {
    if (req.isAuthenticated()) {
        res.render('chat');
    } else {
        res.redirect('/');
    }
};

exports.logout = function (req, res) {
    req.logout();
    res.redirect('/');
}