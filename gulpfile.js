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

let RootFolderName = 'app';
let RootFolderPath = './' + RootFolderName;

let jsSrc = [
  RootFolderName+ '/js/main.js',
];

function style() {
  return (
      gulp
          .src(RootFolderName + '/scss/style.scss')
          .pipe(sourcemaps.init())
          .pipe(sass())
          .on("error", sass.logError)
          .pipe(sourcemaps.write())
          .pipe(gulp.dest(RootFolderName + "/css"))
          .pipe(browserSync.stream())
  );
}

function reload(cb) {
  browserSync.reload();
  cb();
}

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

function minifyHTML(cb) {
  gulp
      .src(RootFolderName+ '/*.html')
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(gulp.dest('dist'))
  cb()
}

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

function concatCss(cb) {
  gulp
      .src(RootFolderName + '/css/*.css')
      .pipe(gp_concat("style.css"))
      .pipe(gulp.dest('dist/css/'))
  cb()
}

// Optimize Images
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

function moveFont() {
  return gulp.src(RootFolderName+ '/fonts/**/*')
      .pipe(gulp.dest('dist/fonts'));
}

function clean() {
  return del(['dist/']);
}

exports.unglifyJs = unglifyJs;
exports.concatCss = concatCss;
exports.images = images;
exports.minifyHTML = minifyHTML;
exports.moveFont = moveFont;
exports.clean = clean;
exports.style = style;

const build = gulp.series(clean, gulp.parallel(minifyHTML, concatCss, unglifyJs, moveFont, images));

exports.watch = watch;
exports.build = build;
