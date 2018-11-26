/**
 * 物流表
 */
var ExpressTable = {
    _id:{type:String,default:mongoose.Types.ObjectId().toString()},
    orderid:{type:String},
    orderinfo:{type:String},
    express_company:{type:String},
    info:{type:Object},
    timed:{type:Number}
}
var modelObj = new mongoose.Schema(ExpressTable, {version: false},{ _id: false });
module.exports = mongoose.model('expressas',modelObj);