
var j_forms = require('j-forms');
var async = require('async');
var models = require('../models');
var notifications = require('../api/notifications')
    ,AdminForm = require('admin-with-forms').AdminForm;

module.exports = AdminForm.extend({
    init:function(request,options,model) {
        this._super(request,options,model);


        this.static['js'].push('/node-forms/js/autocomplete.js');
    },

    get_fields: function() {
        this._super();
        this.fields['is_approved'].widget.attrs['readonly'] = 'readonly';
        this.fields['is_approved'].widget.attrs['disabled'] = 'disabled';
    },

    actual_save : function(callback)
    {
        var self = this;
        var is_approved = self.instance.is_approved;
        this._super(function(err,object) {
            console.log(err);
            console.log(self.errors);
            console.log(object);

            //is approved sometimes changes when saving the form
            if( !err && (is_approved !== object.is_approved))
                models.Action.update({_id: object._id}, {$set: {is_approved: is_approved}}, function(err, num){
                    callback(err, object);
                });
            else
                callback(err,object);
        });
    }
});