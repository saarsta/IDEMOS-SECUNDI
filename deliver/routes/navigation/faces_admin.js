module.exports = function(req, res){


    //502100e92066a502000009a9
    ['501e73147555f6020000691a','502100e92066a502000009a9','501e72d57555f60200006804','4fc48d7cd9e6240100002c9b','501e5e6c78c8270200000995']
    res.render('faces_admin.ejs', {
        layout: false,
        url: req.url,
        user_logged: req.isAuthenticated(),
        user: req.session.user,
        avatar_url: req.session.avatar_url
    });
};