var async = require('async')
  , util  = require('util')
  , domain= require('domain')
  , assert= require('assert')
  ;
function Test (title) {
  var self = this;
  var fns = {};
  var tests = [];
  function add(test, fn){
    tests.push(test);
    fns[test] = fn;
  }
  function run(next){
    var all = tests.length;
    // console.log(tests)
    var passed = 0;
    util.log('['+title+'] Start');

    var d = domain.create();
    async.eachSeries(tests, function(test, next){
      function success(){
          passed++;
          util.log('['+test+'] Success');
          next()
      }
      function fail(e){
          util.log('['+test+'] Fail: '+e);
          next()
        }      
      var fn = fns[test];
      d.on('error', fail);
      d.run(function(){ 
        fn(success, fail) 
      })
    }, function(){
      util.log('['+title+'] '+passed+'/'+all+' tests passed');
      setTimeout(next, 10, all-passed);
    })
  }

  this.add = add;
  this.nadd = function(){}; // for tests bypassing
  this.run = run;
}
Test.catch = function(fn, err){
  return function (success, fail) {
    var d = domain.create();
    d.on('error', function(e){
      try{
        assert.ok(e instanceof err.constructor, 'Wrong Error Type('+e.constructor.name+')');
        assert.equal(err.message, e.message, 'Wrong Error message');
        success();
      } catch(e){
        fail(e);
      }
    });
    d.run(function(){
      setImmediate(function(){
        fn();
        fail(new Error('No exception throwed'));
      });
    });
  };
};

module.exports = Test;

