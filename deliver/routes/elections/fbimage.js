var request = require('request');
var qs = require('querystring');
var models = require('../../../models');


module.exports = function(req, res) {


   res.render('fbimage.ejs',
    {
        layout: false,
        url:req.url,
        items:[{title:"חינוך טוב יותר",text:"תוגדל ההשקעה בתגמול והכשרת מורים ובכיתות קטנות"},{title:"חינוך טוב יותר",text:"תוגדל ההשקעה בתגמול והכשרת מורים ובכיתות קטנות"},{title:"חינוך טוב יותר",text:"תוגדל ההשקעה בתגמול והכשרת מורים ובכיתות קטנות"},{title:"חינוך טוב יותר",text:"תוגדל ההשקעה בתגמול והכשרת מורים ובכיתות קטנות"},{title:"חינוך טוב יותר",text:"תוגדל ההשקעה בתגמול והכשרת מורים ובכיתות קטנות"}]

    });

};

