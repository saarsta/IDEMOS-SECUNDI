
/*
 * GET home page.
 */

exports.index = function(req, res){
        res.render('index', { title: 'Express' })
};

//exports.test = function(req, res){
//    res.render('test', { title: 'The test page', content: 'this is my content', html: '<p><b>this is</b> my html</p>', id : req.params.id })
//};


