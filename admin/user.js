var AdminForm = require('formage-admin').AdminForm;

module.exports = AdminForm.extend({
    get_fields: function () {
        this._super();
        this.fields['num_of_given_mandates'].widget.attrs['readonly'] = 'readonly';
    },


    actual_save: function (callback) {
        var self = this;
        this._super(function (err, object) {
            console.log(err);
            console.log(self.errors);
            console.log(object);
            callback(err, object);
        });
    }
});
