var cache = require('../lib/cache');
var SteamCommunity = require('steamcommunity');
var Price = require('./../models/price').Price;
var async = require('async');

var self;

var CACHE_TIMEOUT = 20 * 60;

function DepositManager() {
  self = this;
  this.community = new SteamCommunity();
}

//http://steamcommunity.com/profiles/76561198123588820/inventory/json/730/2

DepositManager.prototype.requestUserInventory = function(userId, callback) {
  cache.get(userId, (err, data) => {
    if (data !== null) {
      return callback(err, data);
    }

    self.community.getUserInventoryContents(userId, 730, 2, true, (err, inv) => {
      if (err) {
        return callback(err);
      }

      async.each(inv, (val, callback) => {
        Price.findOne({ name: val.market_hash_name }, (err, item) => {
          val.price = item.price;
          return callback();
        });
      }, () => {
        var data = JSON.stringify(inv);
        cache.set(userId, data);
        cache.expire(userId, CACHE_TIMEOUT);
        return callback(null, data);
      });
    });
  });
}

self = new DepositManager();

module.exports = self;
