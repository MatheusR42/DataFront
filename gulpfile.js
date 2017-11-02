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
var eslint = require('gulp-eslint');
var spritesmith = require('gulp.spritesmith-multi')
var babel = require('gulp-babel');
var csslint = require('gulp-csslint');
var sassLint = require('gulp-sass-lint');
var htmlLint = require('gulp-html-lint');
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

var taskImportModulesToCSSLint = function () {

    var task = gulp.src([config.paths.css + '*.css', "!" + config.paths.css + 'sass.min.css']);

    csslint.addFormatter('csslint-stylish');

    task = task.pipe(csslint('csslintrc.json'));
    task = task.pipe(csslint.formatter('stylish'));

    return task;

};

var taskImportModulesToWatchCSSLint = function () {

    gulp.watch([config.paths.css + '*.css', "!" + config.paths.css + 'sass.min.css'], ['csslint']);
    return null;

};

var taskImportModulesToSCSSLint = function () {

    var task = gulp.src([config.paths.sass + '*.scss']);

    csslint.addFormatter('csslint-stylish');

    task = task.pipe(sassLint());
    task = task.pipe(sassLint.format());

    return task;

};

var taskImportModulesToWatchSCSSLint = function () {

    gulp.watch([config.paths.sass + '*.scss'], ['scsslint']);
    return null;

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

var taskImportModulesToESLint = function () {

    /*
    2 = Errors
    1 = Warning
    0 = off
    */

    var task = gulp.src([config.paths.js + '*.js', config.paths.components + '*.js']);
    task = task.pipe(eslint());
    task = task.pipe(eslint.result(function (result) {
        // Called for each ESLint result.
        // http://eslint.org/docs/rules/
        console.log('ESLint result: ' + result.filePath);
        console.log('# Messages: ' + result.messages.length);
        console.log('# Warnings: ' + result.warningCount);
        console.log('# Errors: ' + result.errorCount);

        if (result.errorCount > 0) {
            console.error("------------------------------------------------------------------------------");
            console.error("                          X HÁ UM ERRO NO JS!!!                               ");
            console.error("------------------------------------------------------------------------------");
        }

    }));

    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    task = task.pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    task = task.pipe(eslint.failAfterError());
    return task;

};

var taskImportModulesToWatchEslint = function () {

    gulp.watch([config.paths.js + '*.js', config.paths.components + '*.js'], ['eslint']);
    return null;

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

var taskImportModulesToHTMLLint = function () {

    var task = gulp.src([config.paths.html + '*.html', config.paths.html + '/sub-templates/*.html']);
    task = task.pipe(htmlLint({
        htmllintrc: ".htmllintrc",
        useHtmllintrc: true
    }));

    task = task.pipe(htmlLint.format());
    task = task.pipe(htmlLint.failOnError());

    return task;

};

var taskImportModulesToWatchHTMLLint = function () {

    gulp.watch([config.paths.html + '*.html', config.paths.html + '/sub-templates/*.html'], ['htmllint']);
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

// ESLINT code validation
// --------------------------------------------------------------------------
gulp.task('eslint', taskImportModulesToESLint);
gulp.task('watch-eslint', taskImportModulesToWatchEslint);
gulp.task('csslint', taskImportModulesToCSSLint);
gulp.task('watch-csslint', taskImportModulesToWatchCSSLint);
gulp.task('scsslint', taskImportModulesToSCSSLint);
gulp.task('watch-scsslint', taskImportModulesToWatchSCSSLint);
gulp.task('htmllint', taskImportModulesToHTMLLint);
gulp.task('watch-htmllint', taskImportModulesToWatchHTMLLint);
gulp.task('fonts', taskImportModulesToFonts);

gulp.task('testcode', ['eslint', 'csslint', 'scsslint', 'htmllint']);

// Default Task
// --------------------------------------------------------------------------

gulp.task('default', ['sass', 'js', 'watch']);