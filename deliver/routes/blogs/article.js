var models = require('../../../models');

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
//                    article.text = (article.text).replace(/(<([^>]+?)>)/ig,"");
                    models.BlogTag.find({user_id: article.user_id}, {'tag':1})
                        .sort({'popularity': 1 ,'descending': 1})
                        .exec(function(err, tags){
                            if (err)
                                throw err;
                            else{
                                res.render('blog.ejs', {
                                    title: "בלוגים",
                                    isBlog: false,
                                    articles: [article],
                                    tab: 'articles',
                                    blogger: article.user_id,
                                    fb_description:article.text_field_preview || '',
                                    fb_title:article.title || '',
                                    fb_image:article.image_field && article.image_field.url,
                                    tags: tags
                                });
                            }
                        });
                }

            }
        });
};

