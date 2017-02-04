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

BotManager.prototype.addBot = (socket) => {
  if (!~self.indexOf(socket)) {
    self.bots.push(socket);
  }
}

BotManager.prototype.removeBot = (socket) => {
  var index = self.indexOf(socket);
  if (~index) {
    self.bots.splice(index, 1);
  }
}

BotManager.prototype.indexOf = function(socket) {
  for (var index in self.bots) {
    var bot = self.bots[index];
    if (socket.id == bot.id) {
      return index;
    }
  }
  return -1;
}

BotManager.prototype.getNextBot = function() {
  console.log('bot length: ', this.bots.length);
  if (this.bots.length == 0) {
    return null;
  }

  if (this.currentIndex >= this.bots.length) {
    this.currentIndex = 0;
  }

  var bot = this.bots[this.currentIndex];
  this.currentIndex++;

  if (bot) {
    return bot;
  } else {
    return self.getNextBot();
  }
}

BotManager.prototype.sendSubmitRequest = function(user, items, depositId, callback) {
  var bot = self.getNextBot();

  if (typeof bot == 'undefined' || !bot) {
    return callback('Unable to find any available bots to trade');
  }

  bot.emit(socket_outgoing.SEND_SUBMIT_REQUEST, {
    user: user,
    items: items,
    depositId: depositId
  }, function(err, data) { //data.trade_url, data.ttl
    return callback(err, data);
  });
}

new BotManager();

module.exports = self;
