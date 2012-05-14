/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 13/03/12
 * Time: 15:36
 * To change this template use File | Settings | File Templates.
 */



/*exports.index = function(req, res){
    res.render('index.ejs', { title: 'Express' })
};*/

var models = require('../models');

exports.index = function(req, res){
    console.log(req.session.avatar_url);
    res.render('index.ejs', { title:'דף בית', logged: req.isAuthenticated(), user: req.session.user,
        avatar:req.session.avatar_url,
        big_impressive_title:"עורו",
        body_class:"",
        tab:'users',
        extra_head:{}})
};



exports.myUru = function(req,res)
{
    res.render('my_uru.ejs',{
        title:'הדף שלי',
        user: req.session.user,
        logged:true,
        avatar:req.session.avatar_url,
        body_class:'layout',
        big_impressive_title:"כותרת גדולה ומרשימה",
        extra_head:'',
        tag_name: req.query.tag_name,
        tab:'users',
        hide_block_user:false,
        extra_head:'<script src="/javascripts/myUru.js"></script>'

    });

};

exports.hisUru = function(req,res)
{
    var user_id = req.params.id;
    models.User.findById(user_id,function(err,user)
    {
        if(err)
            res.send('internal error',500);
        else
        {
            if(!user)
            {
                res.send('user doesnt exists',400);
            }
            else
            {
                res.render('his_uru.ejs',{
                    title:'הדף שלו',
                    user: req.session.user,
                    other_user : user,
                    logged:true,
                    avatar:req.session.avatar_url,
                    body_class:'layout',
                    big_impressive_title:"כותרת גדולה ומרשימה",
                    tag_name: req.query.tag_name,
                    tab:'users',
                    extra_head:'<script src="/javascripts/hisUru.js"></script>'

                });
            }
        }
    });
};

