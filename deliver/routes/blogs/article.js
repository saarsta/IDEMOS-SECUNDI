var models = require('../../../models'),
    async = require('async');

module.exports = function(req,res) {
    console.log(req.params[0]);
    models.Article.findById(req.params[0])
        .populate("user_id")
        .exec(function(err,article) {
            if(err) {
                res.render('500.ejs',{});
            }
            else {
                if(!article)
                    res.render('404.ejs',{});
                else{
                    async.parallel([
                        function(cbk){
                            if(req.session.user)
                                 models.User.findById(req.session.user._id, cbk);
                            else
                                cbk(null, null);

                        },

                        function(cbk){
                            models.BlogTag.find({user_id: article.user_id}, {'tag':1})
                                .sort({'popularity': 1 ,'descending': 1})
                                .exec(function(err, tags){cbk(err, tags)});
                        }
                    ], function(err, args){

                            if (err)
                                throw err;
                            else{

                                var user = args[0];

                                if(user){
                                    article.is_blog_follower = _.any(user.blogs, function(blog){return blog.blog_id + "" == article.user_id.id});
                                    article.is_blog_follower_by_mail = _.any(user.blogs_email, function(blog){return blog.blog_id + "" == article.user_id.id});
                                }

                                res.render('blog.ejs', {
                                    title: "בלוגים",
                                    isBlog: false,
                                    articles: [article],
                                    tab: 'articles',
                                    blogger: article.user_id,
                                    fb_description:article.text_field_preview || '',
                                    fb_title:article.title || '',
                                    fb_image:article.image_field && article.image_field.url,
                                    tags: args[1]
                                });
                            }
                        });
                }

            }
        });
};

