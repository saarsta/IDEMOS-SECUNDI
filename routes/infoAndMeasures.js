var models = require('../models');

module.exports = function(router)
{

    router.get('',function(req, res){
        res.render('infoAndMeasures.ejs',{logged: req.isAuthenticated(), title:'מידע ומדדים', big_impressive_title:"כותרת גדולה ומרשימה",
            user: req.session.user,
            avatar:req.session.avatar_url,
            tag_name: req.query.tag_name,
            tab:'information_items',
            extra_head:'<script src="/javascripts/infoAndMeasures.js"></script>'});
    });

    router.get('/subject/:id', function(req, res){
        models.Subject.findById(req.params.id,function(err,subject)
        {
            res.render('selectedSubjectPage.ejs',{title:'מידע ומדדים', logged: req.isAuthenticated(),
                big_impressive_title:"",
                subject_id: req.params.id,
                subject_name: subject.name,
                tag_name: req.query.tag_name,
                user: req.session.user,
                avatar:req.session.avatar_url,
                body_class:'layout1',
                tab:'information_items',
                extra_head:'<script src="/javascripts/selectedSubjectPage.js"></script>'});
        });
    });

    router.get('/:id', function(req, res){
        models.InformationItem.findById(req.params.id).populate('subject_id').run(function(err,item)
        {
            res.render('selectedItem.ejs',{title:'מידע ומדדים', logged: req.isAuthenticated(),
                big_impressive_title:"",
                tag_name: req.query.tag_name,
                info: item,
                user: req.session.user,
                avatar:req.session.avatar_url,
                body_class:'layout1',
                tab:'information_items',
                extra_head:'<script src="/javascripts/selectedItem.js"></script>'});
        });
    });
};

