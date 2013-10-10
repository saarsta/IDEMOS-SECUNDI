
var models = require('../../models');

module.exports = function(req,res) {
    var request_ids = (req.query.request_ids || '').split(',');

    if(request_ids && request_ids.length) {

        models.FBRequest.getLink(request_ids,function(err,link) {
            if(err) {
                console.error(err);
                console.trace();
            }
            var redirect_to = req.app.settings.root_path + '/';

            if(link) {
                redirect_to = link.link;

                if(link.creator) {
                    var referrer = 'referrer=' + link.creator;
                    if(redirect_to.indexOf('?') > -1)
                        redirect_to += '&' + referrer;
                    else
                        redirect_to += '?' + referrer;
                }
            }
            console.log(redirect_to);

            res.render('redirect.ejs',{redirect_to:redirect_to, layout:false});

        });
    }
    else
        res.render('redirect.ejs',{redirect_to:req.app.settings.root_path, layout:false});

};