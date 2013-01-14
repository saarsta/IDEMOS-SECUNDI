
var stat=new Array(200);
db.quotegamegames.find().forEach(function(can){

    if  (!stat[can.quote_count]) {
        stat[can.quote_count]=0
    }
    stat[can.quote_count]++;
})

for(var i=0; i<stat.length; i++){
   if(stat[i]) print(i+','+stat[i]);
};

