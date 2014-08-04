/**
 * Flexible logging wrapper around winston
 *
 * usage:
 *  var log = require('js-log')()
 *  log.debug("Winston %s", "syntax");
 *
 * enabling debug directly in the code:
 *  log.debugOn();
 * enabling debug for paths from CLI:
 *  DEBUG=path node app
 * where path is calculated from the project root (where package.json resides)
 * example:
 *  DEBUG=models/* node app
 *  DEBUG=models/*,lib/* node app
 * exclusion:
 *  DEBUG=-models/user,models/* node app (to log all models except user)
 */

var winston = require('winston');
var path = require('path');
var fs = require('fs');

var names = [], skips = [];

(process.env.DEBUG || '')
  .split(/[\s,]+/)
  .forEach(function(name) {
    name = name.replace('*', '.*?');
    if (name[0] === '-') {
      skips.push(new RegExp('^' + name.substr(1) + '$'));
    } else {
      names.push(new RegExp('^' + name + '$'));
    }
  });

/*
// breaks when running tests with mocha
// mocha is root module for tests, but /usr/local/lib/node_modules/mocha is not project root

function findProjectRoot(logModule) {
  var root = logModule;
  while (root.parent) root = root.parent;

  var dir = path.dirname(root.filename);
  while (dir != '/' && !fs.existsSync(path.join(dir, 'package.json'))) {
    dir = path.dirname(dir);
  }

  return path.normalize(dir);
}*/


function getLogLevel(logModule) {

  var projectRoot = process.cwd();

  var modulePath = logModule.filename.slice(projectRoot.length + 1); // models/user.js
  modulePath = modulePath.replace(/\.js$/, ''); // models.user

  var logLevel = 'info';

  var isSkipped = skips.some(function(re) {
    return re.test(modulePath);
  });

  if (!isSkipped) {
    var isIncluded = names.some(function(re) {
      return re.test(modulePath);
    });

    if (isIncluded) logLevel = 'debug';
  }

  return logLevel;
}

function getShowPath(logModule) {
  var projectRoot = process.cwd();
  console.log(projectRoot, logModule.filename);

  return logModule.filename.slice(projectRoot.length + 1).split('/').slice(-2).join('/');
}

function getTransports(level, label) {
  return [
    new winston.transports.Console({
      colorize: true,
      level: level,
      label: label
    })
  ];
}

function getLogger(options) {
  options = options || {};
  var logModule = options.module || module.parent;
  var showPath = (options.getShowPath || getShowPath)(logModule);
  var logLevel = (options.getLogLevel || getLogLevel)(logModule);
  var transports = (options.getTransports || getTransports)(logLevel, showPath);

  var logger = new winston.Logger({
    transports: transports
  });

  logger.debugOn = function() {
    Object.keys(this.transports).forEach(function(key) {
      logger.transports[key].level = 'debug';
    }, this);
  };

  return logger;
}

module.exports = getLogger;

delete require.cache[__filename];
