"use strict";

const cp = require("child_process");
const server = require("browser-sync").create();
const browserify = require("browserify");
const watchify = require("watchify");
const source = require("vinyl-source-stream");
const gulp = require("gulp");
const runSequence = require("run-sequence").use(gulp);
const $ = require("gulp-load-plugins")();
let isBuild = false;


gulp.task("sass", () => {
  return gulp.src("./src/sass/**/*.scss")
    .pipe($.plumber())
    .pipe($.sass().on("error", $.sass.logError))
    .pipe($.autoprefixer())
    .pipe(gulp.dest("./_site/assets/css"))
    .pipe(server.stream());
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
    .pipe(gulp.dest("./assets/js/"))
    .pipe(server.stream());
});


gulp.task("uglify", () => {
  return gulp.src("./assets/js/app.bundle.js")
    .pipe($.uglify({preserveComments: "some"}))
    .pipe(gulp.dest("./assets/js/"));
});


gulp.task("jekyll:build", (cb) => {
  return cp.spawn("jekyll", ["build"], {stdio: "inherit"})
    .on("close", cb);
});


gulp.task("jekyll:rebuild", ["build"], () => {
  server.reload();
});


gulp.task("server", () => {
  server.init({
    server: {
      baseDir: "_site"
    },
    ghostMode: false,
    open: false,
    notify: false
  });
});


gulp.task("watch", () => {
  gulp.watch("./src/sass/**/*.scss", ["sass"]);
  gulp.watch("./src/js/**/*.js", ["browserify"]);
  gulp.watch([
    "./index.html",
    "./*.md",
    "./_config.yml",
    "./_includes/*.html",
    "./_layouts/*.html",
    "./_posts/**/*",
    "./_pages/**/*",
    "./_plugins/**/*",
    "./assets/**/*"
  ], ["jekyll:rebuild"]);
});


gulp.task("build", (cb) => {
  isBuild = true;
  return runSequence(
    "jekyll:build",
    ["sass"],
    cb
  );
});


gulp.task("start", ["server", "watch"]);
gulp.task("default", ["start"]);
