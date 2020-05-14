const mongoose = require('mongoose');
var categoryId = mongoose.Schema({
    id: {type: mongoose.Schema.Types.ObjectId},
}, {_id: false});
var product= new mongoose.Schema({
    categoryId:{type:Array,required:true},// thể loại
    name:{type:String,required:true},
    price:{type:Number,required:true},
    quantity:{type:Number,required:true},
    description:{type:String,required:true},
    images:{type:Array,required:true},
    memory:{type:String,required:true},
    ram:{type:String,required:true},
    camera:{type:String,required:true},
    discount:{type:Number,default:null},
    created: {type: Date, default: Date.now},
    createdBy:{type: mongoose.Schema.Types.ObjectId,required:true}},//được tạo bởi
    {collection:'product'});
module.exports = mongoose.model('product',product);