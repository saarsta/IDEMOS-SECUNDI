module.exports = function(req,res) {
    res.render('actions_list.ejs', {
        type: 'approved_action',
        social_popup: null,
        tab: "actions"
    });
};