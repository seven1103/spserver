var express = require('express');
var router = express.Router();
var Goods = require('../models/mongo_goods');
var Admins = require('../models/mongo_admin');
var Users = require('../models/mongo_user');
var Order = require('../models/mongo_order');
var Filter = require('../public/js/filters');
var nodeExcel = require('excel-export');
var ExpressTable = require('../models/mongo_express');
const Sex = ['未知','男','女'];
const Status = ['否','是'];
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('admin/index', { nav: 'nav1',userinfo:req.userInfo });
});
router.get('/login', function(req, res, next) {
    res.render('admin/login');
});
router.post('/adminLogin', function(req, res, next) {
    var username = req.body.username||'',
      password = req.body.password||'';
    if(username===''||password===''){
      res.send({code:1,msg:'用户名和密码不能为空'});
      return
    }
    Admins.findOne({
      account: username.trim(),
      password: password.trim()
    }).then(userinfo=>{
      if(!userinfo){
        res.send({code:1,msg:'用户名和密码错误'});
      }else{  
        if(userinfo.status==0){
            res.send({code:1,msg:'该账号已停用'});
        }else{
            // let info = {
            //     id:userinfo._id,
            //     account:userinfo.account,
            //     name:userinfo.name,
            //     sex:userinfo.sex,
            //     gov:userinfo.gov,
            //     position:userinfo.position,
            //     powers:userinfo.powers,
            //     status:userinfo.status
            // };
            let info = JSON.stringify(userinfo)
            req.cookies.set('userInfo',new Buffer(info).toString('base64'));
            res.send({code:0,msg:'用户登录成功'});  
        }
      }
    }).catch(err=>{
        console.log(err)
    })
});
router.get('/adminlogout',function(req, res, next) {
    req.cookies.set('userInfo',null);
    res.redirect('/admin/login')
})
router.get('/activity', function(req, res, next) {
    let page = req.query.page || 1,
    pagesize = 20,
    sort = {'timed':-1}, //按创建时间排序
    skipnum = (page - 1) * pagesize; //跳过数
    let obj = {};
    Goods.countDocuments({delstatus:false},(err,count)=>{
        obj.countobj = {
            count:count,
            totallpage:Math.ceil(count/pagesize),
            pagesize:pagesize,
            currentpage:page
        };
        Goods.find({delstatus:false}).skip(skipnum).limit(pagesize).sort(sort).then(goods=>{
            if(goods){
                obj.list = goods;
            }else{
                obj.list = [];
            }
            res.render('admin/activity', { nav: 'nav1',obj:obj,userinfo:req.userInfo,path:req.path });
        })
    })
});
router.get('/order', function(req, res, next) {
    let page = req.query.page || 1,
    pagesize = 20,
    sort = {'timed':-1}, //按创建时间排序
    skipnum = (page - 1) * pagesize; //跳过数
    let obj = {list:[]};
    Order.countDocuments().then(count=>{
        obj.countobj = {
            count:count,
            totallpage:Math.ceil(count/pagesize),
            pagesize:pagesize,
            currentpage:page
        };
        return Order.find().skip(skipnum).limit(pagesize).sort(sort)
    }).then(orders=>{
        if(SRETURN(orders)) return;
        obj.list = Object.assign(orders);
        let promisess = orders.map(item=>Goods.findById(item.goodsid))
        return Promise.all(promisess)
        // console.log(orders[0].goodsid)
        // return Goods.findById('5bee9d792c26da4538bd23bf')
    }).then(list=>{
        if(SRETURN(list)) return;
        list.map((items,index)=>{
            obj.list[index].goods = Object.assign(items)
            obj.list[index]._doc.goods = {title:items.title,unit:items.unit}
        })
        // console.log(obj)
        // res.render('admin/order', { nav: 'nav2',obj:obj });
        let promisessa = obj.list.map(itema=> {
            if(itema.expressid){return ExpressTable.findById(itema.expressid) }
            else return {express_company:'',_id:''}
        })
        return Promise.all(promisessa)
    }).then(expressttables=>{
        if(SRETURN(expressttables)) return;
        expressttables.map((items,index)=>{
            obj.list[index].express = Object.assign(items)
            obj.list[index]._doc.express = {express_company:items.express_company,_id:items._id}
        })
        res.render('admin/order', { nav: 'nav2',obj:obj,userinfo:req.userInfo,path:req.path });
    })
});
router.get('/user', function(req, res, next) {
    // res.render('admin/user', { nav: 'nav3' });
    let page = req.query.page || 1,
    pagesize = 20,
    sort = {'timed':-1}, //按创建时间排序
    skipnum = (page - 1) * pagesize; //跳过数
    let obj = {};
    Users.countDocuments({},(err,count)=>{
        obj.countobj = {
            count:count,
            totallpage:Math.ceil(count/pagesize),
            pagesize:pagesize,
            currentpage:page
        };
        Users.find().skip(skipnum).limit(pagesize).sort(sort).then(users=>{
            if(users){
                obj.list = users;
            }else{
                obj.list = [];
            }
            res.render('admin/user', { nav: 'nav3',obj:obj,userinfo:req.userInfo,path:req.path });
        })
    })
});
router.get('/admins', function(req, res, next) {
    // res.render('admin/admins', { nav: 'nav4' });
    let page = req.query.page || 1,
    pagesize = 20,
    sort = {'timed':-1}, //按创建时间排序
    skipnum = (page - 1) * pagesize; //跳过数
    let obj = {};
    Admins.countDocuments({},(err,count)=>{
        obj.countobj = {
            count:count,
            totallpage:Math.ceil(count/pagesize),
            pagesize:pagesize,
            currentpage:page
        };
        Admins.find().skip(skipnum).limit(pagesize).sort(sort).then(admins=>{
            if(admins){
                obj.list = admins;
            }else{
                obj.list = [];
            }
            res.render('admin/admins', { nav: 'nav4',obj:obj,userinfo:req.userInfo,path:req.path });
        })
    })
});
router.get('/activity/addactivity',function(req, res,next) {
    res.render('admin/addActivity', { nav: 'nav1',userinfo:req.userInfo});
})

