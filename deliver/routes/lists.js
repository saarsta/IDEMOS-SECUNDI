
exports.listOf = function(req,res,type,template_name,title,list_title,sorts)
{
   res.render('lists.ejs',{logged: req.isAuthenticated(),
       item_type:type,
       title:title, list_title:list_title,
       user: req.session.user,
       avatar:req.session.avatar_url,
       tag_name: req.query.tag_name || '',
       template_name: template_name,
       body_class:'layout',
       sorts:sorts||[],
       tab:type,
       extra_head:'<script src="/resources/js/jquery.stylish-select.min.js"></script><script src="/resources/js/selectbox.js"></script><script src="/javascripts/lists.js"></script>'});
};

exports.pendingActions = function(req, res){
    exports.listOf(req,res,'actions','pending_action_list_item',"כותרת שקשורה לכל הפעולות","רשימת כל הפעולות הממתינות לאישור",
        [
            {value:'-execution_date', label:'תאריך'},
            {value:'-creation_date', label:'תאריך פתיחה'},
            {value:'-num_of_going', label:'מספר משתתפים'},
            {value:'-grade', label:'ציון'}
        ]);
};

exports.actions = function(req, res){
    exports.listOf(req,res,'actions','action_list_item','כותרת שקשורה לכל הפעולות',"רשימת כל הפעולות במערכת",
        [
            {value:'-execution_date', label:'תאריך'},
            {value:'-creation_date', label:'תאריך פתיחה'},
            {value:'-num_of_going', label:'מספר משתתפים'}
        ]);
};

exports.discussions = function(req, res){
    exports.listOf(req,res,'discussions','discussion_list_item','כותרת שקשורה לכל הדיונים',"רשימת כל הדיונים במערכת",[
        {value:'-followers_count', label:'מספר עוקבים'},
        {value:'-grade', label:'ציון'},
        {value:'-creation_date', label:'תאריך פתיחה'}
    ]);
};

exports.cycles = function(req, res){
    exports.listOf(req,res,'cycles','cycle_list_item','כותרת שקשורה לכל מעגלי התנופה',"רשימת כל מעגלי התנופה",
        [
            {value:'-followers_count', label:'מספר עוקבים'},
            {value:'-creation_date', label:'תאריך פתיחה'}
        ]);
};
