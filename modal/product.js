const mongoose = require('mongoose');
var product= new mongoose.Schema({
    name:{type:String,required:true},
    price:{type:Number,required:true},
    quantyti:{type:Number,required:true},
    description:{type:String,required:true},
    group:{type:String,required:true},//Nhóm sản phẩm
    images:{type:Array,required:true}},
    {collection:'product'});
module.exports = mongoose.model('product',product);