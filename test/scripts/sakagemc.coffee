{Robot, User, TextMessage} = require 'hubot'
assert = require 'power-assert'
path = require 'path'
sinon = require 'sinon'

describe 'sakagemc', ->
  beforeEach (done) ->
    @sinon = sinon.sandbox.create()
    # for warning: possible EventEmitter memory leak detected.
    # process.on 'uncaughtException'
    @sinon.stub process, 'on', -> null
    @robot = new Robot(path.resolve(__dirname, '..'), 'shell', false, 'hubot')
    @robot.adapter.on 'connected', =>
      @robot.load path.resolve(__dirname, '../../src/scripts')
      done()
    @robot.run()

  afterEach (done) ->
    @robot.brain.on 'close', =>
      @sinon.restore()
      done()
    @robot.shutdown()

  describe 'listeners[0].regex', ->
    beforeEach ->
      @sender = new User 'bouzuya', room: 'hitoridokusho'
      @callback = @sinon.spy()
      @robot.listeners[0].callback = @callback

    describe 'receive "@hubot sakagemc "', ->
      beforeEach ->
        message = '@hubot sakagemc '
        @robot.adapter.receive new TextMessage(@sender, message)

      it 'calls *sakagemc* with "@hubot sakagemc "', ->
        assert @callback.callCount is 1
        assert @callback.firstCall.args[0].match.length is 3
        assert @callback.firstCall.args[0].match[0] is '@hubot sakagemc '
        assert @callback.firstCall.args[0].match[1] is undefined
        assert @callback.firstCall.args[0].match[2] is undefined

    describe 'receive "@hubot sakagemc bomb "', ->
      beforeEach ->
        message = '@hubot sakagemc bomb '
        @robot.adapter.receive new TextMessage(@sender, message)

      it 'calls *sakagemc* with "@hubot sakagemc bomb "', ->
        assert @callback.callCount is 1
        assert @callback.firstCall.args[0].match.length is 3
        assert @callback.firstCall.args[0].match[0] is '@hubot sakagemc bomb '
        assert @callback.firstCall.args[0].match[1] is 'bomb'
        assert @callback.firstCall.args[0].match[2] is undefined

    describe 'receive "@hubot sakagemc bomb 2 "', ->
      beforeEach ->
        message = '@hubot sakagemc bomb 2 '
        @robot.adapter.receive new TextMessage(@sender, message)

      it 'calls *sakagemc* with "@hubot sakagemc bomb 2 "', ->
        assert @callback.callCount is 1
        assert @callback.firstCall.args[0].match.length is 3
        assert @callback.firstCall.args[0].match[0] is '@hubot sakagemc bomb 2 '
        assert @callback.firstCall.args[0].match[1] is 'bomb 2'
        assert @callback.firstCall.args[0].match[2] is '2'

  describe 'listeners[0].callback', ->
    beforeEach ->
      @sakagemc = @robot.listeners[0].callback

    describe 'receive "@hubot sakagemc"', ->
      beforeEach ->
        responseBody = [
          url: 'http://photo1.example.com'
          title: 'title1'
        ]
        httpGetResponse = @sinon.stub()
        httpGetResponse
          .onFirstCall()
          .callsArgWith 0, null, null, JSON.stringify(responseBody)
        httpGet = @sinon.stub()
        httpGet.onFirstCall().returns httpGetResponse
        @httpQuery = @sinon.stub()
        @httpQuery.onFirstCall().returns get: httpGet
        @http = @sinon.stub()
        @http.onFirstCall().returns query: @httpQuery
        @send = @sinon.spy()
        @sakagemc
          match: ['@hubot sakagemc']
          send: @send
          http: @http

      it 'send a photo', ->
        assert.deepEqual @http.getCall(0).args[0],
          'http://sakagemc.herokuapp.com/photos'
        assert.deepEqual @httpQuery.getCall(0).args[0], { n: '1' }
        assert @send.callCount is 1
        assert @send.firstCall.args[0] is '''
          http://photo1.example.com
          title1
        '''

    describe 'receive "@hubot sakagemc bomb"', ->
      beforeEach ->
        responseBody = [
          url: 'http://photo1.example.com'
          title: 'title1'
        ,
          url: 'http://photo2.example.com'
          title: 'title2'
        ,
          url: 'http://photo3.example.com'
          title: 'title3'
        ,
          url: 'http://photo4.example.com'
          title: 'title4'
        ,
          url: 'http://photo5.example.com'
          title: 'title5'
        ]
        httpGetResponse = @sinon.stub()
        httpGetResponse
          .onFirstCall()
          .callsArgWith 0, null, null, JSON.stringify(responseBody)
        httpGet = @sinon.stub()
        httpGet.onFirstCall().returns httpGetResponse
        @httpQuery = @sinon.stub()
        @httpQuery.onFirstCall().returns get: httpGet
        @http = @sinon.stub()
        @http.onFirstCall().returns query: @httpQuery
        @send = @sinon.spy()
        @sakagemc
          match: ['@hubot sakagemc bomb', 'bomb']
          send: @send
          http: @http

      it 'send 5 photos', ->
        assert.deepEqual @http.getCall(0).args[0],
          'http://sakagemc.herokuapp.com/photos'
        assert.deepEqual @httpQuery.getCall(0).args[0], { n: '5' }
        assert @send.callCount is 1
        assert @send.firstCall.args[0] is '''
          http://photo1.example.com
          title1
          http://photo2.example.com
          title2
          http://photo3.example.com
          title3
          http://photo4.example.com
          title4
          http://photo5.example.com
          title5
        '''

    describe 'receive "@hubot sakagemc bomb 2"', ->
      beforeEach ->
        responseBody = [
          url: 'http://photo1.example.com'
          title: 'title1'
        ,
          url: 'http://photo2.example.com'
          title: 'title2'
        ]
        httpGetResponse = @sinon.stub()
        httpGetResponse
          .onFirstCall()
          .callsArgWith 0, null, null, JSON.stringify(responseBody)
        httpGet = @sinon.stub()
        httpGet.onFirstCall().returns httpGetResponse
        @httpQuery = @sinon.stub()
        @httpQuery.onFirstCall().returns get: httpGet
        @http = @sinon.stub()
        @http.onFirstCall().returns query: @httpQuery
        @send = @sinon.spy()
        @sakagemc
          match: ['@hubot sakagemc bomb', 'bomb 2', '2']
          send: @send
          http: @http

      it 'send 2 photos', ->
        assert.deepEqual @http.getCall(0).args[0],
          'http://sakagemc.herokuapp.com/photos'
        assert.deepEqual @httpQuery.getCall(0).args[0], { n: '2' }
        assert @send.callCount is 1
        assert @send.firstCall.args[0] is '''
          http://photo1.example.com
          title1
          http://photo2.example.com
          title2
        '''
