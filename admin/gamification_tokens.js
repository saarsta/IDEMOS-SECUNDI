var j_forms = require('j-forms');
var models = require('../models');
var AdminForm = require('admin-with-forms').AdminForm;

module.exports = AdminForm.extend({
    init:function (request, options, model) {
        this._super(request, options, model);
        this['static']['inline-style'].push('label.field span.field_label {height: auto; margin-bottom: 1em;}');
    }
});