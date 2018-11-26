/**
 * 订单表
 */
var OrderTable = {
    _id:{type:String,default:mongoose.Types.ObjectId().toString()},
    userid:{type:String},
    pay_id:{type:String},
    goodsid:{type:String},
    expressid:{type:String},
    count:{type:Number},
    Rpayment:{type:Number},
    address:{type:Object},
    status:{type:Number,default:0},
    delstatus:{type:Boolean},
    timed:{type:Number}
}
var modelObj = new mongoose.Schema(OrderTable, {version: false},{ _id: false });
module.exports = mongoose.model('orders',modelObj);