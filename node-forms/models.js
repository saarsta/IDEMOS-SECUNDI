
var mongoose = require('mongoose');
var objectId = mongoose.Schema.ObjectId;
module.exports = {
    Book : mongoose.model('Book',new mongoose.Schema({
        name : String,
        pages : { type:Number, min:14, max:20000},
        author : {type:objectId,ref:'Author'},
        janner : {type:String,enum:['Novel','Science fiction']}
    })),
    Author: mongoose.model('Author',new mongoose.Schema({
        name : {first:String,last:String},
        likes : [{book:{type:objectId,ref:'Book'},how:Number}]
    }))
};

