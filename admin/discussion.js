
var j_forms = require('j-forms');
var async = require('async');
var models = require('../models');
var notifications = require('../api/notifications')

module.exports = j_forms.forms.AdminForm.extend({
    get_fields: function() {
        this._super();
        if(this.fields['threshold_for_accepting_change_suggestions'])
            this.fields['threshold_for_accepting_change_suggestions'].widget.attrs['readonly'] = 'readonly';
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