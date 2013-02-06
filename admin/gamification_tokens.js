var models = require('../models');
var AdminForm = require('formage-admin').AdminForm;

module.exports = AdminForm.extend({
    init:function (request, options, model) {
        this._super(request, options, model);
        if(this['static']['inline-style']){
            this['static']['inline-style'].push('label.field span.field_label {height: auto; margin-bottom: 1em;}');
        }
    }
});