var express = require('express');
var router = express.Router();
var config = require('../public/js/config');
var request = require('request');
var Activity = require('../models/mongo_goods');
var User = require('../models/mongo_user');
var Order = require('../models/mongo_order');
var Expressa = require('../models/mongo_express')
var wxpay = require('../public/js/wxpay')

var getIp = function(req) {
	var ip = req.headers['x-real-ip'] ||
			req.headers['x-forwarded-for'] ||
			req.socket.remoteAddress || '';
	if(ip.split(',').length>0){
			ip = ip.split(',')[0];
	}
	return ip;
};

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/wx_login',function(req,res,next) {
  let routers = 'users/get_wx_access_token',
  return_uri  = 'http%3A%2F%2Fseven1103.6655.la%2F'+routers,
  scope = 'snsapi_userinfo',
  AppID = config.wxgzh.appid;
  console.log('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+AppID+'&redirect_uri='+return_uri+'&response_type=code&scope='+scope+'&state=STATE#wechat_redirect')
  res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+AppID+'&redirect_uri='+return_uri+'&response_type=code&scope='+scope+'&state=STATE#wechat_redirect');
})

router.get('/get_wx_access_token',function(req,res,next){
  // 第二步：通过code换取网页授权access_token
  var code = req.query.code;
  var AppSecret = config.wxgzh.AppSecret,AppID = config.wxgzh.appid;
  request.get(
      {   
          url:'https://api.weixin.qq.com/sns/oauth2/access_token?appid='+AppID+'&secret='+AppSecret+'&code='+code+'&grant_type=authorization_code',
      },
      function(error, response, body){
          if(response.statusCode == 200){
              
              // 第三步：拉取用户信息(需scope为 snsapi_userinfo)
              //console.log(JSON.parse(body));
              var data = JSON.parse(body);
              var access_token = data.access_token;
              var openid = data.openid;
              
              request.get(
                  {
                      url:'https://api.weixin.qq.com/sns/userinfo?access_token='+access_token+'&openid='+openid+'&lang=zh_CN',
                  },
                  function(error, response, body){
                      if(response.statusCode == 200){
                          
                          // 第四步：根据获取的用户信息进行对应操作
                          var userinfo = JSON.parse(body);
                          //console.log(JSON.parse(body));
                          console.log('获取微信信息成功！');
                          console.log(userinfo);
                          
                          // 小测试，实际应用中，可以由此创建一个帐户
                          res.send("\
                              <h1>"+userinfo.nickname+" 的个人信息</h1>\
                              <p><img src='"+userinfo.headimgurl+"' /></p>\
                              <p>"+userinfo.city+"，"+userinfo.province+"，"+userinfo.country+"</p>\
                          ");
                          
                      }else{
                          console.log(response.statusCode);
                      }
                  }
              );
          }else{
              console.log(response.statusCode);
          }
      }
  );
})

router.get('/logins',function(req,res,next){
  res.render('main/login');
})

//用户端逻辑----------------------------------------------------
//返回当前活动信息
router.get('/nowactivity',function(req,res,next){
    Activity.findOne({ispush:true}).then(info=>{
        if(info){
            res.send({code:0,result:info})
        }else{
            res.send({code:1,msg:'当前暂无活动'})
        }
    }).catch(err=>{
        res.send({code:1,msg:err})
    })
})
// 获取用户信息
router.get('/userinfo/:id',function(req,res,next){
    User.findById(req.params.id).then(user=>{
        if(user){
            res.send({code:0,result:user})
        }else{
            res.send({code:1,msg:'获取用户信息失败'})
        }
    }).catch(err=>{
        res.send({code:1,msg:err})
    })
})
// 提交订单
router.post('/order',function(req,res,next){
    let obj = Object.assign(req.body);
    obj._id = mongoose.Types.ObjectId().toString();
    obj.timed = parseInt(Date.now()/1000);
    let order = new Order(obj);
    order.save().then(ok=>{
        if(ok){
            res.send({code:0,msg:'成功'})
        }else{
            res.send({code:1,msg:'提交失败'})
        }
    }).catch(err=>{
        res.send({code:1,msg:err})
    })
})
// 微信支付
router.get('/wxpay',function(req,res,next){
    //获取订单信息
    // http://seven1103.6655.la/
    var attach = "1276687601";
	var body = "seven";
	var mch_id = "1514990121"; //商户ID
	var openid = "111111";
	var bookingNo = new Date().getTime(); //订单号
	// var bookingNo = new Date("month dd,yyyy hh:mm:ss");
	var total_fee = 1;
	var notify_url = "http://seven1103.6655.la/users/notify"; //通知地址
	var trade_type = "NATIVE";
    var spbill_create_ip = getIp(req);
	wxpay.order(attach, body, mch_id, openid, bookingNo, total_fee, notify_url,trade_type,spbill_create_ip).then(function(data){
        // res.render('wxpay', {args: data});
        //生成支付二维码
		res.send(data);
	});
})
//我的订单
router.get('/order/:userid',function(req,res,next){
    Order.find({userid:req.params.userid}).then(orders=>{
        if(orders){
            res.send({code:0,result:orders})
        }else{
            res.send({code:1,msg:'获取失败'})
        }
    }).catch(err=>{
        res.send({code:1,msg:err})
    })
})
//我的订单详情
router.get('/orderdetail/:orderid',function(req,res,next){
    Order.findById(req.params.orderid).then(info=>{
        if(info){
            if(info.expressid){
                return Expressa.findById(info.expressid);
            }else{
                let userinfo = info.address.name +'  '+info.address.phone +'   '+ info.province + info.address.city +
                info.address.country + info.address.info;
                res.send({code:1,result:{step:3,orderinfo:info.userinfo}})
            }
        }else{
            res.send({code:1,msg:'获取订单失败'})
        }
    }).then(infos=>{
        if(SRETURN(infos)) return
        res.send({code:1,result:{step:3,orderinfo:infos}})
    }).catch(err=>{
        res.send({code:1,msg:err})
    })
})

//修改我的收款地址
router.post('/address/:userid',function(req,res,next){
    let obj = Object.assign(req.body);
    User.findOneAndUpdate({_id:req.params.userid},obj).then(ok=>{
        if(ok){
            res.send({code:0,msg:'修改成功'})
        }else{
            res.send({code:1,msg:'修改失败'})
        }
    }).catch(err=>{
        res.send({code:1,msg:err})
    })
})

router.post('/notify',function(req, res, next){
	// console.log(123);
	console.log(req.body);
	console.log(req.rawBody);
})
module.exports = router;
