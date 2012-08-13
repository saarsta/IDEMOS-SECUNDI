///**
// * Created by JetBrains WebStorm.
// * User: ishai
// * Date: 3/18/12
// * Time: 12:09 PM
// * To change this template use File | Settings | File Templates.
// */
//
//var fields = require('j-forms').fields,
//    util = require('util'),
//    forms = require('j-forms').forms,
//    i18n = require('i18n-mongoose'),
//    mongoose = require('mongoose');
//
//var LocaleForm = exports.LocaleForm = function(){
//    LocaleForm.super_.apply(this,arguments);
//};
//util.inherits(LocaleForm,forms.MongooseForm);
//
//LocaleForm.prototype.get_fields = function(){
//    LocaleForm.super_.prototype.get_fields.call(this);
//    delete this.fields['text'];
//    var text_fields = [];
//    var fieldset = {};
//    for(var key in this.instance.text)
//    {
//        if(typeof(this.instance.text[key]) == 'object')
//        {
//            for(var inner_key in this.instance.text[key])
//            {
//                this.fields['text.' + key + '.' + inner_key] = new fields.StringField({required:true});
//                text_fields.push('text.' + key + '.' + inner_key);
//            }
//        }
//        else
//        {
//            this.fields['text.' + key] = new fields.StringField({required:true});
//            text_fields.push('text.' + key);
//        }
//    }
//    this.fieldsets[0].fields = ['locale',{title:'text',fields:text_fields}];
//    console.log(this.fieldsets);
//};
//LocaleForm.prototype.save = function(callback)
//{
//    LocaleForm.super_.prototype.save.call(this,function()
//    {
//        i18n.configure({});
//        callback.apply(null,arguments);
//    })
//};
//
//var Model = exports.Model = mongoose.model('Locale',new mongoose.Schema({
//    locale:{type:String, required:true, unique:true},
//    text:mongoose.Schema.Types.Mixed
//}));
//
//
//i18n.setModel(Model);
