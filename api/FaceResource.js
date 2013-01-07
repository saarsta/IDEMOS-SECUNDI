
var common = require('./common')
models = require('../models'),
    async = require('async');

var FaceResource = module.exports = jest.MongooseResource.extend(
    {


        init:function () {
            this._super(models.Face, null, null);
            this.allowed_methods = ['get','put'];
            //this.authentication = new common.SessionAuthentication();
            //this.filtering = {cycle: null};
            this.default_query = function (query) {
                return query
            };
        }   ,
        update_obj:function (req, object, callback) {

            var face_id         =req.body.id;
            var face_status        =req.body.status;
            models.Face.update({_id: face_id}, {  $set:{ status: face_status } },  function(err,count)
            {
                callback(null,count);
            });

        }

    }
)

