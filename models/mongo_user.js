/**
 * 用户表
 */
var UserTable = {
    _id:{type:String,default:mongoose.Types.ObjectId().toString()},
    name:{type:String},
    sex:{type:Number},
    w_id:{type:String},
    avater:{type:String},
    age:{type:Number},
    phone:{type:String},
    address:{type:Object},
    timed:{type:Number}
}
var modelObj = new mongoose.Schema(UserTable, {version: false},{ _id: false });
module.exports = mongoose.model('users',modelObj);