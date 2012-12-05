/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 24/04/12
 * Time: 18:04
 * To change this template use File | Settings | File Templates.
 */

var common = require('./common'),
    models = require('../models'),
    _ = require('underscore'),
    jest = require('jest');

var UpdateResource = module.exports = jest.MongooseResource.extend(
    {
        init: function () {
            this._super(models.Update, null, null);
            this.allowed_methods = ['get'];
            this.authentication = new common.SessionAuthentication();
            this.filtering = {cycle: null};
            this.fields = {
                title: null,
                tooltip: null,
                text_field: null,
                text_field_preview: null,
                image_field: null,
                tags: null,
                cycle: null,
                creation_date: null
            }
            this.default_query = function (query) {
                return query.where('is_visible', true).sort({creation_date: 'descending'});
            };
        },

        get_objects: function (req, filters, sorts, limit, offset, callback) {
            this._super(req, filters, sorts, limit, offset, function(err, results){
                _.each(results.objects, function(update){ if(!update.text_field_preview) update.text_field_preview = update.text_field});
                callback(err, results);
            });
        }
    }
)
