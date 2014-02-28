var util = require('util');
var flickr = require('./flickr');

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
    if (cached) {
      var d = res.random(cached);
      res.send(d.title);
      res.send(d.url);
    } else {
      res.send('sorry... i\'m busy...');
    }
  });
};
