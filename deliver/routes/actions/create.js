module.exports = function (req, res) {
    var id = req.params.cycle_id;
    console.log('create action for cycle id ' + id);

    res.render('action_create.ejs',{
        cycle_name: 'חייבים להציל את הקיפודים'
    });
};