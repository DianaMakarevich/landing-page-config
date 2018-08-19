'use strict';

const path = require('path');
const env = require('process').env.NODE_ENV || 'dev';
const browsersync = require('browser-sync').create();

//gulp
const gulp = require('gulp');
const $ = require('gulp-load-plugins')({
  rename: {
    'gulp-sass-vars': 'sassVars',
  }
});
const autoprefixer = require('autoprefixer');
const sassVars = require('./src/common.blocks/vars');
const copy = require('./tasks/copy');
const config = require('./build.conf.js');
//webpack
const webpack = require('webpack');
const plugins = [];
const webpackStream = require('webpack-stream');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const DefinePlugin = webpack.DefinePlugin;



const paths = {
  dev: {
    sass: path.resolve(__dirname, 'src/sass'),
    pug: path.resolve(__dirname, 'src/pages/'),
    images: path.resolve(__dirname, 'src/images'),
    js: path.resolve(__dirname, 'src/scripts'),
    video: path.resolve(__dirname, 'src/videos')
  },
  prod: {
    css: path.resolve(__dirname, 'build/css'),
    html: path.resolve(__dirname, 'build'),
    images: path.resolve(__dirname, 'build/images'),
    js: path.resolve(__dirname, 'build/scripts'),
    video: path.resolve(__dirname, 'build/videos')
  }
};
console.log($);
function onError(error) {
  return error;
}

/*
 * SASS TASK
 * Use DoCSSa http://mlarcher.github.io/docssa/
 * Entry point /src/sass/custom.scss 
 */

gulp.task('sass', function() {
  return gulp
    .src([
        `${paths.dev.sass}/custom.scss`,
        './src/common.blocks/**/*.scss',
    ])
    .pipe($.sourcemaps.init())
    .pipe(
      $.plumber({
        errorHandler: $.notify.onError(onError)
      })
    )
    .pipe($.sassVars(sassVars, true))
    .pipe(
      $.sass({
        includePaths: path.resolve(__dirname, './node_modules')
      })
    )
    .pipe($.postcss([autoprefixer()]))
    .pipe($.concat('styles.css'))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(paths.prod.css))
    .pipe(browsersync.stream());
});

/*
 * GULP TASK
 */

gulp.task('pug', function() {
  return gulp
    .src(`${paths.dev.pug}/**/*.pug`)
    .pipe(
      $.plumber({
        errorHandler: $.notify.onError(onError)
      })
    )
    .pipe(
      $.pug({
        pretty: true,
        locals: {
          PATH_TO_RESOURCE:
            env === 'dev' ? './' : '/wp-content/themes/vrp/'
        }
      })
    )
    .pipe(gulp.dest(paths.prod.html))
    .pipe(browsersync.stream());
});

/*
 * BROWSER-SYNC TASK
 */

gulp.task('browser-sync', function() {
  browsersync.init({
    server: {
      baseDir: './build'
    }
  });
});

/*
 *   Copy videos to build folder
 */
gulp.task('video', () => {
  return copy({
      src: `${paths.dev.video}/*.{mp4,mov}`,
      dst: `${paths.prod.video}/`,
  });
});

/*
 * IMAGES TASK
 */

gulp.task('images', function() {
  return gulp
    .src(`${paths.dev.images}/**/*.{jpg,png,svg}`)
    .pipe(gulp.dest(paths.prod.images))
    .pipe(browsersync.stream());
});

/*
* JS TASK
*/

if (env == 'prod') plugins.push(new UglifyJSPlugin());

plugins.push(
  new DefinePlugin({
    PATH_TO_RESOURCE:
      env === 'dev'
        ? JSON.stringify('./')
        : JSON.stringify('/wp-content/themes/vrp/')
  })
);


gulp.task('js', function() {
  return gulp
    .src(`${paths.dev.js}/index.js`)
    .pipe($.plumber())
    .pipe(
      webpackStream(
        {
          output: {
            filename: 'index.js'
          },
          module: {
            loaders: [
              {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader',
              },
              {
                  test: /\.handlebars$/,
                  use: 'handlebars-loader',
              },
            ]
          },
          devtool: 'source-map',
          plugins
        },
        webpack
      )
    )
    .pipe(gulp.dest(`${paths.prod.js}`));
});

gulp.task('fonts', function() {
  return gulp
    .src('./src/fonts/**/*.{eot,svg,ttf,woff,woff2}')
    .pipe(gulp.dest('./build/fonts/'));
});

function watch() {
  gulp.watch('./src/**/*.scss', gulp.series('sass'));
  gulp.watch('./src/**/*.pug', gulp.series('pug'));
  gulp.watch('./src/**/*.{jpg,png,svg}', gulp.series('images'));
  gulp.watch('./src/**/*.{js,handlebars}', gulp.series('js'));
  gulp.watch('./src/fonts/**/*.{eot,svg,ttf,woff,woff2}', gulp.series('fonts'));
}

gulp.task(
  'default',
  gulp.series(
    'sass',
    'pug',
    'images',
    'js',
    'fonts',
    'video',
    gulp.parallel('browser-sync', watch)
  )
);
