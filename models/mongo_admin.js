/**
 * 管理员表
 */
var AdminTable = {
    _id:{type:String,default:mongoose.Types.ObjectId().toString()},
    name:{type:String},
    sex:{type:Number},
    avater:{type:String,default:''},
    gov:{type:String,default:''},
    position:{type:String},
    powers:{type:Array},
    account:{type:String},
    password:{type:String},
    status:{type:Number,default:1},
    timed:{type:Number}
}
var modelObj = new mongoose.Schema(AdminTable,{versionKey: false},{version: false},{ _id: false });
module.exports = mongoose.model('admins',modelObj);