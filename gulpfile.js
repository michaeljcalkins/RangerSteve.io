var gulp = require('gulp'),
    elixir = require('laravel-elixir'),
    jsObfuscator = require('gulp-js-obfuscator'),
    streamify = require('gulp-streamify')

require('laravel-elixir-vueify')

elixir.extend('obfuscate', function() {
    new elixir.Task('obfuscate', function() {
        return gulp.src('public/js/app.js')
            .pipe(streamify(jsObfuscator()))
            .pipe(gulp.dest('public/js'))
    })
})

elixir(function(mix) {
    if (! elixir.config.production) {
        return mix
            .sass('app.scss')
            .browserify('app.js')
    }

    mix
        .sass('app.scss')
        .browserify('app.js')
        .obfuscate()
})
