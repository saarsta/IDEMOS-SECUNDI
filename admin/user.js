
var j_forms = require('j-forms');

module.exports = j_forms.forms.AdminForm.extend({
    get_fields: function() {
        this._super();
        if(this.fields['num_of_given_mandates'])
            this.fields['num_of_given_mandates'].widget.attrs['readonly'] = 'readonly';
        if(this.fields['num_of_extra_tokens'])
            this.fields['num_of_extra_tokens'].widget.attrs['readonly'] = 'readonly';
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