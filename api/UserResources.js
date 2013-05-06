var Model= require("../models");
var mongoose_resource = require('jest');
var util = require('util');
var common = require('./common');
var _ = require('underscore');

var UserResource = module.exports =  mongoose_resource.MongooseResource.extend({
    init: function() {
        this._super(Model.User, null);
        this.fields = _.extend(common.user_public_fields, {cycles : null}, {discussions: null}, {email: null});
        this.update_fields = {
            biography: null,
            no_mail_notifications: null
        };
        this.allowed_methods = ['get','post','put','delete'];
        this.authentication = new common.SessionAuthentication();
        this.filtering = {
            'followers.follower_id': {
                exact:true,
                in:true
            },
            'cycles.cycle_id': {
                exact:true,
                in:true
            },
            'email': {
                exact:true,
                in:true
            },
            'first_name' : {
                exact: true,
                in: true
            }
        }
    }
});


