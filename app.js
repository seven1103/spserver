require('./config.js');
require('./models/mongo_conn.js')
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var swig = require('swig');
var mongoose  = require('mongoose');
var Cookies = require('cookies');
var multer = require('multer');
var fs = require('fs');

var index = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');

var app = express(); 

//----------------------------------------------------------------//
function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
      month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
  }
  var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
  return currentdate.toString();
}
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      // cb(null, './uploads/'+getNowFormatDate());
      let avatarPath = path.join(__dirname,`uploads/${getNowFormatDate()}`);
      if (!fs.existsSync(avatarPath)) {
        fs.mkdirSync(avatarPath);
      }
      cb(null, avatarPath)
  },//指定硬盘空间的路径，这里可以是任意一个绝对路径，这里为了方便所以写了个相对路径
  filename: function (req, file, cb) {
      cb(null, file.originalname);//指定文件名和扩展名
  }
});//设置用硬盘的存储方法
var upload = multer({ storage: storage });//表示用硬盘的存储方法
//----------------------------------------------------------------//
// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// var uploads = multer({ dest: 'uploads/' })
app.use(upload.any());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// 设置静态资源目录
app.use('/public',express.static(__dirname+'/public'));

// swig.init({ filters: require('./public/js/filters') });
let filters = require('./public/js/filters')
Object.keys(filters).forEach(key => {
  swig.setFilter(key,filters[key])
})

app.engine('html',swig.renderFile);
app.set('views','./views');
app.set('view engine','html');
// 取消模板缓存
swig.setDefaults({cache:false});

//处理res.send在then()返回后继续执行后处理
global.SRETURN = function(a){
  if(a===undefined)return true;
  else return false;
}
// 对cookies进行设置
app.use(function (req,res,next) {
  if(req.baseUrl=='/admin'){
    req.cookies = new Cookies(req,res);
    // 解析登录用户的cookie信息
    // 1.保存用户登录信息的对象
    req.userInfo = {};
    if(req.cookies.get('userInfo')){
      // req.userInfo = JSON.parse(req.cookies.get('userInfo'));
      let info = req.cookies.get('userInfo');
      req.userInfo = JSON.parse(new Buffer(info, 'base64').toString());
      next()
    }else{
      if(req.url.indexOf('/admin/login')>=0){
        next();
      }else if(req.method=='POST'){
        next()
      }else{
        res.redirect('/admin/login');
      }
    }
  }else{
    next();
  }
});

app.use('/', index);
app.use('/users', users);
app.use('/admin', admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
