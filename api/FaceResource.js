
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
        get_objects:function (req, filters, sorts, limit, offset, callback) {

            this._super(req, filters, sorts, limit, offset, function (err, results) {

                if(err) {
                    callback(err);
                }
                else {

                    var final_results=JSON.parse(JSON.stringify(results));
                    var status           =req.query.status || null;

                    if(status){
                        final_results.objects=[];
                        _.each(results.objects,function(o){

                            if(o.status==status)  {
                                final_results.objects.push(o);
                            }
                        });
                    }
                    else{
                        final_results.objects=[];
                        _.each(results.objects,function(o){

                            if(o.status!='denied')  {
                                final_results.objects.push(o);
                            }
                        });
                    }
                    final_results.meta.total_count=final_results.objects.length;
                    callback(err, final_results);
                }


            });
        }   ,
        update_obj:function (req, object, callback) {

            //var face_id         =req.body.id;
            //var face_status        =req.body.status;
            object.status=   req.body.status;
            object.save(function(err, result){
                callback(err, result);
            });
            /*
            models.Face.update({_id: face_id}, {  $set:{ status: face_status } },  function(err,count)
            {
                callback(err,count);
            });
            */

        }

    }
)

