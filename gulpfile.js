"use stric";

var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var include = require('gulp-html-tag-include');
var htmlmin = require('gulp-html-minifier');
var header = require('gulp-header');
var buffer = require('vinyl-buffer');
var vinylFTP = require('vinyl-ftp');
var del = require('del');
var fs = require('fs');
var bs = require('browser-sync').create();
var reload = bs.reload;

var pkg = JSON.parse(fs.readFileSync('package.json'));

// Task 옵션
var opts = {
	destPath: './dist',
	mapPath: '../maps',

	htmlMin: {
		collapseWhitespace: true,
		removeComments: true
	},

	autoprefixer: {
		browsers: ['> 1%', 'last 2 versions', 'Firefox ESR'],
		cascade: false,
	},

	minRename: {
		suffix: '.min',
	},

	banner: [
		'/*!',
		' * <%= name %> - <%= homepage %>',
		' * Description - <%= description %>',
		' * Version - <%= version %>',
		' * Licensed under the MIT license - http://opensource.org/licenses/MIT',
		' *',
		' * Copyright (c) 2017~<%= new Date().getFullYear() %> <%= author.name %>',
		' */\n\n',
	].join('\n')
};
var errorHandler = function (error) {
	console.error(error.message);
	this.emit('end');
};

var plumberOption = {
	errorHandler: errorHandler
};
gulp.task('server', function() {
	bs.init({
		server: { baseDir: "./", index: "index.html"},
		ghostMode: { clicks: false, scroll: false }
	});
});
gulp.task('plugins', function () {
	return gulp.src('src/js/plugins/*.js')
		.pipe(plumber(plumberOption))
		.pipe(uglify({ mangle: { toplevel: true } })) // 난독화
			.on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
		.pipe(concat('plugins.min.js')) // 병합
		.pipe(gulp.dest(opts.destPath + '/js/libs'))
		.pipe(reload({ stream: true }));
});

gulp.task('js', function(){
 	return gulp.src( 'src/js/ui.js' )
		.pipe( plumber(plumberOption))
		.pipe( sourcemaps.init() )
		.pipe(jshint())
		.pipe( uglify( {mangle:{toplevel:true}} ) ) 
			.on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
		.pipe(rename(opts.minRename))
		.pipe(sourcemaps.write(opts.mapPath + '/js'))
		.pipe(header(opts.banner, pkg))
 		.pipe(gulp.dest( opts.destPath + '/js' ))
 		.pipe( reload({stream: true}) );
});
gulp.task('sass', function(){
 	return gulp.src( 'src/scss/*.scss' )
		.pipe(plumber(plumberOption))
		.pipe(sourcemaps.init())
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(autoprefixer(opts.autoprefixer))
		.pipe(rename(opts.minRename))
		.pipe(sourcemaps.write(opts.mapPath + '/css'))
		.pipe(header(opts.banner, pkg))
		.pipe(gulp.dest(opts.destPath + '/css'))
		.pipe( reload({stream: true}) );
});

gulp.task('html', function(){
	return gulp.src( 'src/html/*.html' )
		.pipe( plumber(plumberOption))
		.pipe(include())
		.pipe(htmlmin(opts.htmlMin))
  	.pipe(gulp.dest( './' ))
  	.pipe( reload({stream: true}) );
});

// FTP 환경설정
var FTPConfig = require('./ftp_config');
var host = FTPConfig.ftp.host;
var user = FTPConfig.ftp.id;
var password = FTPConfig.ftp.pw;

var localFiles = [
	'dist/**/*.*',
	'*.html'
];

var remoteLocation = '/';

function GetFTPConnection() {
	return vinylFTP.create({
		host: host,
		port: 21,
		user: user,
		password: password,
		parallel: 10,
		log: gutil.log
	});
}
gulp.task('deploy', function () {
	var conn = GetFTPConnection();

	return gulp.src(localFiles, { base: '.', buffer: false })
		.pipe(conn.newer(remoteLocation))
		.pipe(conn.dest(remoteLocation))
});


// 파일 변경 감지 및 브라우저 재시작
gulp.task('watch', function() {
	gulp.watch('src/js/plugins/**/*.js', ['plugins'] );
	gulp.watch('src/js/ui.js', ['js'] );
	gulp.watch('src/scss/*.scss', ['sass'] );
	gulp.watch('src/html/*.html' + '/*.html', ['html'] );
	gulp.watch(['*.html', 'dist/**/*.*'], { base: '.', buffer: false }, ['deploy'] );

	gulp.watch('./dist/**/*.*').on('change', reload);
});

// 기본 task 설정
gulp.task('default', [
	'server',
	'html',
	'sass',
	'js',
	'watch'
]);
