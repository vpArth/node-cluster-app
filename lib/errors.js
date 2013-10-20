var util    = require('util')

function ClusterAppError(message){
  this.message = message;
  Error.captureStackTrace(this, ClusterAppError);
}
util.inherits(ClusterAppError, Error)

function ClusterAppNoMasterError(){
  this.message = 'No master';
  Error.captureStackTrace(this, ClusterAppError);
}
util.inherits(ClusterAppNoMasterError, ClusterAppError)

function ClusterAppNoWorkerError(){
  this.message = 'No worker';
  Error.captureStackTrace(this, ClusterAppNoWorkerError);
}
util.inherits(ClusterAppNoWorkerError, ClusterAppError)

function ClusterAppMasterHasNotStartMethod(){
  this.message = 'Master should have start method';
  Error.captureStackTrace(this, ClusterAppMasterHasNotStartMethod);
}
util.inherits(ClusterAppMasterHasNotStartMethod, ClusterAppError)

function ClusterAppWorkerHasNotStartMethod(){
  this.message = 'Worker should have start method';
  Error.captureStackTrace(this, ClusterAppWorkerHasNotStartMethod);
}
util.inherits(ClusterAppWorkerHasNotStartMethod, ClusterAppError)


module.exports = exports = {
  ClusterAppError                   :   ClusterAppError,
  ClusterAppNoMasterError           :   ClusterAppNoMasterError,
  ClusterAppNoWorkerError           :   ClusterAppNoWorkerError,
  ClusterAppMasterHasNotStartMethod :   ClusterAppMasterHasNotStartMethod,
  ClusterAppWorkerHasNotStartMethod :   ClusterAppWorkerHasNotStartMethod,
}