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
var q = require('q');

var Loader = function() {
  this._sakagemcId = process.env.HUBOT_SAKAGEMC_ID;
  this._authOptions = {
    api_key: process.env.HUBOT_SAKAGEMC_FLICKR_API_KEY,
    secret:  process.env.HUBOT_SAKAGEMC_FLICKR_SECRET
  };
};

Loader.prototype._authenticate = function() {
  var deferred = q.defer();
  Flickr.tokenOnly(this._authOptions, function(err, flickr) {
    if (err) {
      deferred.reject(err);
    } else {
      this.flickr = flickr;
      deferred.resolve();
    }
  }.bind(this));
  return deferred.promise;
};

Loader.prototype._getPublicPhotos = function(page) {
  var deferred = q.defer();
  this.flickr.people.getPublicPhotos({
    user_id: this._sakagemcId,
    page: page,
    per_page: 500,
  }, function(err, result) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(result);
    }
  });
  return deferred.promise;
};

Loader.prototype._getPublicPhotosAll = function() {
  var deferred = q.defer();
  var f = (function(page, photos) {
    this._getPublicPhotos(page).then(function(result) {
      var newPhotos = photos.concat(result.photos.photo);
      if (result.photos.page < result.photos.pages) {
        f(page + 1, newPhotos);
      } else {
        deferred.resolve(newPhotos);
      }
    }).catch(function(err) {
      deferred.reject(err);
    });
  }).bind(this);
  f(1, []);
  return deferred.promise;
};

Loader.prototype._formatPhotos = function(photos) {
  var deferred = q.defer();
  var formatUrl = function(o) {
    var format = 'http://farm%s.staticflickr.com/%s/%s_%s.jpg';
    return util.format(format, o.farm, o.server, o.id, o.secret);
  };
  deferred.resolve(photos.map(function(p) {
    return { title: p.title, url: formatUrl(p) };
  }));
  return deferred.promise;
};

Loader.prototype.load = function() {
  var deferred = q.defer();
  this._authenticate()
  .then(this._getPublicPhotosAll.bind(this))
  .then(this._formatPhotos.bind(this))
  .then(function(loaded) {
    return deferred.resolve(loaded);
  })
  .catch(function(err) {
    deferred.reject(err);
  });
  return deferred.promise;
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
