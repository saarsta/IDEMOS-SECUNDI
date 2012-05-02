var models = require('../../models'),
    async = require('async');

module.exports = function(router)
{

    router.get('',function(req, res){
        res.render('infoAndMeasures.ejs',{logged: req.isAuthenticated(), title:'מידע ומדדים', big_impressive_title:"כותרת גדולה ומרשימה",
            user: req.session.user,
            avatar:req.session.avatar_url,
            tag_name: req.query.tag_name,
            tab:'information_items'
        });
    });

    router.get('/subject/:id', function(req, res){
        models.Subject.findById(req.params.id,function(err,subject)
        {
            res.render('selectedSubjectPage.ejs',{title:'מידע ומדדים', logged: req.isAuthenticated(),
                big_impressive_title:"",
                subject_id: req.params.id,
                subject_name: subject.name,
                keywords: req.query.keywords || '',
                tag_name : req.query.tag_name || '',
                user: req.session.user,
                avatar:req.session.avatar_url,
                body_class:'layout1',
                tab:'information_items'
            });
        });
    });

    router.get('/:id', function(req, res){

        async.parallel([
            function(cbk)
            {
                if(req.session.user){
                    models.Like.find({user_id: req.session.user._id, info_item_id: req.params.id}, function(err, obj){
                        var is_like = obj.length ? true : false;
                        cbk(err,is_like);
                    });
                }
                else
                    cbk(null,false);
            },
            function(cbk)
            {
                models.InformationItem.findById(req.params.id).populate('subject_id').run(cbk);
            }],
            function(err,results)
            {
                if(!err)
                    res.render('selectedItem.ejs',{title:'מידע ומדדים', logged: req.isAuthenticated(),
                        big_impressive_title:"",
                        tag_name: req.query.tag_name,
                        info: results[1],
                        user_like:results[0],
                        user: req.session.user,
                        avatar:req.session.avatar_url,
                        body_class:'layout1',
                        tab:'information_items'});
                else
                    res.send('error',500);
            });
    });
};

