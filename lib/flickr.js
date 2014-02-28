var util = require('util');
var q = require('q');
var Flickr = require('flickrapi');

var SAKAGEMC_ID = '90569826@N04';

var getFlickr = function() {
  var deferred = q.defer();
  Flickr.authenticate({
    api_key: process.env.FLICKR_API_KEY,
    secret: process.env.FLICKR_SECRET,
    user_id: process.env.FLICKR_USER_ID,
    access_token: process.env.FLICKR_ACCESS_TOKEN,
    access_token_secret: process.env.FLICKR_ACCESS_TOKEN_SECRET
  }, function(err, flickr) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(flickr);
    }
  });
  return deferred.promise;
};

var getPublicPhotos = function(flickr, page) {
  var deferred = q.defer();
  flickr.people.getPublicPhotos({
    user_id: SAKAGEMC_ID,
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

var getPublicPhotosAll = function(flickr) {
  var deferred = q.defer();
  var photos = [];
  var f = function(flickr, page) {
    getPublicPhotos(flickr, page).then(function(result) {
      photos = photos.concat(result.photos.photo);
      if (result.page < result.pages) {
        f(flickr, page + 1);
      } else {
        deferred.resolve(photos);
      }
    }).catch(function(err) {
      deferred.reject(err);
    });
  };
  f(flickr, 1);
  return deferred.promise;
};

var formatPhotos = function(photos) {
  var formatUrl = function(o) {
    var format = 'http://farm%s.staticflickr.com/%s/%s_%s.jpg';
    return util.format(format, o.farm, o.server, o.id, o.secret);
  };

  return photos.map(function(p) {
    return { title: p.title, url: formatUrl(p) };
  });
};

module.exports = function() {
  var deferred = q.defer();
  getFlickr().then(function(flickr) {
    return getPublicPhotosAll(flickr);
  })
  .then(function(photos) {
    return deferred.resolve(formatPhotos(photos));
  })
  .catch(function(err) {
    deferred.reject(err);
  });
  return deferred.promise;
};

