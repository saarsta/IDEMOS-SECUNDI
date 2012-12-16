

var models = require('../../../models')
    ,DailyDiscussionResource1 = require('../../../api/DailyDiscussionResource1.js')
    ,async = require('async')
    ,notifications = require('../../../api/notifications.js');

module.exports = function(req,res)
{
    var resource = new DailyDiscussionResource1();
  //  var user = req.session.user;

    async.parallel([
        function(cbk)  {
            models.DailyDiscussion.findById(req.params[0], cbk)
            .populate('subject', {'name':1})
            .populate('cycle')
            .populate('discussion');
        }
    ],
        function(err, results)
        {
            if(err)
                res.render('500.ejs',{error:err});
            else
            {
                if(!results[0])
                    res.redirect('/daily_discussions');
                else
                {
                    var daily_discussion=results[0];
                    res.setHeader("Expires", "0");
                    res.render('daily_discussion.ejs',{
                        title:"דיון",
                        daily_discussion_id: req.params[0],
                        tab:'discussions',
                        discussion: daily_discussion,
                        fb_description: daily_discussion.text_field_preview,
                        fb_title: daily_discussion.title,
                        fb_image:daily_discussion.image_field && daily_discussion.image_field.url ,
                        meta: {
                            type: req.app.settings.facebook_app_name + ':discussion',
                            id: daily_discussion.id,
                            image: daily_discussion.image_field.url,
                            title: daily_discussion.title  ,
                            description: ' ',
                            link: '/daily_discussions/' + daily_discussion.id
                        }
                    });
                }
            }
        });

};
