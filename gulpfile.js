"use strict";

const cp = require("child_process");
const del = require("del");
const browserify = require("browserify");
const watchify = require("watchify");
const source = require("vinyl-source-stream");
const gulp = require("gulp");
const runSequence = require("run-sequence").use(gulp);
const $ = require("gulp-load-plugins")();
let isBuild = false;


gulp.task("clean", (cb) => {
  return del(["./public/"], cb);
});


gulp.task("sass", () => {
  return gulp.src("./src/sass/**/*.scss")
    .pipe($.plumber())
    .pipe($.sass().on("error", $.sass.logError))
    .pipe($.autoprefixer())
    .pipe(gulp.dest("./public/css"));
});


gulp.task("browserify", () => {
  const plugins = isBuild ? [] : [watchify];

  return browserify({
      entries: ["./src/js/app.js"],
      cache: {},
      packageCache: {},
      plugin: plugins
    })
    .transform("babelify")
    .bundle()
    .on("error", function(err) {
      $.util.log("[browserify]", err.message);
      this.emit("end");
    })
    .pipe(source("app.bundle.js"))
    .pipe(gulp.dest("./public/js/"));
});


gulp.task("uglify", () => {
  return gulp.src("./public/js/app.bundle.js")
    .pipe($.uglify({preserveComments: "some"}))
    .pipe(gulp.dest("./public/js/"));
});


gulp.task("hugo:build", (cb) => {
  return cp.spawn("hugo", [], {stdio: "inherit"}).on("close", cb);
});

gulp.task("hugo:watch", (cb) => {
  return cp.spawn("hugo", ["server", "--renderToDisk", "--port=8080"], {stdio: "inherit"}).on("close", cb);
});


gulp.task("watch", ["hugo:watch"], () => {
  gulp.watch("./src/sass/**/*.scss", ["sass"]);
  gulp.watch("./src/js/**/*.js", ["browserify"]);
});


gulp.task("build", (cb) => {
  isBuild = true;
  return runSequence(
    "clean",
    "hugo:build",
    ["sass", "browserify"],
    cb
  );
});


gulp.task("start", ["watch"]);
gulp.task("default", ["start"]);
