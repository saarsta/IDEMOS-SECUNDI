module.exports = function(req,res) {
    res.render('actions_list.ejs', {
        type: 'approved_action',
        social_popup_title: "",
        social_popup_text: ""
    });
};