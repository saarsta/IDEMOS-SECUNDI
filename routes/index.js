exports.index = function(req, res){
        console.log(req.session.avatar_url);
        res.render('index.ejs', { title:'דף בית', logged: req.isAuthenticated(), user: req.session.user,
            avatar:req.session.avatar_url,
            big_impressive_title:"עורו",
            body_class:"",
            tab:'users',
            extra_head:{}})
};
