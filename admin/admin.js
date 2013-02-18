
var formage_admin = require('formage-admin')
    ,Forms = formage_admin.forms
    ,_ = require('underscore')
    ,crypt = formage_admin.crypt
    ,AdminForm = formage_admin.AdminForm
    ,mongoose = require('mongoose');


module.exports = AdminForm.extend({
    init:function(request,options)
    {
        this._super(request,options,mongoose.model('_MongooseAdminUser'));
        this.static['js'].push('/node-forms/js/autocomplete.js');

    }
    ,get_fields:function(){
        this._super();
        var fields = this.fields;

        delete fields['passwordHash'];


        this.fields['current_password'] = new Forms.fields.StringField({widget:Forms.widgets.PasswordWidget,label:'Current Password'});

        this.fields['password'] = new Forms.fields.StringField({widget:Forms.widgets.PasswordWidget,label:'New Password',required:true});

        this.fields['password_again'] = new Forms.fields.StringField({widget:Forms.widgets.PasswordWidget,label:'Again',required:true});

        this.fieldsets[0].fields = ['current_password','password','password_again'];

        return fields;
    },

    is_valid:function(callback)
    {
        var self = this;
        this._super(function(err,result)
        {
            if(err || !result)
                callback(err,result);
            else
            {
                if(!crypt.compare_sync(self.data.current_password,self.instance.passwordHash))
                    self.errors['current_password'] = self.fields['current_password'].errors = ['Password incorrect'];
                else
                {
                    if(self.data.password != self.data.password_again)
                    {
                        self.errors['password_again'] = self.fields['password_again'].errors = ['typed incorrectly'];
                    }
                }

                callback(null,Object.keys(self.errors).length == 0);
            }
        });
    },
    actual_save:function(callback)
    {
        this.instance.passwordHash = crypt.encrypt_sync(this.data.password);
        this._super(callback);
    }
});



