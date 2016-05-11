'use strict'

if (process.env.NODE_ENV === 'production') {
    require ('newrelic')
}

let express = require('express')
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
let locals = require('./app/middleware/locals')

let app = express()
let io = socketIo()
app.io = io
SocketHandler(io)


let poet = require('poet')(app, {
    posts: 'resources/posts'
})
poet.init().then(function () {
    // Ready to go!
})

app.set('views', path.join(__dirname, 'resources/views'))
app.set('view engine', 'nunjucks');

nunjucks.setup({
    autoescape: true,
    throwOnUndefined: false,
    trimBlocks: false,
    lstripBlocks: false,
    watch: true,
    noCache: true
}, app)

app.use(favicon(path.join(__dirname, 'public', 'images/favicon.ico')));
app.use(locals)
app.use(compression())
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: 86400000 // One day
}));

app.use('/', routes)

poet.addRoute('/blog', function (req, res) {
  var posts = poet.helpers.getPosts(req.params.post);
  if (posts) {
    res.render('blog', { posts: posts });
  } else {
    res.send(404);
  }
});

poet.addRoute('/blog/:post', function (req, res) {
  var post = poet.helpers.getPost(req.params.post);
  if (post) {
    res.render('post', { post: post });
  } else {
    res.send(404);
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found')
    err.status = 404
    next(err)
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res) {
        res.status(err.status || 500)
        res.render('error', {
            message: err.message,
            error: err
        })
    })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    })
})

module.exports = app
