
var models = require('../../../models')
    ,DailyDiscussionResource = require('../../../api/DailyDiscussionResource.js')
    ,async = require('async')
    ,notifications = require('../../../api/notifications.js');

module.exports = function(req,res)
{
    var resource = new DailyDiscussionResource();
  //  var user = req.session.user;

    async.parallel([
        function(cbk)  {
            models.DailyDiscussion.findById(req.params[0], cbk)
         //   .populate('main_subject', {'name':1})
         //   .populate('discussion_id',{'title':1});
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
                    var related_discussion= results[0].discussion_id;
                    res.setHeader("Expires", "0");
                    res.render('daily_discussion.ejs',{
                        title:"דיון",
                        daily_discussion_id: req.params[0],
                        subject_id: req.query.subject_id,
                        tab:'discussions',
                        discussion: daily_discussion,
                        related_discussion:  related_discussion,
                        fb_description: daily_discussion.text_field_preview,
                        fb_title: daily_discussion.title,
                        fb_image:daily_discussion.image_field && daily_discussion.image_field.url

                    });
                }
            }
        });

};