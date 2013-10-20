var Tool   = require('../index')
  , Test   = require('./test')
  , assert = require('assert')
  , util   = require('util')
  ;
var tests = new Test('Four Exit Workers Test')

var tool  = new Tool({workers: 1})
tool.init(__dirname+'/exitworker.js')

tests.add('Success start-end four', function fourEmptyWorkers(success, fail) {
  var tool  = new Tool({workers: 4})
  setImmediate(function(){
    tool.start()
    var count = 4;
    tool.on('exit', function(worker){
      assert.equal(worker.process.pid % 256, worker.process.exitCode)
      if(!--count) success()
    })
  })
})

tests.run(function(res){
  process.exit(res);
});