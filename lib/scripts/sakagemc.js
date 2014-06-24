// Description
//   sakagemc flickr
//
// Dependencies:
//   "flickrapi": "~0.3.13",
//   "lodash": "^2.4.1",
//   "q": "~1.0.0",
//
// Configuration:
//   HUBOT_SAKAGEMC_ID
//   HUBOT_SAKAGEMC_FLICKR_API_KEY
//   HUBOT_SAKAGEMC_FLICKR_SECRET
//
// Commands:
//   hubot sakagemc - sakagemc flickr
//   hubot sakagemc bomb - sakagemc flickr
//   hubot sakagemc bomb <N> - sakagemc flickr
//
// Author:
//   bouzuya
//
var util = require('util');
var Flickr = require('flickrapi');
var _ = require('lodash');
var Promise = require('q').Promise;

var Loader = function() {
  this._sakagemcId = process.env.HUBOT_SAKAGEMC_ID;
  this._authOptions = {
    api_key: process.env.HUBOT_SAKAGEMC_FLICKR_API_KEY,
    secret:  process.env.HUBOT_SAKAGEMC_FLICKR_SECRET
  };
};

Loader.prototype._authenticate = function() {
  return new Promise(function(resolve, reject) {
    Flickr.tokenOnly(this._authOptions, function(err, flickr) {
      if (err) {
        reject(err);
      } else {
        this.flickr = flickr;
        resolve();
      }
    }.bind(this));
  }.bind(this));
};

Loader.prototype._getPublicPhotos = function(page) {
  return new Promise(function(resolve, reject) {
    this.flickr.people.getPublicPhotos({
      user_id: this._sakagemcId,
      page: page,
      per_page: 500,
    }, function(err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  }.bind(this));
};

Loader.prototype._getPublicPhotosAll = function() {
  return new Promise(function(resolve, reject) {
    var f = (function(page, photos) {
      this._getPublicPhotos(page).then(function(result) {
        var newPhotos = photos.concat(result.photos.photo);
        if (result.photos.page < result.photos.pages) {
          f(page + 1, newPhotos);
        } else {
          resolve(newPhotos);
        }
      }).catch(function(err) {
        reject(err);
      });
    }).bind(this);
    f(1, []);
  }.bind(this));
};

Loader.prototype._formatPhotos = function(photos) {
  var formatUrl = function(o) {
    var format = 'http://farm%s.staticflickr.com/%s/%s_%s.jpg';
    return util.format(format, o.farm, o.server, o.id, o.secret);
  };
  return Promise.resolve(photos.map(function(p) {
    return { title: p.title, url: formatUrl(p) };
  }));
};

Loader.prototype.load = function() {
  return new Promise(function(resolve, reject) {
    this._authenticate()
    .then(this._getPublicPhotosAll.bind(this))
    .then(this._formatPhotos.bind(this))
    .then(function(loaded) {
      return resolve(loaded);
    })
    .catch(function(err) {
      reject(err);
    });
  }.bind(this));
};

module.exports = function(robot) {
  var cached = null;

  new Loader().load().then(function(result) {
    robot.logger.info('hubot-sakagemc: cached ' + result.length);
    cached = result;
  })
  .catch(function(err) {
    robot.logger.error(err);
  });

  robot.respond(/\s*sakagemc(\s+bomb(\s*(\d+))?)?$/i, function(res) {
    if (!cached) {
      res.send('sorry... loading...');
      return;
    }

    var count = (!res.match[1] ? 1 : (res.match[3] ? parseInt(res.match[3], 10) : 5));
    _.shuffle(cached).slice(0, count).forEach(function(d) {
      res.send.call(res, d.title, d.url);
    });
  });
};
