var self;

function BotManager(io) {
  self = this;
  this.io = io;
  this.bots = [];
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

module.exports = BotManager;
