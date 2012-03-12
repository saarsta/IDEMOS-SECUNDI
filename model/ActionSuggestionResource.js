/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 12/03/12
 * Time: 18:38
 * To change this template use File | Settings | File Templates.
 */


var common = require('./common'),
    util  = require('util'),
    jest = require('jest'),
    models = require('../models');

ActionSuggestionResource = module.exports = common.GamificationMongooseResource.extend({

    init: function(){
        this._super(models.ActionSuggestion, 'action_suggestion');
        this.allowed_methods = ['get', 'post'];
    },

    create_obj:  function(){
        async.
    }
});
