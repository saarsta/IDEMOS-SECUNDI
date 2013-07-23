

var mongoose = require('mongoose')
    ,Schema = mongoose.Schema
    ,utils = require('../utils')
    ,_ = require('underscore');

var FooterLink = module.exports = utils.revertibleModel(new Schema({
    tab:{type:String,required:true},
    link:{type:String},
    name:{type:String, required:true},
    title:{type:String, required:false},
    html:{type:Schema.Types.Html,required:true},
    is_hidden:{type:Boolean,'default':true},
    is_on_top:{type:Boolean,'default':false},
    is_on_footer:{type:Boolean},
    highlights: [{
        img_field:{ type:Schema.Types.File, required:true},
        text_field:String,
        img_text: String
    }],
    gui_order:{type:Number,'default':Number.MAX_VALUE,editable:false},
    _preview:{type:Schema.Types.Mixed,link:'/page/{tab}',editable:false}
}));

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