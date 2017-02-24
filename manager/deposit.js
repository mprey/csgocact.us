var cache = require('../lib/cache');
var SteamCommunity = require('steamcommunity');
var botManager = require('./bot');
var Price = require('./../models/price').Price;
var Deposit = require('../models/deposit').Deposit;
var async = require('async');
var config = require('../config');

var self;

var itemGrade = {
  MISC: 'misc',
  WEAPON: 'weapon',
  RARE: 'rare',
  KNIFE: 'knife',
  KEY: 'key'
};

function DepositManager() {
  self = this;
  this.community = new SteamCommunity();
}

DepositManager.prototype.submitDeposit = function(user, items, callback) {
  if (user.trade_url == null) {
    return callback('Please set your trade URL in Steam Settings in the upper right-hand corner of the window.');
  }

  Deposit.hasOpenDeposit(user._id, (bool) => {
    if (bool == true) {
      return callback('You already have an open deposit. If you believe this is an error, please contact support.');
    }

    var amount = 0.00;
    for (var index in items) {
      amount += items[index].price;
    }

    var deposit = new Deposit({
      userId: user._id,
      items: items,
      amount: amount,
      trade_url: user.trade_url
    });

    botManager.sendSubmitRequest(user, items, deposit._id, (err, data) => {
      if (err) {
        return callback(err instanceof Error ? err.message : err, data);
      }
      deposit.save();
      return callback(err, data);
    });
  });
}

DepositManager.prototype.requestUserInventory = function(userId, callback) {
  cache.get(userId, (err, data) => {
    if (data !== null) {
      return callback(err, data);
    }

    self.queryInventory(userId, (error, data) => {
      if (data) {
        cache.set(userId, data);
        cache.expire(userId, config.deposit.cacheTimeout);
      }
      return callback(error, data);
    });
  });
}

DepositManager.prototype.queryInventory = function(userId, callback) {
  self.community.getUserInventoryContents(userId, 730, 2, true, (err, inv) => {
    if (err) {
      return callback(err);
    }

    async.each(inv, (val, callback) => {
      Price.findOne({ name: val.market_hash_name }, (err, item) => {
        if (err) {
          return callback(err);
        }
        val.price = item ? item.price : 0.00;
        val.grade = getItemGrade(val.market_hash_name, val.type);

        if (!isNaN(val.price) && config.exchangeRates.deposit[val.grade]) {
          val.price = Number(val.price * config.exchangeRates.deposit[val.grade]).toFixed(2);
        }
        return callback();
      });
    }, (error) => {
      if (error) {
        return callback(error);
      }

      var data = JSON.stringify(inv);
      return callback(null, data);
    });
  });
}

DepositManager.prototype.forceInventoryReload = function(userId, callback) {
  cache.get(userId + '' + config.deposit.cooldownEndpoint, (err, data) => {
    if (data !== null) {
      cache.ttl(userId + '' + config.deposit.cooldownEndpoint, (err, ttl) => {
        return callback(new Error('You must wait ' + formatSeconds(ttl) + ' before force refreshing again.'));
      });
    } else {
      self.queryInventory(userId, (error, data) => {
        return callback(error, data);
      });

      cache.set(userId + '' + config.deposit.cooldownEndpoint, 'yoooo');
      cache.expire(userId + '' + config.deposit.cooldownEndpoint, config.deposit.refreshCooldown);
    }
  });
}

self = new DepositManager();

function getItemGrade(name, type) {
  if (~name.indexOf('Key')) {
    return itemGrade.KEY;
  } else if (~name.indexOf('★')) {
    return itemGrade.KNIFE;
  } else if (~type.indexOf('Classified') || ~type.indexOf('Covert')) {
    return itemGrade.RARE;
  } else if (~type.indexOf('Restricted')) {
    return itemGrade.WEAPON;
  }
  return itemGrade.MISC;
}

function formatSeconds(time) {
  var minutes = Math.floor(time / 60);
  var seconds = time - minutes * 60;
  return (minutes > 1 ? minutes + ' minutes ' : (minutes == 1 ? '1 minute ' : '')) + '' + (seconds > 1 ? seconds + ' seconds' : (seconds == 1 ? '1 second' : ''));
}

module.exports = self;
