
# Simple & configurable logger

Usage:

```js
var log = require('js-log')();

log.info("Hi everyone!");
```

`log` is a `winston`-based logger with usual methods. 

By default it prints all messages except `log.debug()` and prepends them with module filename and directory.

Logging methods:

  - `log.debug(...)`
  - `log.info(...)`
  - `log.error(...)`

The signature is like `console.log`.

Additionally:

  - `log.debugOn()` -- enable debug for this very logger 

Options:

```
var log = require('js-log')({
  module: <module object to log for>, by default - the requiring module,
  getShowPath: <function which returns label for module>
  getLogLevel: <function which returns log level (error/info/debug) for module>,
  getTransports: <function which returns transports for (logLevel, label)>
});
```

All options are optional.

# DEBUG

There're two ways to enable debugging.

  1. Call `log.debugOn()` in the code
  2. Use `DEBUG` environment variable

Turn on all debugging:

```
DEBUG=* node app
```

`DEBUG` can be either `'*'` or a file mask to debug, in the same format as https://github.com/visionmedia/debug.

Examples:

```js
// all files from the models/* folder (from project root)
DEBUG=models/* node app

// all files from models/* and lib/*
DEBUG=models/*,lib/* node app

// all files from models/* except models/user
DEBUG=-models/user,models/* node app
```

It's quite important that `DEBUG` is also used on many frameworks. 

**`DEBUG=*` will enable all debug for both your loggers and internal debugging of frameworks.**

Sometimes it really helps.
