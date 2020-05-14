const mongoose = require('mongoose');
var category= new mongoose.Schema({
    name:{type:String,required:true},
    code:{type:String,required:true},
    note:{type:String},
    status:{type:Boolean},
    sort_order:{type:Number},
    parent_id:{type:mongoose.Schema.Types.ObjectId,default:null}},
    {collection:'categories'});
module.exports = mongoose.model('category',category);