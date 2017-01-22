var request = require('request');
var totp = require('notp').totp;
var async = require('async');
var base32 = require('thirty-two');
var Price = require('../models/price').Price;

function updatePrices() {
  async.waterfall([requestApi, updateDatabase], (err, results) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Price Updater - Updated all prices successfully.');
    }
  });
}

function requestApi(callback) {
  var code = totp.gen(base32.decode(process.env.BITSKINS_API_SECRET));
  request('https://bitskins.com/api/v1/get_all_item_prices?api_key=' + process.env.BITSKINS_API_KEY + '&code=' + code, (err, response, body) => {
    if (err) {
      return callback('Price Updater - Error while trying to update prices: ' + err);
    }

    var json = {};

    try {
      json = JSON.parse(body);
    } catch (err) {
      return callback('Price Updater - Error while trying to update prices: ' + err);
    }

    if (json.status == 'success') {
      callback(null, json.prices);
    } else {
      callback('Price Updater - Error while updating prices: ', json);
    }
  });
}

function updateDatabase(items, callback) {
  async.each(items, (val, callback) => {
    var name = val.market_hash_name;
    var price = val.price;
    Price.update({ name }, {
      $set: { price }
    }, { upsert: true }, (err) => {
      if (err) {
        return callback('Price Updater - Error while updating ' + val.market_hash_name + ': ' + err.message);
      }
      callback();
    });
  }, (error) => {
    callback(error);
  });
}

module.exports = (interval) => {
  updatePrices();

  setInterval(updatePrices, interval);
}
