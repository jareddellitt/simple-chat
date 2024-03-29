var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
	moment = require('moment');

var messageSchema = new Schema({
	userId: ObjectId,
	userName: String,
	userImage: String,
	date: { type: Date, default: Date.now },
	message: String,
	type: String
});

var daySchema = new Schema({
	day: String,
	messages: [messageSchema]
});

var Day = mongoose.model('Days', daySchema);

exports.add = function (user, message, type, callback) {
	var today = moment().format('MM-DD-YYYY'),
		msg = {
			userId: user._id,
			userName: user.firstName + ' ' + user.lastName,
			userImage: user.gravatar,
			message: message,
			type: type
		};

	Day.findOne({ day: today }, function (err, day) {
		if (!day) {
			var newDay = new Day({
				day: today,
				messages: [msg]
			});

			newDay.save();
		} else {
			day.messages.push(msg);
			day.save();
		}

		callback(msg);
	});
};

exports.getForDay = function (day, callback) {
	Day.findOne({ day: day }, function (err, day) {
		callback(day ? day.messages : []);
	});
};