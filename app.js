'use strict'

if (process.env.NODE_ENV === 'production') {
    require ('newrelic')
}

let express = require('express');
let socketIo = require('socket.io')
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser')
let compression = require('compression')
let nunjucks = require('express-nunjucks')
let SocketHandler = require('./app/sockets')
let routes = require('./app/routes')

let app = express()
let io = socketIo()
app.io = io
SocketHandler(io)

app.set('views', path.join(__dirname, 'resources/views'))
app.set('view engine', 'nunjucks');

nunjucks.setup({
    // (default: true) controls if output with dangerous characters are escaped automatically.
    autoescape: true,
    // (default: false) throw errors when outputting a null/undefined value.
    throwOnUndefined: false,
    // (default: false) automatically remove trailing newlines from a block/tag.
    trimBlocks: false,
    // (default: false) automatically remove leading whitespace from a block/tag.
    lstripBlocks: false,
    // (default: false) if true, the system will automatically update templates when they are changed on the filesystem.
    watch: true,
    // (default: false) if true, the system will avoid using a cache and templates will be recompiled every single time.
    noCache: true
}, app)

app.use(favicon(path.join(__dirname, 'public', 'images/favicon.ico')));
app.use(compression())
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: 86400000 // 1d
}));

app.use('/', routes)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
