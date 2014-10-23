// Description
//   A Hubot script that display the @sakagemc's photos.
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
// Commands:
//   hubot sakagemc [bomb [<N>]] - display the @sakagemc's photos.
//
// Author:
//   bouzuya <m@bouzuya.net>
//
module.exports = function(robot) {
  return robot.respond(/sakagemc(?:\s+(bomb(?:\s+(\d+))?))?\s*$/i, function(res) {
    var n, _ref;
    n = res.match[1] == null ? '1' : (_ref = res.match[2]) != null ? _ref : '5';
    return res.http('http://sakagemc.herokuapp.com/photos').query({
      n: n
    }).get()(function(err, _, body) {
      var message, photos;
      if (err != null) {
        robot.logger.error(err);
        res.send('hubot-sakagemc: error');
        return;
      }
      photos = JSON.parse(body);
      message = photos.map(function(photo) {
        return [photo.url, photo.title].join('\n');
      }).join('\n');
      return res.send(message);
    });
  });
};
