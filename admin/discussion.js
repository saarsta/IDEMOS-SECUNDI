
var j_forms = require('j-forms');
var async = require('async');
var models = require('../models');
var notifications = require('../api/notifications')

module.exports = j_forms.forms.AdminForm.extend({
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