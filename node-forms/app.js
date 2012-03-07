

var express = require('express'),
    mongoose = require('mongoose'),
    admin = require('./admin'),
    models = require('./models');

mongoose.connect('mongodb://localhost/admin_test');

var app = express.createServer();

app.use(express.bodyParser());
app.use(express.methodOverride());

var adm = new admin.Admin('/admin',app);

adm.register_admin('books',new admin.MongooseAdminResource(models.Book,{list_fields:['id','name','author']}));
adm.register_admin('authors',new admin.MongooseAdminResource(models.Author,{list_fields:['id','name']}));

app.listen(80);