var mongoose = require('mongoose');
var async = require('async');
var Schema = mongoose.Schema;

var chatSchema = new Schema({
  sender_id: {type: Number, required: true},
  content: {type: String, required: true},
  date: {type: Date, default: Date.now, required: true}
});

var User = require('./user').User;

chatSchema.methods.formatChatMessage = function(done) {
  var instance = this;
  User.findById(this.sender_id, function(err, user) {
    if (!err && user) {
      var data = {
        id: user._id,
        profile_img: user.photo,
        profile_name: user.name,
        rank: user.rank,
        date: instance.date,
        text: instance.content
      };
      done(err, data);
    } else {
      done(err);
    }
  });
};

chatSchema.statics.getRecentMessages = function(limit, done) {
  return this.find({}).sort('-date').limit(limit).exec(done)
};

var Chat = mongoose.model('Chat', chatSchema);

module.exports = {
  Chat: Chat
}
