'use strict';
var es = require('event-stream');
var gutil = require('gulp-util');
var fs = require('fs');
var exec = require('child_process').exec;
var chalk = require('chalk');

//////////////////////////////
// Execute with Callback
//////////////////////////////
function execute(command, callback){
  exec(command, function(error, stdout, stderr){ callback(stdout); });
};
//////////////////////////////
// Recursive Folder Delete
//////////////////////////////
var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

module.exports = function (options) {
  return es.map(function (file, cb) {
    var folder = file.path.replace(file.cwd + '/', './');

    var remote = 'origin';
    var branch = 'gh-pages';
    var message = 'Distribution Commit';
    if (options !== undefined) {
      remote = options.remote || remote;
      branch = options.branch || branch;
      message = options.message || message;
    }



    // execute('git add ' + folder, function () {
    execute('git add ' + folder + ' && git commit -m "' + message + '"', function () {
      gutil.log('Temporarily committing ' + chalk.magenta(folder));
      execute('git ls-remote ' + remote + ' ' + branch, function (remote) {
        gutil.log(remote.length);
        if (remote.length > 0) {
          gutil.log('Removing ' + chalk.cyan(remote) + '/' + chalk.cyan(branch));
          deployFinish();
        }
        else {
          deployFinish();
        }
      });
    });

    //////////////////////////////
    // Finish Deploy
    //////////////////////////////
    var deployFinish = function () {
      gutil.log('Pushing' + chalk.magenta(folder) + ' to ' + chalk.cyan(remote) + '/' + chalk.cyan(branch));
      execute('git subtree push --prefix ' + folder + ' ' + remote + ' ' + branch, function () {
        gutil.log('Resetting temporary commit');
        execute('git reset HEAD^', function () {
          gutil.log('Cleaning ' + chalk.magenta(folder));
          deleteFolderRecursive(folder);
          return cb(null, file);
        });
      });
    };
  });
};