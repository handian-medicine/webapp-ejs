var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// var session = require('express-session');//sessionid

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var prj001Router = require('./routes/prj001');
var prj999Router = require('./routes/prj001');//后续增加项目修改这里
var mobileRouter = require('./routes/mobile');
// var analysisRouter = require('./routes/analysis');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(bodyParser.urlencoded({ extended: true }));//body解析

console.log("app.js: begin");
app.use('/public',express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.use('/users', usersRouter);

app.use('/prj001', prj001Router);

app.use('/prj999', prj999Router);//后续增加项目修改这里

// app.use('/analysis', analysisRouter);

app.use('/mobile', mobileRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
