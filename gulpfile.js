'use strict';

const gulp = require('gulp');
const insert = require('gulp-insert');
const fs = require('fs');

const remap = fs.readFileSync('src/common/src/cordova-remap.js', 'utf-8');

function webpackTask(config) {
  return function (cb) {
    const exec = require('child_process').exec;
    exec(__dirname + '/node_modules/.bin/webpack --config ' + config, (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      cb(error);
    });
  };
}

const prepack = webpackTask('webpack.prepack.config.js');
const webpackCordova = webpackTask('webpack.cordova.config.js');
const distTask = webpackTask('webpack.library.config.js');

function remapTask() {
  return gulp.src(['dist/plugin.min.js', 'dist/www.min.js'])
    .pipe(insert.prepend(remap))
    .pipe(gulp.dest('dist'));
}

function pluginTask() {
  return gulp.src(['dist/plugin.min.js'])
    .pipe(gulp.dest('src/browser'));
}

function wwwTask() {
  return gulp.src(['dist/www.min.js'])
    .pipe(gulp.dest('www'));
}

// Compose tasks using gulp.series for sequential execution
gulp.task('prepack', prepack);
gulp.task('webpack-cordova', gulp.series('prepack', webpackCordova));
gulp.task('dist', gulp.series('prepack', distTask));
gulp.task('remap', gulp.series('webpack-cordova', remapTask));
gulp.task('plugin', gulp.series('remap', pluginTask));
gulp.task('www', gulp.series('remap', wwwTask));
gulp.task('default', gulp.series('dist', 'plugin', 'www'));
