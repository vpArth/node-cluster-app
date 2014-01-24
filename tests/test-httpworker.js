var Tool = require('..')
  , Test = require('./test')
  , assert = require('assert')
  , domain = require('domain')
  , request = require('request')
  ;

var tests = new Test('Http Worker Test');

var num = 2;
var tool = new Tool({workers: num});
tool.init(__dirname + '/httpworker.js');


tests.add('Start-Stop', function StartStop(success, fail) {
  setImmediate(function () {
    var lcount = num;
    tool.on('listening', function () {
      if (!--lcount) {
        tool.stop();
      }
    });
    var ecount = num;
    tool.on('exit', function () {
      if (!--ecount) success();
    });
    tool.setEvlog(false);
    tool.start();
  });
});

tests.add('Http request', function httpRequest(success, fail) {
  var d = domain.create();
  d.on('error', function (e) {
    fail(e);
  });
  d.run(function () {
    setImmediate(function () {
      tool.once('listening',function (w, address) {
        //make request
        request.get('http://0.0.0.0:' + address.port + '/test', function (err, res, body) {
          if (err) throw err;
          assert.equal(res.statusCode, 200);
          assert.equal(body, 'Hello, world');
          tool.stop();
        });
      }).once('log',function (msg) {
        assert.equal(msg, 'GET /test');
      }).once('stop', function () {
        success();
      });
      tool.setEvlog(false);
      tool.start();
    });
  });
});

tests.add('Http: stop action', function stopAction(success, fail) {
  var d = domain.create();
  d.on('error', fail);
  d.run(function () {
    setImmediate(function () {
      tool.once('listening',function (w, address) {
        //make request
        request.get('http://0.0.0.0:' + address.port + '/?action=stop', function (err, res, body) {
          if (err) throw err;
          assert.equal(res.statusCode, 200);
          assert.equal(body, 'Stopped');
        });
      }).once('log',function (msg) {
        assert.equal(msg, 'GET /?action=stop');
      }).once('stop', function () {
        success();
      });
      tool.setEvlog(false);
      tool.start();
    });
  });
});

tests.add('Http: restart action', function restartAction(success, fail) {
  var d = domain.create();
  d.on('error', fail);
  d.run(function () {
    setImmediate(function () {
      tool.once('listening',function (w, address) {
        //make request
        request.get('http://0.0.0.0:' + address.port + '/?action=restart', function (err, res, body) {
          if (err) throw err;
          assert.equal(res.statusCode, 200);
          assert.equal(body, 'Stopped');
        });
      }).once('log',function (msg) {
        assert.equal(msg, 'GET /?action=restart');
      }).once('stop', function () {
        tool.once('listening', function () {
          success();
        });
      });
      tool.setEvlog(false);
      tool.start();
    });
  });
});


tests.run(function (res) {
  process.exit(res);
});

