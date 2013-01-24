var models = require('../../../models')
    ,async = require('async')
    ,_ = require('underscore')

    ,http = require('http')
    ,fs = require('fs')
    ,url = require('url')
    ,notifications = require('../../../api/notifications.js');

module.exports = function(req, res){


    res.render('test.ejs');
};