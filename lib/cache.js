var redis = require('redis');
var jsonify = require('redis-jsonify');
var client = jsonify(redis.createClient(process.env.REDIS_URL));

client.on('error', (error) => {
  console.log('Redis error: ', error);
});

client.on('connect', () => {
  console.log('Connected to Redis server.');
});

module.exports = client;
