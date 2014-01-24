var spawn = require('child_process').spawn
  , exitCode = 0
  , timeout = 15000
  , fs = require('fs')
  , util = require('util')
  ;
util.log('Testing started\n');
fs.readdir(__dirname, function (e, files) {
  if (e) throw e;
  var tests = files.filter(function (f) {
    return f.slice(0, 'test-'.length) === 'test-'
  });
  var all = tests.length;
  var passed = 0;
  var next = function () {
    if (tests.length === 0) {
      util.log('Testing finished: ' + passed + '/' + all + ' succeed\n');
      process.exit(exitCode);
    }

    var file = tests.shift();
    util.log(file);
    var proc = spawn('node', [ __dirname + '/' + file ]);

    var killed = false;
    var t = setTimeout(function () {
      proc.kill();
      exitCode += 1;
      killed = true
    }, timeout);

    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
    proc.on('exit', function (code) {
      if (code && !killed) util.log(file + ' failed\n');
      else if (killed) {
        util.log(file + ' timeout\n');
      }
      else {
        util.log(file + ' succeed\n');
        passed++;
      }
      exitCode += code || 0;
      clearTimeout(t);
      next()
    })
  };
  next()

});


