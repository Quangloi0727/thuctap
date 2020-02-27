const mongoose = require('mongoose');
var users= new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    fullname:{type:String,required:true},
    gender:{type:Boolean},//true là nam,false là nữ
    phone:{type:Number,required:true},
    address:{type:String,required:true}},
    {collection:'users'});
module.exports = mongoose.model('users',users);