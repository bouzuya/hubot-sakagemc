var fs = require('fs');
var path = require('path');

module.exports = function(robot) {
  var dir = path.resolve(__dirname, 'lib/scripts');
  fs.readdirSync(dir).forEach(function(file) {
    robot.loadFile(dir, file);
  });
};

