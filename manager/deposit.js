var cache = require('../lib/cache');
var SteamCommunity = require('steamcommunity');
var botManager = require('./bot');
var Price = require('./../models/price').Price;
var async = require('async');

var self;

var CACHE_TIMEOUT = 20 * 60; //20 minutes

var REFRESH_COOLDOWN = 5 * 60; //5 minutes

var COOLDOWN_ENDPOINT = '-REFRESH_COOLDOWN';

function DepositManager() {
  self = this;
  this.community = new SteamCommunity();
}

DepositManager.prototype.submitDeposit = function(user, items, callback) {
  if (user.trade_url == null) {
    return callback('Please set your trade URL in Steam Settings in the upper right-hand corner of the window.');
  }

  botManager.sendSubmitRequest(user, items, (err, data) => {
    if (err && err instanceof Error) {
      return callback(err.message, data);
    }
    return callback(err, data);
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
        cache.expire(userId, CACHE_TIMEOUT);
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
        val.price = item ? item.price : '?';
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
  cache.get(userId + '' + COOLDOWN_ENDPOINT, (err, data) => {
    if (data !== null) {
      cache.ttl(userId + '' + COOLDOWN_ENDPOINT, (err, ttl) => {
        return callback(new Error('You must wait ' + formatSeconds(ttl) + ' before force refreshing again.'));
      });
    } else {
      self.queryInventory(userId, (error, data) => {
        return callback(error, data);
      });

      cache.set(userId + '' + COOLDOWN_ENDPOINT, 'yoooo');
      cache.expire(userId + '' + COOLDOWN_ENDPOINT, REFRESH_COOLDOWN);
    }
  });
}

self = new DepositManager();

function formatSeconds(time) {
  var minutes = Math.floor(time / 60);
  var seconds = time - minutes * 60;
  return (minutes > 1 ? minutes + ' minutes ' : (minutes == 1 ? '1 minute ' : '')) + '' + (seconds > 1 ? seconds + ' seconds' : (seconds == 1 ? '1 second' : ''));
}

module.exports = self;
