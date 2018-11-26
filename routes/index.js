var express = require('express');
var router = express.Router();
var Admin = require('../models/mongo_admin');

//定义一个注册返回的接口
var  responseData;
router.use(function (req,res,next) {
    responseData = {
        code:'',
        message:''
    };
    next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin/index', { nav: 'nav1' });
});

router.get('/login', function(req, res, next) {
  res.render('admin/login', { title: 'Express' });
});

router.post('/adminLogin', function(req, res, next) {
  var username = req.body.username,
    password = req.body.password;
  if(username===''||password===''){
    responseData.code = 1;
    responseData.message='用户名和密码不能为空';
    res.json(responseData);
  }
  Admin.findOne({
    account: username.trim(),
    password: password.trim()
  }).then(userinfo=>{
    if(!userinfo){
      responseData.code = 2;
      responseData.message = '用户名和密码错误';
      res.send(responseData);
    }else{
      responseData.code = 0;
      responseData.message = '用户登录成功';
      responseData.userInfo = userinfo
      res.send(responseData);     
    }
  })
});

router.post('/userLogin', function(req, res, next) {
  
});

//获取用户微信信息
router.get('/getwxinfo',function(req, res, next) {

})
//微信支付
router.get('/wxpay',function(req, res, next) {

})

module.exports = router;
