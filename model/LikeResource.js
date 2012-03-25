/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 21/03/12
 * Time: 10:48
 * To change this template use File | Settings | File Templates.
 */

var jest = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async');

/*
var LikeResource = module.exports = common.GamificationMongooseResource.extend({
    init:function(){
        this._super(models.Like,'vote');
        this.allowed_methods = ['get','post'];
        //    this.authorization = new Authoriztion();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id: null};
    },*/
