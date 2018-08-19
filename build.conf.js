const path = require('path');
//const gulp = require('gulp');

module.exports = {
    srcPath: path.resolve(__dirname, './__src'),
    buildPath: path.resolve(__dirname, './build'),
    env: require('process').env.NODE_ENV || 'dev',
    autoprefixer: {
        browsers: 'defaults',
    }
}