// 删除活动
router.delete('/activity/:id',function(req,res,next) {
    let id = req.params.id;
    Goods.findOneAndUpdate({_id:id},{delstatus:true}).then(ok=>{
        if(ok) res.send({code:0,msg:'成功'})
        else res.send({code:1,msg:'失败'})
    }).catch(err=>{
        res.send({code:1,msg:err})
    })
})
// 修改活动发布状态
router.put('/activity/:id',function(req,res,next) {
    let id = req.params.id;
    Goods.findOneAndUpdate({_id:id},{ispush:true}).then(ok=>{
        if(ok) res.send({code:0,msg:'成功'})
        else res.send({code:1,msg:'失败'})
    }).catch(err=>{
        res.send({code:1,msg:err})
    })
})
//修改活动
router.get('/activity/:id/edit',function(req,res,next) {
    let id = req.params.id;
    Goods.findById(id).then(info=>{
        console.log(info)
        if(info){
            res.render('admin/editActivity', { nav: 'nav1',userinfo:req.userInfo,info:info});
        }else{
            res.render('admin/editActivity', { nav: 'nav1',userinfo:req.userInfo});
        }
    }).catch(err=>{
        res.render('admin/editActivity', { nav: 'nav1',userinfo:req.userInfo});
    })
})

// 添加活动
router.post('/activity',function(req,res,next) {
    let obj = Object.assign(req.body);
    let abj = {
        _id:mongoose.Types.ObjectId().toString(),
        content:obj.content,
        title:obj.title,
        stock:obj.stock,
        price:obj.price,
        limitcount:obj.limitcount,
        time:{
            start:parseInt(new Date(obj.startTime).getTime()/1000),
            finished:parseInt(new Date(obj.finishTime).getTime()/1000)
        },
        banner:[],
        goodimg:[],
        timed:parseInt(Date.now()/1000)
    }
    req.files.map(item=>{
        if(item.fieldname.indexOf('goods')>-1){
            abj.goodimg.push(item.path.split('uploads')[1])
        }
        if(item.fieldname.indexOf('banner')>-1){
            abj.banner.push(item.path.split('uploads')[1])
        }
    })
    let goods = new Goods(abj);
    goods.save().then(ok=>{
        if(ok) res.send({code:0,msg:'添加成功'})
        else res.send({code:0,msg:'添加失败'})
    }).catch(err=>{
        res.send({code:1,msg:err})
    })
})
// 修改订单
router.put('/order/:id',function(req,res,next) {
    let orders;
    //判断当前是修改还是添加
    Order.findById(req.params.id).then(info=>{
        if(info){
            orders = info;
            if(info.expressid){//修改
                return ExpressTable.findOneAndUpdate({_id:req.body.expressId},{express_company:req.body.company})
            }else{//添加
                let newexpress = new ExpressTable({
                    _id:req.body.expressId,
                    orderid:req.params.id,
                    orderinfo:req.body.orderinfo,
                    express_company:req.body.company,
                    info:[],
                    timed:parseInt(Date.now()/1000)
                })
                return newexpress.save();
            }
        }else{
            res.send({code:1,msg:'当前订单不存在'});
            return false;
        }
    }).then(ok=>{
        if(SRETURN(ok)) return;
        //修改订单表
        return Order.findOneAndUpdate({_id:req.params.id},{expressid:req.body.expressId,status:1})
    }).then(oks=>{
        if(SRETURN(oks)) return;
        res.send({code:0,msg:'修改成功'})
    }).catch(err=>{
        res.send({code:1,msg:err})
    })
})
// 添加管理员
router.post('/addadmin',function(req,res,next){
    let obj = Object.assign(req.body);
    Admins.find({account:obj.account}).then(admin=>{
        if(admin.length>0){
            res.send({code:1,msg:'当前用户已被注册'})
            return false
        }else{
            let admin = new Admins({
                _id:mongoose.Types.ObjectId().toString(),
                account:obj.account,
                password:obj.password,
                name:obj.name,
                sex:obj.sex,
                powers:obj.powers,
                position:obj.position,
                timed:parseInt(Date.now()/1000)
            })
            return admin.save()
        }
    }).then(ok=>{
        if(ok) res.send({code:0,msg:'添加成功'})
        // else res.send({code:1,msg:'添加失败'})
    }).catch(err=>{
        res.send({code:1,msg:err})
    })
})
//删除管理员
router.delete('/deladmin/:id',function(req,res,next){
    let id = req.params.id;
    Admins.findByIdAndRemove(id).then(ok=>{
        if(ok) res.send({code:0,msg:'删除成功'})
        else res.send({code:1,msg:'删除失败'})
    }).catch(err=>{
        res.send({code:1,msg:err})
    })
})
// 修改管理员
router.put('/updateadmin/:id',function(req,res,next){
    let id = req.params.id;
    let obj = Object.assign(req.body);
    Admins.findOneAndUpdate({_id:req.params.id},obj).then(ok=>{
        if(ok) res.send({code:0,msg:'修改成功'})
        else res.send({code:1,msg:'修改失败'})
    }).catch(err=>{
        res.send({code:1,msg:err})
    })
})
// 导出订单表
router.get('/orderexcel',function(req,res,next){
    let conf = {},rows=[],obj={list:[]};
    conf.cols = [{caption:'序号'},{caption:'商品'},{caption:'购买数量'},{caption:'商品单价'},{caption:'收货地址'},
    {caption:'下单时间'},{caption:'联系电话'},{caption:'物流电话'},{caption:'发货单号'},{caption:'状态'}]
    Order.find().then(orders=>{
        if(SRETURN(orders)) return;
        obj.list = Object.assign(orders);
        let promisess = orders.map(item=>Goods.findById(item.goodsid))
        return Promise.all(promisess)
    }).then(list=>{
        if(SRETURN(list)) return;
        list.map((items,index)=>{
            obj.list[index].goods = Object.assign(items)
            obj.list[index]._doc.goods = {title:items.title,unit:items.unit}
        })
        let promisessa = obj.list.map(itema=> {
            if(itema.expressid){return ExpressTable.findById(itema.expressid) }
            else return {express_company:'',_id:''}
        })
        return Promise.all(promisessa)
    }).then(expressttables=>{
        if(SRETURN(expressttables)) return;
        expressttables.map((items,index)=>{
            obj.list[index].express = Object.assign(items)
            obj.list[index]._doc.express = {express_company:items.express_company,_id:items._id}
        })
        obj.list.map((item,indexs)=>{
            let arr = [];
            arr.push(indexs+1);
            arr.push(item.goods.title);
            arr.push(item.count);
            arr.push(item.goods.price);
            arr.push(item.address.provice + item.address.city + item.address.county + item.address.info);
            arr.push(Filter.getTime(item.timed));
            arr.push(item.address.phone);
            arr.push(item.express.express_company);
            arr.push(item.express._id);
            // arr.push(Filter.getTime(item.timed));
            arr.push(Filter.orderStatus(item.status));
            rows.push(arr)
        })
        conf.rows = rows;
        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "order.xlsx");
        res.end(result, 'binary');
    }).catch(err=>{
        console.log(err)
    })

    
})
// 导出用户表
router.get('/userexcel',function(req,res,next){
    let conf = {},rows=[];
    conf.cols = [{caption:'序号'},{caption:'用户名'},{caption:'性别'},{caption:'联系电话'},{caption:'所在地'},
    {caption:'微信号'},{caption:'加入时间'}]
    
    Users.find().then(users=>{
        users.map((item,index)=>{
            let arr = [];
            arr.push(index+1);
            arr.push(item.name);
            arr.push(item.sex);
            arr.push(item.phone);
            arr.push(item.address.provice + item.address.city + item.address.county + item.address.info);
            arr.push(item.w_id);
            arr.push(Filter.getTime(item.timed));
            rows.push(arr)
        })
        conf.rows = rows;
        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "order.xlsx");
        res.end(result, 'binary');
    })
})
module.exports = router;
