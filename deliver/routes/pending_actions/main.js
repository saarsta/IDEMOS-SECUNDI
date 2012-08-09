
var models = require('../../../models'),
    async = require('async');

module.exports = function(req, res){

    async.parallel([
        function(cbk){
            models.Action.findById(req.params[0])
                .select([
                '_id',
                'type',
                'title',
                'text_field',
                'image_field',
                'tags',
                'location',
                'execution_date',
                'required_participants',
                'cycle_id'
            ])
            .populate('cycle_id', ['_id','title'])
            .exec(cbk);
        }
    ], function(err, args){

        if(err)
            res.render('500.ejs',{error:err});
        else {
            if(!action)
                res.render('404.ejs');
            else {
                res.render('pending_action.ejs',{
                    action:action,
                    tab:'actions'
                });
            }
        }
    });

};
