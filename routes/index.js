var User = require('../app/users.js').User,
    multiparty = require('multiparty'),
    fs = require('fs'),
    filesRepo = require('../app/files.js'),
    chat = require('../app/chat.js');

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

exports.upload = function (req, res) {
    var form = new multiparty.Form();

    form.parse(req, function (err, fields, files) {
        var file = files.file[0];

        fs.readFile(file.path, function (err, data) {
            var f = {
                name: file.originalFilename,
                size: file.size,
                type: file.headers['content-type'],
                data: data
            };

            filesRepo.add(f, function (id) {
                chat.broadcastFile(f, req.user);

                res.send({ status: 'ok' });
            });
        });
    });
};

exports.logout = function (req, res) {
    req.logout();
    res.redirect('/');
};