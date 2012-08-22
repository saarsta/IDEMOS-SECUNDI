
var models = require('../../../models')
    ,DiscussionResource = require('../../../api/discussions/DiscussionResource.js')
    ,async = require('async');

module.exports = function(req,res)
{
    var resource = new DiscussionResource();

    async.parallel([
        // get the user object
        function(cbk) {
            if(req.session.user)
                models.User.findById(req.session.user._id, cbk);
            else
            {
                console.log('no user on session!');
                console.log(req.session);
                console.log("req.session.user_id");
                console.log(req.session.user_id);

                cbk(null, null);
            }
        },
        // get the discussion object
        function(cbk)  {
            models.Discussion.findById(req.params[0], cbk);
        }
    ],
        function(err, results)
        {
            if(err)
                res.render('500.ejs',{error:err});
            else
            {
                if(!results[1])
                    res.redirect('/discussions');
                else
                {
                    // populate 'is follower' , 'grade object' ...
                    resource.get_discussion(results[1],results[0],function(err,discussion)
                    {

                        var proxyJson= results[0] ?  JSON.stringify(results[0].proxy) : null;
                        console.log(proxyJson)   ;
                        if(err)
                            res.render('500.ejs',{error:err});
                        else
                        {
                            res.setHeader("Expires", "0");
                            res.render('discussion.ejs',{
                                title:"דיון",
                                discussion_id: req.params[0],
                                subject_id: req.query.subject_id,
                                tab:'discussions',
                                discussion: discussion,
                                proxy:proxyJson,
                                fb_description: discussion.text_field_preview,
                                fb_title: discussion.title,
                                fb_image:discussion.image_field && discussion.image_field.url

                            });
                        }
                    });
                }
            }
        });

};