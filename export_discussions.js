db.discussions.find().forEach(function(obj){

    print( obj._id+" , "+ obj.title );

})