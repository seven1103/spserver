/**
 * 商品表
 */
var GoodTable = {
    _id:{type:String,default:mongoose.Types.ObjectId().toString()},
    title:{type:String},
    price:{type:String},
    unit:{type:String,default:'瓶'},
    banner:{type:Array},
    goodimg:{type:Array},
    weight:{type:Number},
    weight_unit:{type:String},
    content:{type:String},
    stock:{type:Number},
    limitcount:{type:Number},
    origin:{type:Object},
    time:{type:Object},
    express:{type:Number},
    express_time:{type:String},
    delstatus:{type:Boolean,default:0},
    ispush:{type:Boolean,default:false},
    timed:{type:Number}
}
var modelObj = new mongoose.Schema(GoodTable, {version: false},{ _id: false });
module.exports = mongoose.model('goods',modelObj);