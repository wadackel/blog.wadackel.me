const cp = require("child_process");
const del = require("del");
const gulp = require("gulp");
const runSequence = require("run-sequence").use(gulp);
const $ = require("gulp-load-plugins")();
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');


gulp.task("clean", done => (
  del(["./public/"], done)
));


gulp.task("postcss", () => (
  gulp.src('./src/css/style.css')
    .pipe($.plumber())
    .pipe($.postcss())
    .pipe(gulp.dest('./static/css/'))
));

gulp.task("postcss:watch", () => (
  $.watch('./src/css/**/*.css', () => {
    gulp.start('postcss');
  })
));


gulp.task("webpack", (done) => {
  webpack(webpackConfig, (err, stats) => {
    if (err) throw new Error($.util.PluginError('webpack', err));
    console.log(stats.toString({ colors: true })); // eslint-disable-line
    done();
  });
});

gulp.task("webpack:watch", (done) => {
  webpack(webpackConfig).watch({}, (err, stats) => {
    if (err) throw new Error($.util.PluginError('webpack', err));
    console.log(stats.toString({ colors: true })); // eslint-disable-line
  });

  done();
});


gulp.task("hugo:build", done => (
  cp.spawn("hugo", [], { stdio: "inherit" }).on("close", done)
));

gulp.task("hugo:watch", done => (
  cp.spawn("hugo", ["server", "--renderToDisk", "--port=8080", "-D", "-w"], {stdio: "inherit"}).on("close", done)
));


gulp.task("build", done => (
  runSequence(
    "clean",
    "hugo:build",
    ["postcss", "webpack"],
    done
  )
));


gulp.task("watch", ["webpack:watch", "postcss:watch", "hugo:watch"]);
gulp.task("start", ["watch"]);
