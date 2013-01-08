  /*
print('quotes');
db.quotegamequotes.find().forEach(function(q){
    print(q.response.skip);


})


print('games');
db.quotegamegames.find().forEach(function(g){
    print(g);
})


print('users');
db.users.find({ quote_game: { $exists: true } }).forEach(function(g){

    print(g.quote_game.quotes_count);
})
*/
 print('quotes');
 db.quotegamequotes.find().forEach(function(q){
 q.response.skip=0
 q.response.positive  =0
 q.response.very_positive=0
 q.response.negative       =0
 q.response.very_negative    =0
 db.quotegamequotes.save(q);
 })


 print('games');
 db.quotegamegames.remove()


 print('users');
 db.users.find({ quote_game: { $exists: true } }).forEach(function(g){

 g.quote_game.games=[];
 g.quote_game.quotes_count=0;
 g.quote_game.quotes=[];
 db.users.save(g);
})





