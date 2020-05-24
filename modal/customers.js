const mongoose = require('mongoose');
var customers= new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    fullname:{type:String,required:true},
    gender:{type:Boolean},//true là nam,false là nữ
    phone:{type:String,required:true},
    address:{type:String,required:true}},
    {collection:'customers'});
module.exports = mongoose.model('customers',customers);