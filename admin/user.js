
var AdminForm = require('formage-admin').AdminForm;

module.exports = AdminForm.extend({
    get_fields: function() {
        this._super();
        if(this.fields['num_of_given_mandates'])
            this.fields['num_of_given_mandates'].widget.attrs['readonly'] = 'readonly';
//        if(this.fields['tokens'])
//            this.fields['tokens'].widget.attrs['readonly'] = 'readonly';
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