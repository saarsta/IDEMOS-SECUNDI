var j_forms = require('j-forms');
var models = require('../models')
    ,AdminForm = require('admin-with-forms').AdminForm;

    async = require('async');
module.exports = AdminForm.extend({
    get_fields: function() {
        this._super();
        if(this.fields['agrees'])
            this.fields['agrees'].widget.attrs['readonly'] = 'readonly';
        if(this.fields['not_agrees'])
            this.fields['not_agrees'].widget.attrs['readonly'] = 'readonly';
    },

    render_ready:function(callback) {
        var self = this;
        this._super(function(err) {

            var instance = self.instance;
            self.char_count = instance.getCharCount();

            async.waterfall([
                function(cbk){
                    models.Discussion.findById(instance.discussion_id, cbk);
                },

                function(discussion_obj, cbk){
                    if(discussion_obj){
                        self.discussion_thresh = Number(discussion_obj.admin_threshold_for_accepting_change_suggestions) || discussion_obj.threshold_for_accepting_change_suggestions;
                        self.num_of_graders = discussion_obj.evaluate_counter;
                        self.grade = discussion_obj.grade;
                    }
                    cbk();
                }
            ], function(err, result){

                callback(err);
            });
        });


    },
    render:function(res,options) {
        var self = this;
        this._super(res,options);
        res.write(
                "<p>number of graders = " + self.num_of_graders + "</p>" +
                    "<p>avg grade = " + self.grade + "</p>" +
                    "<p>char counter = " + self.char_count + "</p>" +
                    "<p>suggestion threshold= " + self.instance.threshold_for_accepting_the_suggestion + "</p>" +
                    "<p>discussion threshold = " + self.discussion_thresh + "</p>"
        );
    }
});