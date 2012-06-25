/**
 * Created by
 * User: liorur
 * Date: 18/06/12
 * Time: 13:58
 * To change this template use File | Settings | File Templates.
 */
jest = require('jest'),
  //  util = require('util'),
   models = require('../models'),
   common = require('./common'),
   async = require('async');

var FBRequestResource = module.exports = jest.MongooseResource.extend({
    init:function(){
        this._super(models.FBRequest);
        this.allowed_methods = ["get", "post"];

        this.default_query = function (query) {
            return query;
        };

        this.filtering = {
            fb_request_ids:{
                exact:null,
                in:null
            }
        };

        this.authentication = new common.SessionAuthentication();

        this.authorization = new (jest.Authorization.extend({
            edit_object: function(req,object,callback) {
                object.creator =  req.user._id;
                callback(null,object);
            }
        }));
    }
});
