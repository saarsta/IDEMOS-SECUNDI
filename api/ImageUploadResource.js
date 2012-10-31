

var jest = require('jest')
    ,common = require('./common')
    ,models = require('../models');


var ImageUploadResource = module.exports = jest.MongooseResource.extend({
    init: function() {
        this._super(models.ImageUpload);
        this.allowed_methods = ['post'];

        this.update_fields = {
            image: null
        };

        this.authentication = new common.SessionAuthentication();

        this.fields = {
            image: null,
            success: null
        };
    },

    deserialize: function(req,res,object,status) {
        if(status == 201)
            status = 200;
        res.send(object,status);
    },

    create_obj : function(req,fields,callback) {
        fields.user = req.user._id;
        var self = this;
        var base = this._super;

        common.uploadHandler(req,function(err,value) {
            if(err)
                callback(err);
            else {
                fields.image = value;
                fields.success = true;
                base.call(self,req,fields,callback);
            }
        });
    }
});