'use strict'

var gulp = require('gulp')
var sourcemaps = require('gulp-sourcemaps')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var browserify = require('browserify')
var babel = require('babelify')
var sass = require('gulp-sass')
var notify = require("gulp-notify")
var uglify = require('gulp-uglify')
var streamify = require('gulp-streamify')
var minifycss = require('gulp-minify-css')
var autoprefixer = require('gulp-autoprefixer')
var jsObfuscator = require('gulp-js-obfuscator')

var handleError = function (err) {
    console.error(err.message);
    notify({message: err.message});
    this.emit('end');
};

gulp.task('sass', function() {
    return gulp.src('assets/sass/app.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            sourcemap: true,
            debugInfo: true,
            lineNumbers: true,
        }))
        .pipe(autoprefixer('last 3 version'))
        .pipe(minifycss())
        .pipe(sourcemaps.write('/', {
            includeContent: false,
            sourceMappingURLPrefix: '/css'
        }))
        .pipe(gulp.dest('public/stylesheets'))
        .pipe(notify("Sass compiled!"))
})

gulp.task('js', function() {
    return browserify({
            entries: ['./assets/js/app.js'],
            debug: true
        })
        .transform("babelify", {
            global: true,
            extensions: [".js"],
            presets: ["es2015"]
        })
        .bundle()
        .on('error', handleError)
        .pipe(source('app.js'))
        // .pipe(streamify(uglify()))
        // .pipe(streamify(jsObfuscator()))
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
