var gulp = require('gulp'),
    elixir = require('laravel-elixir'),
    jsObfuscator = require('gulp-js-obfuscator'),
    streamify = require('gulp-streamify')

require('laravel-elixir-vueify')

elixir.config.assetsPath = 'assets'

elixir.extend('obfuscate', function() {
    new elixir.Task('obfuscate', function() {
        return gulp.src('public/javascripts/app.js')
            .pipe(streamify(jsObfuscator()))
            .pipe(gulp.dest('public/javascripts'))
    })
})

elixir(function(mix) {
    if (! elixir.config.production) {
        return mix
            .sass('assets/sass/app.scss', 'public/stylesheets/app.css')
            .browserify('assets/js/app.js', 'public/javascripts/app.js')
    }

    mix
        .sass('assets/sass/app.scss', 'public/stylesheets/app.css')
        .browserify('assets/js/app.js', 'public/javascripts/app.js')
        .obfuscate()
})
