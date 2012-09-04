
var models = require('../../../models');

module.exports = function(req,res)
{
    // get subject
    models.Cycle.findById(req.params[0],function(err,cycle)
    {
        // render whatever
        console.log(cycle)   ;
    });
};