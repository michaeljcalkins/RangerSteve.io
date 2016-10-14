// ****************************************************
// Gulp Requires
// ****************************************************

var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    browserify = require('browserify'),
    cleanCSS = require('gulp-clean-css'),
    gulpif = require('gulp-if'),
    gutil = require('gulp-util'),
    notify = require('gulp-notify'),
    sass = require('gulp-sass'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    streamify = require('gulp-streamify'),
    obfuscator = require('gulp-js-obfuscator'),
    uglify = require('gulp-uglify'),
    watchify = require('watchify')

const config = {
    env: process.env.NODE_ENV || 'production'
}
const isProduction = config.env === 'production'

// ****************************************************
// Directory Variables
// ****************************************************
var SRC = 'resources/assets/',
    DIST = 'public/';

var handleError = function (err) {
    console.error(err.message);
    notify({message: err.message});
    gutil.beep();
    this.emit('end');
};

// ****************************************************
// CSS Tasks
// ****************************************************
gulp.task('buildcss', function () {
    return gulp.src(SRC + 'sass/app.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            // sourcemap: true,
            // debugInfo: true,
            // lineNumbers: true,
            includePaths: [
                SRC + 'sass/'
            ]
        }))
        .on('error', handleError)
        .pipe(autoprefixer('last 3 version'))
        .pipe(cleanCSS({ debug: true }, function(details) {
            console.log(details.name + ': ' + details.stats.originalSize)
            console.log(details.name + ': ' + details.stats.minifiedSize)
        }))
        .pipe(sourcemaps.write('/', {
            includeContent: false,
            sourceMappingURLPrefix: '/css'
        }))
        .pipe(gulp.dest(DIST + '/css'))
        .on('end', function() {
            console.log('CSS Compiled!')
        })
});

gulp.task('buildjs', function() {
    browserify({
        entries: SRC + 'js/app.js',
        debug: !isProduction
    })
        .transform("babelify", {
            global: true,
            ignore: /\/node_modules\//,
            extensions: [".js"],
            presets: ["es2015", "react"],
            plugins: ["transform-object-rest-spread", "transform-class-properties"]
        })
        .transform("browserify-shim", {
            global: true,
            ignore: /\/node_modules\//,
            extensions: [".js"]
        })
        .bundle()
        .on('error', handleError)
        .pipe(source('app.js'))
        .pipe(gulpif(isProduction, streamify(uglify({ mangle: false }))))
        .pipe(gulpif(isProduction, streamify(obfuscator())))
        .pipe(gulp.dest(DIST + 'js'))
        .on('end', function() {
            console.log('JS Compiled!')
        })
})

gulp.task('watchjs', function() {
    var customOpts = {
        debug: true,
        entries: SRC + 'js/app.js',
        plugin: [watchify]
    }

    var opts = Object.assign({}, watchify.args, customOpts)
    var bundler = browserify(opts)
        .transform("babelify", {
            global: true,
            ignore: /\/node_modules\//,
            extensions: [".js"],
            presets: ["es2015", "react"],
            plugins: ["transform-object-rest-spread", "transform-class-properties"]
        })
        .transform("browserify-shim", {
            global: true,
            ignore: /\/node_modules\//,
            extensions: [".js"]
        })

    var rebundle = function() {
        return bundler.bundle()
            .on('error', handleError)
            .pipe(source('app.js'))
            .pipe(gulp.dest(DIST + 'js'))
            .on('end', function() {
                console.log('JS Compiled!')
            })
    }

    bundler.on('update', rebundle)

    return rebundle()
})

gulp.task('build', ['buildcss', 'buildjs'])

gulp.task('default', ['buildcss', 'watchjs'], function() {
    gulp.watch([
        SRC + 'sass/**/*.scss'
    ], ['buildcss'])
})
