var util = require('util');
var flickr = require('./flickr');
var random = require('./random');

module.exports = function(robot) {
  var cached = null;

  flickr()
  .then(function(result) {
    robot.logger.info('hubot-sakagemc: cached ' + result.length);
    cached = result;
  })
  .catch(function(err) {
    robot.logger.error(err);
  });

  robot.respond(/\s*sakagemc\s*$/i, function(res) {
    if (!cached) {
      res.send('sorry... i\'m busy...');
      return;
    }

    var d = res.random(cached);
    res.send(d.title);
    res.send(d.url);
  });

  robot.respond(/\s*sakagemc\s+bomb(\s*(\d+))?$/i, function(res) {
    if (!cached) {
      res.send('sorry... i\'m busy...');
      return;
    }

    var count = res.match[2] || 5;
    random(cached, count).forEach(function(d) {
      res.send(d.title);
      res.send(d.url);
    });
  });
};
