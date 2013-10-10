
var models = require('../../models');

module.exports = function(req,res,params) {
  var post_id = params[2];
    models.Post.findById(post_id)
        .populate('discussion_id')
        .exec(function(err,post) {
        if(err) {
            res.render('500.ejs');
            return;
        }

        if(!post) {
            res.render('404.ejs');
            return;
        }

        res.render('fb_bot/post.ejs',{
            meta: {
                type:'comment',
                id:post.id,
                image:post.discussion_id && ((post.discussion_id.image_field_preview && post.discussion_id.image_field_preview.url) ||
                    (post.discussion_id.image_field && post.discussion_id.image_field.url)),
                title:post.discussion_id && post.discussion_id.title,
                description:post.text,
                link:post.discussion_id && ('/discussions/' + post.discussion_id.id + '/post/' + post.id)
            },
            post:post
        });
    });
};