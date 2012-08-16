var models = require('../../../models'),
    async = require('async');

module.exports = function(req, res){


    async.waterfall([
        function(cbk){
            models.Update.findById(req.params[0])
                .select({
                    '_id':1,
                    'title':1,
                    'tooltip':1,
                    'title':1,
                    'text_field':1,
                    'image_field':1,
                    'tags':1,
                    'creation_date':1
                })
                .exec(cbk);
        }
    ], function(err, update){
        if(err)
            res.render('500.ejs',{error:err});
        else {
            res.render('update.ejs',{
                update: update,
                meta:{
                    type:'updates',
                    title:update.title,
                    description:update.text_field,
                    image: (update.image_field_preview && item.image_field.url),
                    link:'/updates/' + update.id,
                    id:update.id,

                }
            });
        }
    })
};
