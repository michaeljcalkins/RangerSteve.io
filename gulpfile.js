'use strict'

var gulp = require('gulp')
var sourcemaps = require('gulp-sourcemaps')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var browserify = require('browserify')
var babel = require('babelify')
var sass = require('gulp-sass')
var notify = require("gulp-notify")

var sassOpts = {
    outputStyle: 'compressed',
    errLogToConsole: true
}

gulp.task('sass', function() {
    return gulp.src('assets/sass/**/*.scss')
        .pipe(sass(sassOpts))
        .pipe(gulp.dest('public/stylesheets'))
        .pipe(notify("Sass compiled!"))
})

gulp.task('js', function() {
    return browserify('./assets/js/app.js', { debug: true })
        .transform(babel)
        .bundle()
        .on('error', function(err) { console.error(err); this.emit('end'); })
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./public/javascripts'))
        .pipe(notify("JS compiled!"))
})

gulp.task('build', ['js', 'sass'])

gulp.task('default', ['js', 'sass'], function() {
    gulp
        .watch('assets/sass/**/*.scss', ['sass'])
        .on('change', function(e) {
            console.log(`File ${e.path} was ${e.type}, running Sass task...`); // Template strings and interpolation!!
        })

     gulp
        .watch('assets/js/**/*.js', ['js'])
        .on('change', function(e) {
            console.log(`File ${e.path} was ${e.type}, running JS task...`); // Template strings and interpolation!!
        })
 })
