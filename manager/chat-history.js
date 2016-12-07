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
          if (!err && result) {
            data = result;
            return callback();
          } else {
            return callback(err);
          }
        });
      },
      function(callback) {
        var counter = 0;
        if (data.length > 0) {
          data.forEach(function(obj) {
            obj.formatChatMessage(function(err, msg) {
              if (!err && msg) {
                recentMessages.push(msg);
                counter++;
                if (data.length == counter) {
                  return callback();
                }
              } else {
                return callback(err);
              }
            });
          });
        } else {
          return callback(new Error('No data loaded from the database'));
        }
      }
    ], function(err, results) {
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
