var Chat = require('./../models/chat').Chat;
var async = require('async');

var recentMessages = [];

var RECENT_MESSAGE_CAP = 50;

module.exports = {
  init: function() {
    var data = [];
    async.series([
      function(callback) {
        Chat.getRecentMessages(RECENT_MESSAGE_CAP, function(err, result) {
          async.each(result, function(val, callback) {
            data.push(val);
            callback();
          }, callback);
        });
      },
      function(callback) {
        async.each(data, function(val, callback) {
          val.formatChatMessage(function(err, msg) {
            if (!err && msg) {
              recentMessages.push(msg);
            }
            return callback(err);
          });
        }, callback);
      }
    ], function(err) {
      if (!err) {
        console.log('Loaded ' + recentMessages.length + ' chat messages from the database.');
      } else {
        console.log('Unable to load messages from the databse: ' + err.message);
      }
    });
  },
  appendHistory: function(chatObj) {
    recentMessages.unshift(chatObj);
    if (recentMessages.length > RECENT_MESSAGE_CAP) {
      recentMessages.length = RECENT_MESSAGE_CAP;
    }
  },
  clearChat: function() {
    recentMessages = [];
  },
  getHistory: function() {
    return recentMessages.slice().reverse();
  }
}
