var AdminForm = require('admin-with-forms').AdminForm;

module.exports = AdminForm.extend({
    init:function(request, options, model) {
        this._super(request, options, model);
        this['static']['inline-style'].push('.nf_fieldset label.field span.field_label {height: auto; margin-bottom: 1em;}');
    },


    get_fields: function() {
        this._super();
        if('threshold_for_accepting_change_suggestions' in this.fields)
            this.fields['threshold_for_accepting_change_suggestions'].widget.attrs['readonly'] = 'readonly';
    }
});