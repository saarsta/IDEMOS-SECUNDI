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
            this._super();
            this.allowed_methods = ['get'];
            this.default_query = function(query){
                return query.populate("cycle_id");
            }
        }
    }

        /*get_object: function (req, id, callback) {

                req.query = function(query){
                    return query.populate("cycle_id");
                }



            this._super(req, id, callback);

        }
    }*/
)
