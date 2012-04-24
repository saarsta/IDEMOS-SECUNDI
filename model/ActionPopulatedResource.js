/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 24/04/12
 * Time: 14:29
 * To change this template use File | Settings | File Templates.
 */
var action = require('./ActionResource'),
    models = require('../models');

var ActionPopulatedResource = module.exports = action.extend(
    {
        init:function () {
            this._super(models.Action, null, null)
            this.default_query = function(query){
                return query.populate("cycle_id");
            }
        }
    }
)
