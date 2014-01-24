var Tool = require('../index')
  , Test = require('./test')
  , assert = require('assert')
  ;

var tests = new Test('Workflow Test');

var tool = new Tool({workers: 1});
tool.init(__dirname + '/worker');

tests.add('Start', function start(success, fail) {
  setImmediate(function () {
    tool.once('start', function () {
      success()
    }).start()
  });
});

tests.add('Already Started', Test.catch(function () {
  tool.start();
}, new Tool.ClusterAppError('Already started')));

tests.add('Restart', function restart(success, fail) {
  setImmediate(function () {
    var flag = 0;
    tool.once('stop',function () {
      flag++;
    }).once('start',function () {
      assert.ok(flag);
      success();
    }).restart();
  });
});

tests.add('Stop', function stop(success, fail) {
  setImmediate(function () {
    tool.once('stop',function () {
      success()
    }).stop();
  });
});

tests.run(function (res) {
  process.exit(res);
});

