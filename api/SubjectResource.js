/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 16/02/12
 * Time: 11:00
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    models = require('../models'),
    common = require('./common');

var SubjectResource = module.exports = resources.MongooseResource.extend({
    init:function(){
        this._super(models.Subject);
        this.allowed_methods = ['get'];
        this.filtering = {tags:null};
        this.max_limit = 8;
        this.default_query = function(query){
            return query.sort({'is_uru':-1,gui_order:1});
        };
    },
    get_objects:function(req,filters,sorts,limit,offset,callback) {
        this._super(req,filters,sorts,limit,offset,function(err,rsp) {
            if(rsp)
            {
                if(rsp.meta.total_count != 8)
                    console.error('there should always be 8 subjects');

                if(!_.any(rsp.objects,function(subject) {
                    return subject.is_uru;
                })) {
                    console.log('creating uru subject');
                    var uru_subject = new models.Subject();
                    uru_subject.name = 'עורו';
                    uru_subject.description = 'עורו זה נושא מונפץ';
                    uru_subject.is_uru = true;
                    uru_subject.save(function(err,subject) {
                        if(subject){
                            rsp.meta.total_count++;
                            rsp.objects.push(subject);
                        }
                        callback(err,rsp);
                    });
                    return;
                }
            }
            callback(err,rsp);
        });
    }
});