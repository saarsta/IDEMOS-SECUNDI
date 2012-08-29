var models = require('../../../models');
    _ = require('underscore')
    , async = require('async');
module.exports = function (req, res) {

    console.log(req.params[0]);
    models.Article.find({user_id: req.params[0]})
        .populate('user_id')
        .exec(function(err,articles) {
            if(err) {
                throw err;
            }
            else{

               async.parallel([
                   function(cbk){
                       if(req.user)
                           models.User.findById(req.user._id, cbk);
                       else
                           cbk(null, null);

                   },

                    function(cbk){
                        models.BlogTag.find({user_id: req.params[0]}, {'tag':1})
                            .sort({'popularity': 'descending'})
                            .exec(function(err, tags){cbk(err, tags)});
                    }
               ], function(err, args){
                   if (err)
                       throw err;
                   else{

                       var user = args[0];

                       if(user){
                           articles[0].is_blog_follower = _.any(user.blogs, function(blog){return blog.blog_id + "" == articles[0].user_id.id});
                           articles[0].is_blog_follower_by_mail = _.any(user.blogs, function(blog){return blog.blog_id + "" == articles[0].user_id.id});
                       }

                       res.render('blog.ejs', {
                           title:"בלוגים",
                           isBlog:true,
                           articles:articles,
                           tab:'articles',
                           blogger: articles[0].user_id,
                           fb_description:articles[0].text_field_preview || '',
                           fb_title:articles[0].title || '',
                           fb_image:articles[0].image_field && articles[0].image_field.url,
                           tags: args[1]
                       });
                   }
               })

            }
    });
}