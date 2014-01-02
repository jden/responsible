module.exports = function (req, res, next) {
  res.send = res.send || send.bind(res)
  res.error = error.bind(res)
  next()
}

var codes = {
  '400': 'Invalid Request',
  '403': 'Unauthorized',
  '404': 'Not Found',
  '500': 'Error Processing Request'
}

function error (err) {
  var res = this
  var code = 500;
  var message = 'Error';
  var trace;

  if (err instanceof Error) {
    message = err.toString();
    if (err.code) {
      code = err.code;
    }
    trace = err.stack;
  }

  // handle `res.error(400)` signature
  if (typeof err === 'number' && err >= 400 && err < 600) {
    code = err;
  }


  trace = trace || (new Error()).stack;
  var verboseMessage = {
      code: code,
      message: message,
      trace: trace
  }
  module.exports.logError(verboseMessage)

  if (module.exports.quiet) {
    res.send(code)
  } else {
    if (module.exports.verbose) {
      res.send(code, verboseMessage)
    } else {
      res.send(code, codes[code] || 'Error')
    }
  }

}

// very limited functionality, will send plaintext and json
function send(code, content) {
  if (typeof code === 'number' && code >= 100 && code < 600) {
    this.statusCode = code
  } else {
    content = code
    this.statusCode = 200
  }

  if (typeof content === 'object') {
    if (!this.getHeader('Content-Type')) {
      this.setHeader('Content-Type', 'application/json')
    }
    content = JSON.stringify(content, null, 2)
  }
  if (typeof content !== 'string') {
    content = ''
  }
  this.charset = this.charset || 'utf-8';
  if (!this.getHeader('Content-Type')) {
    this.setHeader('Content-Type', 'text/plain')
  }
  this.setHeader('Content-Length', Buffer.byteLength(content))
  this.end(content)
}

// overridable extension points:
module.exports.quiet = true
module.exports.verbose = false
module.exports.logError = console.error.bind(console)