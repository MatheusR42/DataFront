'use strict';

// Requires:
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var smushit = require('gulp-smushit');
var gulpforeach = require('gulp-foreach');
var gulpsass = require('gulp-sass');
var cssmin = require('gulp-cssmin');
var gulprename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglifyjs');
var plumber = require('gulp-plumber');
var spritesmith = require('gulp.spritesmith-multi')
var babel = require('gulp-babel');
var merge = require('merge-stream');

// Variables
// Config:
var project = "datafront_";
/*

Created files in docs/dist/
---------------------------

- project.default.app.min.css
- project.default.vendor.min.css
- project.default.app.min.js
- project.default.vendor.min.js
- project.default.components.min.js

*/

var config = {
    paths: {
        html: './1-templates/',
        css: './assets/css/',
        cssSprites: './assets/css/sprites/',
        sass: './assets/sass/',
        images: './assets/images/',
        sprites: './assets/sprites/',
        vendor: './assets/vendor/',
        components: './assets/components/',
        fonts: './assets/fonts/',
        js: './assets/js/',
        jsbuild: './docs/dist/',
        cssbuild: './docs/dist/',
        libsbuild: './docs/dist/',
        imagesbuild: './docs/dist/',
        fontsbuild: './docs/dist/'
    }
};

var taskImportModules = function () {

    var orderSymbols = ['I.   ', 'II.  ', 'III. ', 'IV.  ', 'V.   ', 'VI.   '];
    var fileTypeOrder = ['noGroup', 'pattern', 'generic', 'region', 'module', 'theme'];
    var fileTypeNames = {
        'pattern': 'Pattern',
        'generic': 'Generic',
        'region': 'Regions',
        'module': 'Modules',
        'theme': 'Themes'
    };
    var files = {};

    var task = gulp.src([config.paths.sass + '_*.scss', '!' + config.paths.sass + 'load.scss']);

    task.pipe(gulpforeach(function (stream, file) {

        var fileName = path.basename(file.path);
        var fileType = fileName.match(/^_(.+?)\./)[1];
        var isNoGroup = fileType && fileTypeOrder.indexOf(fileType) >= 0;

        if (isNoGroup) {

            if (!(fileType in files)) {
                files[fileType] = [];
            };

            files[fileType].push(fileName);

        } else {

            if (!('noGroup' in files)) {
                files.noGroup = [];
            };

            files.noGroup.push(fileName);

        };

        return stream;

    }));

    task.on('end', function () {

        var groups = [];

        for (var i = 0; i < fileTypeOrder.length; i++) {

            var header = '';
            var filesGroup = [];

            if (fileTypeOrder[i] !== 'noGroup') {
                header = '/* -------------------------------------------------------- */';
                header += '\n';
                header += '/* ' + orderSymbols.splice(0, 1) + fileTypeNames[fileTypeOrder[i]];
                header += '\n';
                header += '/* -------------------------------------------------------- */';
                header += '\n';
            };

            if (files[fileTypeOrder[i]]) {
                if (fileTypeOrder[i] === 'generic') {
                    files[fileTypeOrder[i]].sort(function (a, b) {

                        if (a === '_generic.reset.css') {
                            return -1;
                        };

                        if (b === '_generic.reset.css') {
                            return 1;
                        };

                        return a - b;

                    });
                };

                for (var j = 0; j < files[fileTypeOrder[i]].length; j++) {
                    filesGroup.push('@import \'' + files[fileTypeOrder[i]][j] + '\';');
                };

                groups.push(header + filesGroup.join('\n\n'));

            };
        };

        fs.writeFileSync(config.paths.sass + '/load.scss', groups.join('\n\n') + '\n');

    });

    return task;

}

var taskImportModulesToSCSS = function () {

    var task = gulp.src(config.paths.sass + 'load.scss');
    task = task.pipe(plumber(function (error) {
        console.log(error.message);
        this.emit('end');
    }));

    task = task.pipe(gulpsass({
        outputStyle: 'expanded'
    }));

    task = task.pipe(cssmin());
    task = task.pipe(gulprename('sass.min.css'));
    task = task.pipe(gulp.dest(config.paths.css));

    return task;

};

var taskImportModulesToFonts = function () {

    var task = gulp.src([config.paths.fonts + '*.ttf', config.paths.fonts + '*.eot', config.paths.fonts + '*.svg', config.paths.fonts + '*.woff', config.paths.fonts + '*.woff2']);

    task = task.pipe(plumber(function (error) {
        console.log(error.message);
        this.emit('end');
    }));


    task = task.pipe(gulprename(function (path) {
        path.basename = project + path.basename + path.extname;
        path.extname = ".css"
    }));

    task = task.pipe(gulp.dest(config.paths.fontsbuild));

    return task;

};

var taskImportCssSprite = function () {

    var files = [config.paths.cssSprites + '*.css'];

    var task = gulp.src(files);
    task = task.pipe(plumber(function (error) {
        console.log(error.message);
        this.emit('end');
    }));

    task = task.pipe(concat(project + 'sprites.min.css'));
    task = task.pipe(cssmin());
    task = task.pipe(gulp.dest(config.paths.cssbuild));

    return task;

};

