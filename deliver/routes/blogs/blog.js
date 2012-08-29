var models = require('../../../models');
    _ = require('underscore');
module.exports = function (req, res) {

    console.log(req.params[0]);
    models.Article.find({user_id: req.params[0]})
        .populate('user_id')
        .exec(function(err,articles) {
            if(err) {
                throw err;
            }
            else{
                models.BlogTag.find({user_id: req.params[0]}, {'tag':1})
                    .sort({'popularity': 'descending'})
                    .exec(function(err, tags){
                        if (err)
                            throw err;
                        else{
                            res.render('blog.ejs', {
                                title:"בלוגים",
                                isBlog:true,
                                articles:articles,
                                tab:'articles',
                                blogger: articles[0].user_id,
                                fb_description:articles[0].text_field_preview || '',
                                fb_title:articles[0].title || '',
                                fb_image:articles[0].image_field && articles[0].image_field.url,
                                tags: tags
                            });
                        }
                    })
            }
        });
    };