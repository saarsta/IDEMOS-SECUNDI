
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
        if(this.fields['type'])
            this.fields['type'].widget.attrs['readonly'] = 'readonly';
    },

    actual_save : function(callback)
    {
        var self = this;
        this._super(function(err,object) {
            console.log(err);
            console.log(self.errors);
            console.log(object);
            callback(err,object);
        });
    }
});