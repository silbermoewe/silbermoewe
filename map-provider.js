var config = require('./config.json');
var map = require(config.posts + '/map.json');

module.exports = JSON.stringify(map);
