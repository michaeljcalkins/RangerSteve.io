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
    watchify = require('watchify'),
    argv = require('yargs').argv

const isProduction = argv.production || false

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
        .pipe(notify({message: 'SCSS Complete.'}))
});

gulp.task('buildjs', function() {
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
            plugins: ["transform-object-rest-spread"]
        })
        .transform("browserify-shim", {
            global: true,
            ignore: /\/node_modules\//,
            extensions: [".js"]
        })

    var rebundle = function() {
        var startDate = new Date();
        console.log('Update start at ' + startDate.toLocaleString());
        return bundler.bundle()
            .on('error', handleError)
            .pipe(source('app.js'))
            .pipe(gulpif(isProduction, streamify(uglify({ mangle: false }))))
            // .pipe(gulpif(isProduction, streamify(obfuscator())))
            .pipe(gulp.dest(DIST + 'js'))
            .pipe(notify({ message: 'JS Compiled!' }))
            .on('end', function() {
                if (isProduction) process.exit()
            })
    }

    bundler.on('update', rebundle)

    return rebundle()
})

gulp.task('build', ['buildcss', 'buildjs'])

gulp.task('default', ['build'], function() {
    gulp.watch([
        SRC + 'sass/**/*.scss'
    ], ['buildcss'])
})
