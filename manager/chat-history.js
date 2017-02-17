var Chat = require('./../models/chat').Chat;
var async = require('async');
var config = require('../config').chat;

var recentMessages = [];

module.exports = {
  init: function() {
    var data = [];
    async.series([
      function(callback) {
        Chat.getRecentMessages(config.recentMessageCap, function(err, result) {
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
        console.log('Chat - loaded ' + recentMessages.length + ' chat messages from the database.');
      } else {
        console.log('Unable to load messages from the databse: ' + err.message);
      }
    });
  },
  appendHistory: function(chatObj) {
    recentMessages.unshift(chatObj);
    if (recentMessages.length > config.recentMessageCap) {
      recentMessages.length = config.recentMessageCap;
    }
  },
  clearChat: function() {
    recentMessages = [];
  },
  getHistory: function() {
    return recentMessages.slice().reverse();
  }
}
