var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
	moment = require('moment');

var messageSchema = new Schema({
	userId: ObjectId,
	date: { type: Date, default: Date.now },
	message: String
});

var daySchema = new Schema({
	day: String,
	messages: [messageSchema]
});

var Day = mongoose.model('Days', daySchema);

exports.add = function (userId, message) {
	var today = moment().format('MM-DD-YYYY'),
		msg = {
			userId: userId,
			message: message
		};

	Day.findOne({ day: day }, function (err, day) {
		if (!day) {
			var newDay = new Day({
				day: today,
				messages: [msg]
			});

			newDay.save();
		} else {
			day.messages.push(msg);
		}
	});
};