

var jest = require('jest')
    ,j_forms = require('j-forms')
    ,common = require('./common')
    ,models = require('../models');


var ImageForm = j_forms.forms.MongooseForm.extend({
     init:function(req,options) {
         this._super(req,options,models.ImageUpload);
     },

    get_fields:function() {
        this._super();
        this.fields = { image: this.fields.image};
    }

});


var ImageUploadResource = module.exports = jest.MongooseResource.extend({
    init: function() {
        this._super(models.ImageUpload);
        this.allowed_methods = ['post'];

        this.update_fields = {
            image: null
        };

        this.authentication = new common.SessionAuthentication();

        this.fields = {
            image: null
        };
    },

    create_obj : function(req,fields,callback) {
        fields.user = req.user._id;
        var form = new ImageForm(req,{data:fields});

        form.is_valid(function(err,is_valid) {
            if(err)
                callback(err);
            else{
                if(is_valid)
                    form.save(callback);
                else
                    callback(form.errors);
            }
        });
    }
});