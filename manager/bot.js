var socket_outgoing = {
  SEND_SUBMIT_REQUEST: 'BOT_OUT_SEND_SUBMIT_REQUEST'
};

var socket_incoming = {

};

var self;

function BotManager() {
  self = this;
  this.io = null;
  this.bots = [];
  this.currentIndex = 0;
}

BotManager.prototype.setIo = function(io) {
  self.io = io;
}

BotManager.prototype.addBot = (socketId) => {
  if (!self.isBotConnected(socketId)) {
    self.bots.push(socketId);
  }
}

BotManager.prototype.removeBot = (socketId) => {
  if (self.isBotConnected(socketId)) {
    self.bots.slice(self.bots.indexOf(socketId), 1);
  }
}

BotManager.prototype.isBotConnected = function(socketId) {
  for (var index in self.bots) {
    var bot = self.bots[index];
    if (socketId == bot) {
      return true;
    }
  }
  return false;
}

BotManager.prototype.getNextBot = function() {
  if (this.bots.length == 0) {
    return null;
  }

  if (this.currentIndex >= this.bots.length) {
    this.currentIndex = 0;
  }

  var bot = this.bots[this.currentIndex];
  this.currentIndex++;

  if (bot.connected) {
    return bot;
  } else {
    return getNextBot();
  }
}

BotManager.prototype.sendSubmitRequest = function(user, items, callback) {
  var bot = self.getNextBot();

  if (!bot) {
    return callback('Unable to find any available bots to trade.');
  }

  bot.emit(socket_outgoing.SEND_SUBMIT_REQUEST, {
    user: user,
    items: items
  }, function(err, data) { //data.trade_url, data.ttl
    return callback(err, data);
  });
}

new BotManager();

module.exports = self;
