
var j_forms = require('j-forms');
var async = require('async');
var models = require('../models');
var notifications = require('../api/notifications')
    ,AdminForm = require('admin-with-forms').AdminForm;

module.exports = AdminForm.extend({
    init:function(request,options,model) {
        this._super(request,options,model);


        this.static['js'].push('/node-forms/js/autocomplete.js');
    },

    get_fields: function() {
        this._super();
        this.fields['is_approved'].widget.attrs['readonly'] = 'readonly';
        this.fields['is_approved'].widget.attrs['disabled'] = 'disabled';
    },

    actual_save : function(callback)
    {
        var self = this;
        var base = this._super;

        var is_approved = self.instance.is_approved;
        var is_action_hidden_when_save = this.data.is_hidden ? true : false;
        var was_hidden_before = this.instance.is_hidden ? true : false;

        var save_action = function(){
            base.call(self, function(err, object){
                console.log(err);
                console.log(self.errors);
                console.log(object);

                //is approved sometimes changes when saving the form

                if( !err && (is_approved !== object.is_approved))
                    models.Action.update({_id: object._id}, {$set: {is_approved: is_approved}}, function(err, num){
                        callback(err, object);
                    });
                else
                    callback(err,object);
            });
        }
        if(was_hidden_before == true && is_action_hidden_when_save == false)
        {
            var is_cycle_hidden = false;
            var cycle_ids = _.map(this.instance.cycle_id, function(cycle_obj){
                return cycle_obj.cycle + "";
            });



            models.Cycle.find()
                .where('_id').in(cycle_ids)
                .where('is_hidden',true)
                .select({_id: 1})
                .exec(function(err, cycles){
                    if(!err){
                        if(cycles.length != 0){
                            var error = "trying to save action as not hidden, when one of the cycles it belong so to is hidden "
                            console.log(error);
                            callback(error);
                             //TODO add error
                        } else {
                            save_action();
                        }
                    }
                });
        }
        else
        {
            save_action();
        }
    }
});

