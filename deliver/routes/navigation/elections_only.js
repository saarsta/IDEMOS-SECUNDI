var SignedRequest = require('facebook-signed-request');

module.exports = function(req, res){
    // The request body is in the form { "text": "" }. We only care about the text, of course.
    var body = Object.keys(req.body || {})[0];

    // For testing purposes only
    body = body || 'N6kOQIlbJqnF-fSxi1pjsPogYDw00rHyf-0E7LX3sDM.eyJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImlzc3VlZF9hdCI6MTM0NjI1NDczOSwicGFnZSI6eyJpZCI6IjQyMzg5NDM2MDk1NDg3NyIsImxpa2VkIjpmYWxzZSwiYWRtaW4iOmZhbHNlfSwidXNlciI6eyJjb3VudHJ5IjoiaWwiLCJsb2NhbGUiOiJlbl9VUyIsImFnZSI6eyJtaW4iOjIxfX19';

    var data = undefined;
    if (body) {
        var parser = new SignedRequest(body, { secret: req.app.settings.facebook_secret });
        parser.parse(function () { });
        if (parser.isValid) {
            data = parser.data;
        }
    }
    console.log('/elections_only data from Facebook: ' + JSON.stringify(data));

    req.app.locals({
        // Only show the facebook login bit if we have a current facebook user, i.e. we're running from inside Facebook
        show_facebook_login: !(data && data.user)
    })

    res.render('elections_only.ejs', {
        layout: false,
        url: req.url,
        user_logged: req.isAuthenticated(),
        user: req.session.user,
        avatar_url: req.session.avatar_url
    });
};