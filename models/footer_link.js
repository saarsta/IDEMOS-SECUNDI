

var mongoose = require('mongoose')
    ,Schema = mongoose.Schema
    ,types = require('j-forms').types
    ,_ = require('underscore');

var FooterLink = module.exports = new Schema({
    tab:{type:String,required:true},
    link:{type:String},
    name:{type:String, required:true},
    title:{type:String, required:false},
    html:{type:types.Html,required:true},
    is_hidden:{type:Boolean,'default':true},
    is_on_top:{type:Boolean,'default':false},
    is_on_footer:{type:Boolean},
    gui_order:{type:Number,'default':Number.MAX_VALUE,editable:false}
});

var links = [];

FooterLink.statics.load = function(callback) {
    this.find({}).sort({'gui_order':1}).exec(function(err,docs) {
        if(docs)
            links = docs;
        if(callback)
            callback(err);
    });
};

FooterLink.statics.getFooterLinks = function() {
    return links;
};

FooterLink.pre('save',function(next) {
   mongoose.model('FooterLink').load();
   next();
});

FooterLink.statics.getFooterLink = function(link) {
    return _.find(links,function(footer_link) {
        return footer_link.tab == link;
    });
};