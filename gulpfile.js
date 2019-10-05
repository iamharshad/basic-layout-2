/*
* Author: Harshad Prajapati
* Gist url : https://gist.github.com/iamharshad/0df647619e7e1ba0045bed0fe4dc2213
* Description: Gulpfile.js for browser reloading and sass compiling, automation for compress/uglify html, css, and js
*/

// import required gulp plugin 
const gulp = require("gulp"),
    sass = require("gulp-sass"),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    cssnano = require("cssnano"),
    sourcemaps = require("gulp-sourcemaps"),
    browserSync = require("browser-sync").create(),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify'),
    newer = require('gulp-newer'),
    imagemin = require('gulp-imagemin'),
    htmlmin = require('gulp-htmlmin'),
    del = require('del'),
    plumber = require("gulp-plumber");

// define folder name
let RootFolderName = 'app';
let RootFolderPath = './' + RootFolderName;


// source of javascript used in project
let jsSrc = [
  RootFolderName+ '/js/main.js',
];


// function for complie scss and autoprefixer
function style() {
  return (
      gulp
          .src(RootFolderName + '/scss/style.scss')
          .pipe(sourcemaps.init())
          .pipe(sass())
          .on("error", sass.logError)
          .pipe(postcss([ autoprefixer({ browsers: ["> 0%"] }) ]))
          .pipe(sourcemaps.write('.'))
          .pipe(gulp.dest(RootFolderName + "/css"))
          .pipe(browserSync.stream())
  );
}

// function for reaload browser
function reload(cb) {
  browserSync.reload();
  cb();
}

// function for watch changes of file for html, css and javascript
function watch() {
  browserSync.init({
    server: {
      baseDir: RootFolderPath
    }
  });
  gulp.watch(RootFolderName + '/scss/*.scss', style);
  gulp.watch(RootFolderName + '/*.html', reload);
  gulp.watch(RootFolderName + '/js/*.js', reload);
}

// function for minify html
function minifyHTML(cb) {
  gulp
      .src(RootFolderName+ '/*.html')
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(gulp.dest('dist'))
  cb()
}


// function for uglify js
function unglifyJs(cb) {
  gulp
      .src(jsSrc)
      .pipe(plumber())
      .pipe(gp_concat('concat.js'))
      .pipe(gulp.dest(RootFolderName+ '/js/'))
      .pipe(gp_rename('main.js'))
      .pipe(gp_uglify())
      .pipe(gulp.dest('dist/js'))
  cb()
}

// function for concat css
function concatCss(cb) {
  gulp
      .src(RootFolderName + '/css/*.css')
      .pipe(gp_concat("style.css"))
      .pipe(gulp.dest('dist/css/'))
  cb()
}

// function for optimize Images
function images() {
  return gulp
      .src(RootFolderName+"/images/**/*")
      .pipe(newer("./dist/img/"))
      .pipe(
          imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
              plugins: [
                {
                  removeViewBox: false,
                  collapseGroups: true
                }
              ]
            })
          ])
      )
      .pipe(gulp.dest("dist/img/"));
}

// function for movefont
function moveFont() {
  return gulp.src(RootFolderName+ '/fonts/**/*')
      .pipe(gulp.dest('dist/fonts'));
}


// function for clean dist folder 
function clean() {
  return del(['dist/']);
}

// export all function 
exports.unglifyJs = unglifyJs;
exports.concatCss = concatCss;
exports.images = images;
exports.minifyHTML = minifyHTML;
exports.moveFont = moveFont;
exports.clean = clean;
exports.style = style;
// series of command for build 
const build = gulp.series(clean, gulp.parallel(minifyHTML, concatCss, unglifyJs, moveFont, images));
exports.watch = watch;
exports.build = build;
