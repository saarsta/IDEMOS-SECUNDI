
var models = require('../../../models'),
    async = require('async');

/*
*  1. find cycle by id
*  2. find cycle followers
*  3.
*       3.1 for each follower find join date by finding the specific cycle in the list
*       3.2 sort followers - fb friends, proxies, followed by me, others
*  4. find opinion shapers
*  5. find proxy of user
*  final - render the cycle page
*
* */

module.exports = function(req, res){

    var g_cycle;

    async.parallel([
        //1. find cycle by id
        function(cbk){
            models.Cycle.findById(req.params[0])
            .select({
                '_id':1,
                'subject':1,
                'main_subject':1,
                'title':1,
                'discussion_title':1,
                'text_field':1,
                'text_field_preview': 1,
                'image_field':1,
                'discussions':1,
                'tags':1,
                'opinion_shapers': 1,
                'followers_count': 1,
                'sub_branding_image': 1,
                'sub_branding_logo': 1,
                'sub_branding_title': 1,
                'sub_branding_text': 1,
                'sub_branding_link': 1,
                'social_popup_title': 1,
                'social_popup_text': 1

            })
            .populate('opinion_shapers.user_id', {
                '_id':1,
                'first_name':1,
                'last_name':1,
                'avatar': 1,
                'facebook_id':1,
                'avatar_url':1,
                'score':1,
                'num_of_proxies_i_represent':1,
                'opinion_text':1
                })
            .populate('main_subject', {'name':1})
            .exec(cbk);
        },

        //find cycle followers
        function(cbk){
                models.User.find({"cycles.cycle_id": req.params[0]}, cbk);
        },

        // get the user object
        function (cbk) {
            if (req.session.user)
                models.User.findById(req.session.user._id, cbk);
            else {
                cbk(null, null);
            }
        }

       //final - render the cycle page
    ], function(err, args){

        if(err)
            res.render('500.ejs',{error:err});
        else if (!args[0]){
                res.redirect('/cycles');
        }
        else {

            g_cycle = args[0];
            _.each(g_cycle.opinion_shapers, function(opinion_shaper){ if(opinion_shaper.user_id)  opinion_shaper.user_id.avatar_url = opinion_shaper.user_id.avatar_url();});

            var users = args[1] || [];

            var proxyJson = args[3] ? JSON.stringify(args[3].proxy) : null;
            var user_id = req.session.user ?  req.session.user._id + "" : 0;

            if(g_cycle && g_cycle.main_subject)
                g_cycle.subject_name = g_cycle.main_subject.name;
            g_cycle.is_user_follower_of_cycle = _.any(users, function(user){return user._id + "" == (req.session.user ? req.session.user._id : 0)});
            var description = g_cycle.text_field_preview || g_cycle.text_field;
            var no_tags_description = description.replace(/(<([^>]+?)>)/ig,"");
            res.render('cycle.ejs',{
                cycle: g_cycle,
                tab:'cycles',
                type: 'cycle',
                proxy:proxyJson,
                social_popup_title: g_cycle.social_popup_title,
                social_popup_text: g_cycle.social_popup_text,
                meta:{
                    type:'cycles',
                    title:g_cycle.title,
                    description: no_tags_description,
                    image: (g_cycle.image_field_preview && g_cycle.image_field_preview.url) || (g_cycle.image_field && g_cycle.image_field.url),
                    link:'/cycles/' + g_cycle.id,
                    id:g_cycle.id
                }
            });
        }
    })
};
