var config = require('./config');
var Q = require("q");
var request = require("request");
var crypto = require('crypto');
var ejs = require('ejs');
var fs = require('fs');
// var key = "5c8b97f795bfc4bc2a3411dc387ae951";
var key = "KVYTG4R34e7yHB2yAxsyXmDxfd5mux4N";
var messageTpl = fs.readFileSync(__dirname+'/message.ejs','utf-8');

var WxPay = {
    getXMLNodeValue: function(node_name, xml) {
        var tmp = xml.split("<" + node_name + ">");
        var _tmp = tmp[1].split("</" + node_name + ">");
        return _tmp[0];
    },
    raw: function(args) {
        var keys = Object.keys(args);
        keys = keys.sort()
        var newArgs = {};
        keys.forEach(function(key) {
            newArgs[key] = args[key];
        });
        var string = '';
        for (var k in newArgs) {
            string += '&' + k + '=' + newArgs[k];
        }
        string = string.substr(1);
        return string;
    },
    paysignjs: function(appid, nonceStr, package, signType, timeStamp) {
        var ret = {
            appId: appid,
            nonceStr: nonceStr,
            package: package,
            signType: signType,
            timeStamp: timeStamp
        };
        var string = this.raw(ret);
        string = string + '&key=' + key;
        var sign = crypto.createHash('md5').update(string, 'utf8').digest('hex');
        return sign.toUpperCase();
    },
    paysignjsapi: function(appid, attach, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type) {
        var ret = {
            appid: appid,
            attach: attach,
            body: body,
            mch_id: mch_id,
            nonce_str: nonce_str,
            notify_url: notify_url,
            openid: openid,
            out_trade_no: out_trade_no,
            spbill_create_ip: spbill_create_ip,
            total_fee: total_fee,
            trade_type: trade_type
        };
        var string = this.raw(ret);
        string = string + '&key=' + key; //key为在微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置
        var crypto = require('crypto');
        var sign = crypto.createHash('md5').update(string, 'utf8').digest('hex');
        return sign.toUpperCase();
    },
    paysignApp:function(appid,body,mch_id,nonce_str,notify_url,out_trade_no,spbill_create_ip,total_fee,trade_type){
        var ret = {
            appid: appid,
            body: body,
            mch_id: mch_id,
            nonce_str: nonce_str,
            notify_url:notify_url,
            out_trade_no:out_trade_no,
            spbill_create_ip:spbill_create_ip,
            total_fee:total_fee,
            trade_type:trade_type//这些参数左边的参数名是参加签名的参数名，跟文档保持一致
        };
        var string = this.raw(ret);
        string = string + '&key='+key;
        return crypto.createHash('md5').update(string,'utf8').digest('hex').toUpperCase();
    },
    paysignApp2:function(appid,nonceStr,package,partnerid,prepayid,timeStamp){
        var ret = {
            appid: appid,
            noncestr: nonceStr,
            package:package,
            partnerid:partnerid,
            prepayid:prepayid,
            timestamp:timeStamp//签名的参数名一定要对
        };
        var string = this.raw(ret);
        string = string + '&key='+key;
        return crypto.createHash('md5').update(string,'utf8').digest('hex').toUpperCase();//签名都需大写
    },
     // 随机字符串产生函数
     createNonceStr: function() {
        return Math.random().toString(36).substr(2, 15);
    },
    // 时间戳产生函数
    createTimeStamp: function() {
        return parseInt(new Date().getTime() / 1000) + '';
    },
    // 此处的attach不能为空值 否则微信提示签名错误
    order: function(attach, body, mch_id, openid, out_trade_no, total_fee, notify_url,trade_type,spbill_create_ip) {
        var deferred = Q.defer();
        var appid = config.member_config.appid;
        var nonce_str = this.createNonceStr();
        var timeStamp = this.createTimeStamp();
        var url = "https://api.mch.weixin.qq.com/pay/unifiedorder";
        var formData = "<xml>"; 
        formData += "<appid>"+appid+"</appid>"; //appid 
        // formData += "<attach>"+attach+"</attach>"; //附加数据
        formData += "<body>"+body+"</body>"; 
        formData += "<mch_id>"+mch_id+"</mch_id>"; //商户号 
        formData += "<nonce_str>"+nonce_str+"</nonce_str>"; //随机字符串，不长于32位。 
        formData += "<notify_url>"+notify_url+"</notify_url>"; 
        formData += "<out_trade_no>"+out_trade_no+"</out_trade_no>"; 
        formData += "<spbill_create_ip>"+spbill_create_ip+"</spbill_create_ip>"; 
        formData += "<total_fee>"+total_fee+"</total_fee>"; 
        formData += "<trade_type>"+trade_type+"</trade_type>"; 
        // 判断支付类型
        if(trade_type=='APP'){
        formData += "<sign>"+this.paysignApp(appid,body,mch_id,nonce_str,notify_url, out_trade_no,spbill_create_ip,total_fee,trade_type)+"</sign>";//第一次签名的sign 
        }
        if(trade_type=='NATIVE'){
        formData += "<sign>"+this.paysignjsapi(appid, attach, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type)+"</sign>";//第一次签名的sign 
        }
        formData += "</xml>"; 
        var self = this;
        request({
            url: url,
            method: 'POST',
            body: formData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
               
                if(trade_type=='APP'){
                    var prepay_id = self.getXMLNodeValue('prepay_id', body.toString("utf-8"));
                    var tmp = prepay_id.split('[');
                    var tmp1 = tmp[2].split(']');
                    //签名                        
                    // var _paySignjs = self.paysignjs(appid, nonce_str, 'prepay_id=' + tmp1[0], 'MD5', timeStamp);
                    var _paysignApp2 = self.paysignApp2(appid,nonce_str,"Sign=WXPay",mch_id,tmp1[0],timeStamp);
                    var args = {
                        appid:appid,
                        noncestr:nonce_str,
                        package:"Sign=WXPay",
                        partnerid:mch_id,
                        prepayid:tmp1[0],
                        timestamp:parseInt(timeStamp),
                        sign:_paysignApp2
                    }
                    deferred.resolve(args);                    
                }else if(trade_type=='NATIVE'){
                    var prepay_id = self.getXMLNodeValue('prepay_id', body.toString("utf-8"));
                    var tmp = prepay_id.split('[');
                    var tmp1 = tmp[2].split(']');
                    var code_url = getXMLNodeValue('code_url', body.toString("utf-8"));
                    var tmp = code_url.split('[');
                    var tmp3 = tmp[2].split(']');
                    var args = {
                        prepay_id : tmp1[0],
                        code_url : tmp3[0]
                    }
                    deferred.resolve(args); 
                }
            } else {
                console.log(body);
            }
        });
        return deferred.promise;
    },
    //支付回调通知
    notify: function(obj) {
        var output = "";
        if (obj.return_code == "SUCCESS") {
            var reply = {
                return_code: "SUCCESS",
                return_msg: "OK"
            };
 
        } else {
            var reply = {
                return_code: "FAIL",
                return_msg: "FAIL"
            };
        }
 
        output = ejs.render(messageTpl, reply);
        return output;
    }
}

module.exports = WxPay;