# Description
#   A Hubot script that display the @sakagemc's photos.
#
# Dependencies:
#   None
#
# Configuration:
#   None
#
# Commands:
#   hubot sakagemc [bomb [<N>]] - display the @sakagemc's photos.
#
# Author:
#   bouzuya <m@bouzuya.net>
#
module.exports = (robot) ->
  robot.respond /sakagemc(?:\s+(bomb(?:\s+(\d+))?))?\s*$/i, (res) ->
    n = unless res.match[1]? then '1' else res.match[2] ? '5'
    res
      .http 'http://sakagemc.herokuapp.com/photos'
      .query { n }
      .get() (err, _, body) ->
        if err?
          robot.logger.error err
          res.send 'hubot-sakagemc: error'
          return
        photos = JSON.parse body
        message = photos
          .map (photo) -> [photo.url, photo.title].join '\n'
          .join '\n'
        res.send message
