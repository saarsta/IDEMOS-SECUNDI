
var models = require('../../../models')
    ,DiscussionResource = require('../../../api/DiscussionResource')
    ,async = require('async');

module.exports = function(req,res)
{
    var resource = new DiscussionResource();

    async.parallel([
        // get the user object
        function(cbk) {
            if(req.session.user)
                models.User.findById(req.session.user._id,cbk);
            else
                cbk(null, null);
        },
        // get the discussion object
        function(cbk)  {
            models.Discussion.findById(req.params[0], cbk);
        }
    ],
        function(err,results)
        {
            if(err)
                res.render('500.ejs',{error:err});
            else
            {
                // populate 'is follower' , 'grade object' ...
                resource.get_discussion(results[1],results[0],function(err,discussion)
                {
                    if(err)
                        res.render('500.ejs',{error:err});
                    else
                    {
                        if(!discussion)
                            res.redirect('/discussions');
                        else
                        {
                            res.setHeader("Expires", "0");
                            res.render('discussion.ejs',{
                                layout: false,
                                title:"דיון",
                                user_logged: req.isAuthenticated(),
                                discussion_id: req.params[0],
                                subject_id: req.query.subject_id,
                                user: req.session.user,
                                avatar:req.session.avatar_url,
                                tab:'discussions',
                                discussion: discussion,
                                url: req.url
                            });
                        }
                    }
                });
            }
        });

};