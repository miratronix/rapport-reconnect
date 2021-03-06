'use strict';

const fs = require('fs');
const browserify = require('browserify');
const duplexify = require('duplexify');
const spawn = require('child_process').spawn;
const uglifyPath = require.resolve('uglify-js/bin/uglifyjs');

const uglify = () => {
    const args = [uglifyPath, '--compress', '--mangle', '-'];
    const proc = spawn(process.execPath, args, { stdio: 'pipe' });
    return duplexify(proc.stdin, proc.stdout);
};

return browserify('./lib/index.js')
    .transform('browserify-shim')
    .transform('babelify', { presets: ['es2015'] })
    .bundle()
    .pipe(uglify())
    .pipe(fs.createWriteStream('./rapport.reconnect.min.js'));
