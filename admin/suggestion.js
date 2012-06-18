var j_forms = require('j-forms');
    models = require('../models');
    async = require('async');
module.exports = j_forms.forms.AdminForm.extend({
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
                    self.discussion_thresh = Number(discussion_obj.admin_threshold_for_accepting_change_suggestions) || discussion_obj.threshold_for_accepting_change_suggestions;
                    self.num_of_graders = discussion_obj.evaluate_counter;
                    self.grade = discussion_obj.grade;
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