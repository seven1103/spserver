exports.array_contain = function(array, obj){
    for (var i = 0; i < array.length; i++){
        if (array[i] == obj)//如果要求数据类型也一致，这里可使用恒等号===
            return true;
    }
    return false;
}
exports.getTime = function(time){
    return new Date(parseInt(time) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ").substr(0, 10); 
}
exports.tempPath = function(src){
    return src.replace(/\\/g, "/");
}
exports.overtime = function(time){
    if(time*1000>Date.now()){
        return false
    }else{
        return true
    }
}
// 活动状态
exports.activityStatus = function(bool,finishtime){
    if(bool){
        if(finishtime*1000>Date.now()){
            return '已发布'
        }else{
            return '已结束'
        }
    }else{
        return '未发布'
    }
}
//订单状态
exports.orderStatus = function(num){
    if(num===0) return '未发货'
    if(num===1) return '已发货'
}