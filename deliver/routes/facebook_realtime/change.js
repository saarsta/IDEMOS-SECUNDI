module.exports = function(req, res){
    console.log('*************** facebook change ***********');
    console.log(req.body);
    console.log(req.body.entry[0].changed_fields);
    console.log('*******************************************');
    res.write('');
    res.end();

}