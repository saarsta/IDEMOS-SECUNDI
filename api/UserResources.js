var Model= require("../models");
var mongoose_resource = require('jest');
var util = require('util');
var common = require('./common');
var _ = require('underscore');

var UserResource = module.exports =  mongoose_resource.MongooseResource.extend({
    init: function() {
        this._super(Model.User, null);
        this.fields = _.extend(common.user_public_fields, {cycles : null});
        this.update_fields = {
            biography: null,
            mail_notifications: null
        };
        this.allowed_methods = ['get','post','put','delete'];
        this.authentication = new common.SessionAuthentication();
        this.filtering = {'followers.follower_id': {
            exact:true,
            in:true
        },
        'cycles.cycle_id': {
            exact:true,
            in:true
        }
        }
    }
});


