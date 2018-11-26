var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
global.mongoose = mongoose;
// global.db = mongoose.connect(constant.DB_HOST);
// mongoose.connection.on('connected', function () {    
//     console.log('Mongoose connection open to ' + constant.DB_HOST);  
// });    
mongoose.connect(constant.DB_HOST,{useNewUrlParser:true},function(err){
    if(err){console.log('Connection Error:' + err)}
    else{console.log('Connection success!') }
})
