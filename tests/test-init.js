var Tool = require('../index')
  , Test = require('./test')
  ;
var tests = new Test('Init Test');
var tool = new Tool;

tests.add('Init without worker', Test.catch(function () {
  tool.init();
}, new Tool.ClusterAppError('Empty worker value')));

tests.add('Wrong worker', Test.catch(function () {
  tool.init(__dirname + '/wrongworker')
}, new Tool.ClusterAppError('Wrong worker')));

tests.add('Success Init', function setEmptyWorker(success, fail) {
  setTimeout(function () {
    tool.init(__dirname + '/exitworker');
    success()
  }, 100)
});

tests.add('Already initialized', Test.catch(function () {
  tool.init(__dirname + '/emptyworker')
}, new Tool.ClusterAppError('Already initialized')));

tests.run(function (res) {
  process.exit(res);
});

