
var stat=new Array(300);
db.quotegamegames.find().forEach(function(can){

    if  (!stat[can.quote_count]) {
        stat[can.quote_count]=0
    }
    stat[can.quote_count]++;
})

for(var i=0; i<stat.length; i++){
  // if(stat[i]) print(i+','+stat[i]);
};


var qs=[];
db.quotegamequotes.find().forEach(function(q){

    //print(q.quote);
    var sum=   q.response.positive +q.response.very_positive +q.response.negative + q.response.very_negative;
    if(sum>0) {
        var positive =     q.response.positive +  q.response.very_positive ;
        var negative=   q.response.negative  +   q.response.very_negative ;

        var f_sum =       q.response.positive +  2*q.response.very_positive  + q.response.negative  +   2*q.response.very_negative;
        var f_positive =     q.response.positive +  2*q.response.very_positive ;
        var f_negative=   q.response.negative  +   2*q.response.very_negative ;

        var positive_fraction=Math.round(100*(positive/sum));
        var negative_fraction=Math.round(100*(negative/sum));
        var f_positive_fraction=Math.round(100*(f_positive/f_sum));
        var f_negative_fraction=Math.round(100*(f_negative/f_sum));
        qs.push({quote:q. quote,total:sum ,positive_fraction:positive_fraction,negative_fraction:negative_fraction,f_positive_fraction:f_positive_fraction,f_negative_fraction:f_negative_fraction})

    }

})

qs= qs.sort(compare_p);
for(var i=0; i<qs.length; i++){
   print ('"'+qs[i].quote.replace('"','_')+'",'+qs[i].total +','+qs[i].positive_fraction +'%'+','+qs[i].f_positive_fraction +'%') ;
};


// objs.sort(compare);
function compare_p(a,b) {
    if (a.positive_fraction < b.positive_fraction) return 1;
    if (a.positive_fraction > b.positive_fraction) return -1;
    return 0;
}

function compare_pf(a,b) {
    if (a.f_positive_fraction < b.f_positive_fraction) return 1;
    if (a.f_positive_fraction > b.f_positive_fraction) return -1;
    return 0;
}

