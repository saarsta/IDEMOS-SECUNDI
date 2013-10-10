
var models = require('../../models'),
    async = require('async'),
    notifications = require('../../api/notifications.js');

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
    var cycle_id = req.params || null;
    cycle_id = req.url == "/vote" ?'5098eb8bc492d10200000024' : cycle_id;
    cycle_id = req.url == "/smallgov" ?'508026e8cb2276020000001f' : cycle_id;
    cycle_id = req.url == "/health" ?'507c39809cba93020000003d' : cycle_id;
    cycle_id = req.url == "/agra" ?'5047023a9e56a502000014f5' : cycle_id;


    var join_on_page = req.query.join ? true : false;
    /*
    TODO:ADD code to join on server side if logged in

    if(req.query.join){
        if(req.isAuthenticated())  {
            models.User.update({_id:req.session.user._id}, {$addToSet:{cycles:{cycle_id:cycle_id, join_date:Date.now()}}}, function(err,count){
                 var t=9;
            });
//            models.Cycle.update({_id: cycle_id}, {$inc:{followers_count:1}},  function(err,count){
//
//            });
        }
        else
        {
            join_on_page=true;
        }
    }
      */

    async.parallel([
        //1. find cycle by id
        function(cbk){
            models.Cycle.findById(cycle_id)
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
                'sub_branding': 1,
                'social_popup': 1,
                'timeline':1,
                'fb_page':1,
                '_preview':1
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
                models.User.find({"cycles.cycle_id": cycle_id}, cbk);
        },

        // get the user object
        function (cbk) {
            cbk(null, req.user);
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

            var folowers = args[1] || [];

            var proxyJson = args[3] ? JSON.stringify(args[3].proxy) : null;
            var user_id = req.user ? req.user.id : 0;

            if(g_cycle && g_cycle.main_subject)
                g_cycle.subject_name = g_cycle.main_subject.name;
            g_cycle.is_user_follower_of_cycle = folowers.some(function(folower) {return folower.id == user_id});
            var description = g_cycle.text_field_preview || g_cycle.text_field;
            var no_tags_description = description.replace(/(<([^>]+?)>)/ig,"");

         //  var  view =  'cycle.ejs' ;
           var view =   g_cycle.id==   '5047023a9e56a502000014f5'?   'cycle_new.ejs' : 'cycle.ejs'  ;
           console.log(view)  ;
            res.render(view,{
                cycle: g_cycle,
                tab:'cycles',
                type: 'cycle',
                proxy:proxyJson,
                social_popup: g_cycle.social_popup,
                share:req.query.share ? true:false,
                join:join_on_page,
                meta:{
                    type:req.app.settings.facebook_app_name + ':cycle',
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
