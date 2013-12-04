var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
    id: String,
    firstName: String,
    lastName: String,
    email: String,
    sessionId: String,
    loggedIn: Boolean,
    gravatar: String
});

var User = mongoose.model('User', userSchema);

exports.User = User;