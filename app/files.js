var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FileSchema = new Schema({
    date: Date,
    size: Number,
    type: String,
    name: String,
    data: Buffer
});

var File = mongoose.model('Files', FileSchema);

exports.add = function (file, done) {
    var file = new File({
        date: new Date(),
        size: file.size,
        type: file.type,
        name: file.name,
        data: file.data
    });

    file.save(function () {
        done(file._id);
    });
};