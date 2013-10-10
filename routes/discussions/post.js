
module.exports = function(req,res) {
    var discussion_id = req.params[0];
    var post_id = req.params[1];
    res.redirect('/discussions/' + discussion_id + '#post_' + post_id);
};