var taskImportModulesToCSS = function () {

    var files = [config.paths.css + '*.css'];

    var task = gulp.src(files);
    task = task.pipe(plumber(function (error) {
        console.log(error.message);
        this.emit('end');
    }));

    // task = task.pipe(gulpsass({
    //     outputStyle: 'expanded'
    // }));

    task = task.pipe(cssmin());
    task = task.pipe(concat(project + 'app.min.css'));
    task = task.pipe(gulp.dest(config.paths.cssbuild));

    return task;

};

var taskImportModulesToCSSVendor = function () {

    var files = [config.paths.vendor + '*.css'];

    var task = gulp.src(files);
    task = task.pipe(plumber(function (error) {
        console.log(error.message);
        this.emit('end');
    }));

    // task = task.pipe(gulpsass({
    //     outputStyle: 'expanded'
    // }));

    task = task.pipe(cssmin());
    task = task.pipe(concat(project + 'vendor.min.css'));
    task = task.pipe(gulp.dest(config.paths.cssbuild));

    return task;

};

var taskImportModulesToScripts = function () {

    var files = [config.paths.js + '*.js'];

    var task = gulp.src(files);
    task = task.pipe(plumber(function (error) {
        console.log(error.message);
        this.emit('end');
    }));

    task = task.pipe(babel({
        presets: ['es2015']
    }));

    task = task.pipe(uglify(project + 'app.min.js'))
    task = task.pipe(concat(project + 'app.min.js'));
    task = task.pipe(gulp.dest(config.paths.jsbuild));

    return task;

};

var taskImportModulesToScriptsComponents = function () {

    var files = [config.paths.components + '*.js'];

    var task = gulp.src(files);

    task = task.pipe(plumber(function (error) {
        console.log(error.message);
        this.emit('end');
    }));

    task = task.pipe(babel({
        presets: ['es2015']
    }));

    task = task.pipe(uglify(project + 'components.min.js'))
    task = task.pipe(concat(project + 'components.min.js'));
    task = task.pipe(gulp.dest(config.paths.jsbuild));

    return task;

};

var taskImportModulesToScriptsVendor = function () {

    var files = [config.paths.vendor + '*.js'];

    var task = gulp.src(files);

    task = task.pipe(plumber(function (error) {
        console.log(error.message);
        this.emit('end');
    }));

    // task = task.pipe(babel({
    //     presets: ['es2015']
    // })); 

    task = task.pipe(uglify(project + 'vendor.min.js'));
    task = task.pipe(concat(project + 'vendor.min.js'));
    task = task.pipe(gulp.dest(config.paths.jsbuild));

    return task;

};

var taskImportModulesToImages = function (cb) {

    var task = gulp.src([config.paths.images + '*.jpg', config.paths.images + '*.png', config.paths.images + '*.gif', config.paths.images + '*.ico', config.paths.images + '*.svg']);

    task = task.pipe(plumber(function (error) {
        console.log(error.message);
        this.emit('end');
    }));

    task = task.pipe(smushit({
        verbose: true
    }));

    task = task.pipe(gulp.dest(config.paths.imagesbuild));

    return task;

};

var taskImportSprite = function () {
    var task = gulp.src(config.paths.sprites + '**/*.*');

    task = task.pipe(plumber(function (error) {
        console.log(error.message);
        this.emit('end');
    }));

    task = task.pipe(spritesmith({
        spritesmith: function (options, sprite) {
            options.cssName = 'sprite-' + sprite + '.css';
            options.imgName = 'sprite-' + sprite + '.png';
            // options.imgPath = '/dist/sprite- ' + sprite + '.png';
            // options.imgPath = config.imagesbuild;
        }
    }));

    var imgStream = task.img.pipe(gulp.dest(config.paths.imagesbuild));
    var cssStream = task.css.pipe(gulp.dest(config.paths.cssSprites));

    return merge(imgStream, cssStream);

};

var taskImportModulesToWatch = function () {

    gulp.watch(config.paths.js + '*.js', ['js:concat']);
    gulp.watch(config.paths.components + '*.js', ['js:components']);
    gulp.watch(config.paths.vendor + '*.js', ['js:vendor']);
    gulp.watch(config.paths.vendor + '*.css', ['sass:vendor']);
    gulp.watch(config.paths.css + '*.css', ['sass:styles']);
    gulp.watch(config.paths.sass + '*.scss', ['sass:css']);

    return null;

};

// Sass tools
// --------------------------------------------------------------------------

gulp.task('sass:import-modules', taskImportModules);
gulp.task('sass:css', taskImportModulesToSCSS);
gulp.task('sass:styles', taskImportModulesToCSS);
gulp.task('sass:vendor', taskImportModulesToCSSVendor);

gulp.task('sass', ['sass:import-modules', 'sass:css', 'sass:vendor', 'sass:styles']);

// Javascripts tools
// --------------------------------------------------------------------------

gulp.task('js:concat', taskImportModulesToScripts);
gulp.task('js:vendor', taskImportModulesToScriptsVendor);
gulp.task('js:components', taskImportModulesToScriptsComponents);

gulp.task('js', ['js:concat', 'js:vendor', 'js:components']); // ['js:hint', 'js:concat']

// Images tools
// --------------------------------------------------------------------------

gulp.task('img:sprite', taskImportSprite);
gulp.task('img:optimization', ['img:sprite'], taskImportModulesToImages);
gulp.task('sprite', ['img:optimization'], taskImportCssSprite);

// Watch
// --------------------------------------------------------------------------

gulp.task('watch', taskImportModulesToWatch);

// Default Task
// --------------------------------------------------------------------------

gulp.task('default', ['sass', 'js', 'watch']);