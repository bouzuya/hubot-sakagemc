# hubot-sakagemc

A Hubot script that display the [@sakagemc](https://twitter.com/sakagemc)'s photos.

## Installation

    $ npm install git://github.com/bouzuya/hubot-sakagemc.git

or

    $ # TAG is the package version you need.
    $ npm install 'git://github.com/bouzuya/hubot-sakagemc.git#TAG'

## Sample Interaction

    bouzuya> hubot help sakagemc
    hubot> hubot sakagemc [<N>] - display the @sakagemc's photos.

    bouzuya> hubot sakagemc
    hubot> 【 Tension 】流れに葛藤を与える
    http://farm8.staticflickr.com/7430/11533404385_69fc4973b2.jpg

See [`src/scripts/sakagemc.coffee`](src/scripts/sakagemc.coffee) for full documentation.

## License

### version >= 0.3

MIT

### version < 0.3

ISC

## Development

### Run test

    $ npm test

### Run robot

    $ npm run robot


## Badges

[![Build Status][travis-badge]][travis]
[![Dependencies status][david-dm-badge]][david-dm]

[travis]: https://travis-ci.org/bouzuya/hubot-sakagemc
[travis-badge]: https://travis-ci.org/bouzuya/hubot-sakagemc.svg?branch=master
[david-dm]: https://david-dm.org/bouzuya/hubot-sakagemc
[david-dm-badge]: https://david-dm.org/bouzuya/hubot-sakagemc.png
