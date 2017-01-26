'use strict'

const express = require('express')
const Primus = require('primus')
const Rooms = require('primus-rooms')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const compression = require('compression')
const nunjucks = require('express-nunjucks')
const SocketHandler = require('./app/sockets')
const routes = require('./app/routes')
const locals = require('./app/middleware/locals')

const app = express()

let primus

app.init = function (server) {
  const options = {
    transformer: 'uws',
    parser: 'binary',
    perMessageDeflate: false
  }
  primus = new Primus(server, options)
  primus.plugin('rooms', Rooms)
  SocketHandler.init(primus)
}

app.set('views', path.join(__dirname, 'resources/views'))
app.set('view engine', 'njk')

nunjucks.setup({
  autoescape: true,
  throwOnUndefined: false,
  trimBlocks: false,
  lstripBlocks: false,
  watch: true,
  noCache: true
}, app)

app.use(favicon(path.join(__dirname, 'public', 'images/favicon.ico')))
app.use(locals)
app.use(compression())
// app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 86400000 // One day
}))

app.use(function (req, res, next) {
  res.io = primus
  next()
})

app.use('/', routes)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error(`Not Found: ${req.originalUrl}`)
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

module.exports = app
