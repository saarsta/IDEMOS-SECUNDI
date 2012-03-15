var querystring = require('querystring'),
    Url = require('url'),
    sys = require('sys'),
    MongooseAdmin = require('../../mongoose-admin.js'),
    forms = require('../../../node-forms/forms');
 //   Renderer = require('../renderer.js').Renderer;

var adminTitle = 'Spilon Backoffice';

exports.index = function(req, res) {
    var adminUser = req.session._mongooseAdminUser ? MongooseAdmin.userFromSessionStore(req.session._mongooseAdminUser) : null;
    if (!adminUser) {
        res.redirect(MongooseAdmin.singleton.buildPath('/login'));
    } else {
        MongooseAdmin.singleton.getRegisteredModels(function(err, models) {
            if (err) {
                res.redirect('/error');
            } else {
                var config = MongooseAdmin.singleton.pushExpressConfig();
                res.render('models.jade',
                           {layout: 'adminlayout.jade',
                            locals: {
                                'pageTitle': 'Admin Site',
                                'models': models,
                                'renderedHead': '',
                                'adminTitle':adminTitle,
                                'rootPath': MongooseAdmin.singleton.root
                            }
                           });
                MongooseAdmin.singleton.popExpressConfig(config);
            }
        });
    }
};

exports.login = function(req, res) {
    var config = MongooseAdmin.singleton.pushExpressConfig();
    res.render('login',
               {layout: 'anonlayout.jade',
                locals: {
                      'pageTitle': 'Admin Login',
                       'rootPath': MongooseAdmin.singleton.root
                }
               });
    MongooseAdmin.singleton.popExpressConfig(config);
};

exports.logout = function(req, res) {
    req.session._mongooseAdminUser = undefined;
    res.redirect(MongooseAdmin.singleton.buildPath('/'));
};

exports.model = function(req, res) {
    var query = querystring.parse(Url.parse(req.url).query);
    var start = query.start ? parseInt(query.start) : 0;
    var count = query.count ? parseInt(query.count) : 50;


    var adminUser = req.session._mongooseAdminUser ? MongooseAdmin.userFromSessionStore(req.session._mongooseAdminUser) : null;
    if (!adminUser) {
        res.redirect('/login');
    } else {
        MongooseAdmin.singleton.getRegisteredModels(function(err, models) {
            if (err) {
                res.redirect('/');
            } else {
                MongooseAdmin.singleton.getModel(req.params.modelName, function(err, model, fields, options) {
                    if (err) {
                        res.redirect('/error');
                    } else {
                        if(model.is_single)
                        {
                            res.redirect(req.path.split('/model/')[0]);
                            return;
                        }
                        MongooseAdmin.singleton.modelCounts(req.params.modelName, function(err, totalCount) {
                            if (err) {
                                res.redirect('/');
                            } else {
                                MongooseAdmin.singleton.listModelDocuments(req.params.modelName, start, count, function(err, documents) {
                                    if (err) {
                                        res.redirect('/');
                                    } else {
                                        var config = MongooseAdmin.singleton.pushExpressConfig();
                                        res.render('model.jade',
                                                   {layout: 'adminlayout.jade',
                                                    locals: {
                                                        'pageTitle': 'Admin - ' + model.modelName,
                                                        'models': models,
                                                        'totalCount': totalCount,
                                                        'modelName': req.params.modelName,
                                                        'model': model,
                                                        'start': start,
                                                        'count': count,
                                                        'renderedHead':'',
                                                        'adminTitle':adminTitle,
                                                        'listFields': options.list,
                                                        'documents': documents,
                                                        'rootPath': MongooseAdmin.singleton.root
                                                    }
                                                   });
                                        MongooseAdmin.singleton.popExpressConfig(config);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
};

exports.document_post = function(req,res) {
    var adminUser = req.session._mongooseAdminUser ? MongooseAdmin.userFromSessionStore(req.session._mongooseAdminUser) : null;
    if (!adminUser) {
        res.writeHead(401, {"Content-Type": "application/json"});
        res.end();
        return;
    } else {
        if(req.body._id && req.body._id != '')
            MongooseAdmin.singleton.updateDocument(req,adminUser, req.params.modelName, req.body._id, req.body, function(err, document) {
                if (err) {
                    if(err.render_str)
                    {
                        render_document_from_form(err,req,res,req.params.modelName);
                        return;
                    }
                    res.writeHead(500);
                    res.end();
                } else {
                    res.redirect(req.path.split('/document/')[0] + '?saved=true');
//                    res.writeHead(200, {"Content-Type": "application/json"});
//                    res.write(JSON.stringify({"collection": req.params.collectionName}));
//                    res.end();
                }
            });
        else
            MongooseAdmin.singleton.createDocument(req,adminUser, req.params.modelName, req.body, function(err, document) {
                if (err) {
                    if(err.render_str)
                    {
                        render_document_from_form(err,req,res,req.params.modelName);
                        return;
                    }
                    if(typeof(err)=='object')
                    {
                        res.json(err,400);
                    }
                    else
                    {
                        res.writeHead(500);
                        res.end();
                    }
                } else {
                    res.redirect(req.path.split('/document/')[0] + '?saved=true');
    //                res.writeHead(201, {"Content-Type": "application/json"});
    //                res.write(JSON.stringify({"collection": req.params.collectionName}));
    //                res.end();
                }
            });
    }

};

function render_document_from_form(form,req,res,modelName)
{
    form.render_ready(function(err)
    {
        if(err)
            res.redirect('/error');
        else
        {
            var html = form.render_str();
            var head = form.render_head();
            var config = MongooseAdmin.singleton.pushExpressConfig();
            res.render('document.jade',
                {layout: 'adminlayout.jade',
                    locals: {
                        'pageTitle': 'Admin - ' + modelName,
        //                'models': models,
        //                'modelName': req.params.modelName,
        //                'model': model,
        //                'fields': fields,
                        'renderedDocument': html,
                        'renderedHead':head,
                        'adminTitle':adminTitle,
                        'document': {},
                        'errors':Object.keys(form.errors).length > 0,
                        'allowDelete':false,
                        'rootPath': MongooseAdmin.singleton.root
                    }
                });
            MongooseAdmin.singleton.popExpressConfig(config);
        }
    });
}

exports.document = function(req, res) {
    var adminUser = req.session._mongooseAdminUser ? MongooseAdmin.userFromSessionStore(req.session._mongooseAdminUser) : null;
    if (!adminUser) {
        res.redirect('/login')
    } else {
        MongooseAdmin.singleton.getRegisteredModels(function(err, models) {
            if (err) {
                res.redirect('/');
            } else {
                MongooseAdmin.singleton.getModel(req.params.modelName, function(err, model, fields, options) {
                    if (err) {
                        res.redirect('/error');
                    } else {
                        if(model.is_single)
                        {
                            model.findOne({},function(err,document)
                            {
                                if(err)
                                {
                                    res.redirect('/error');
                                }
                                else
                                {
                                    var form = new forms.MongooseForm(req,{instance:document},model);
                                    render_document_from_form(form,req,res,model.modelName);
                                }
                            });
                        }
                        else
                        {
                            if (req.params.documentId === 'new') {
                                var form = new forms.MongooseForm(req,{},model);
                                render_document_from_form(form,req,res,model.modelName);
    //                                    var html = form.render_str();
    //                                    var head = form.render_head();
    //
    //                                    var config = MongooseAdmin.singleton.pushExpressConfig();
    //                                    res.render('document.jade',
    //                                        {layout: 'adminlayout.jade',
    //                                            locals: {
    //                                                'pageTitle': 'Admin - ' + model.modelName,
    //                                                'models': models,
    //                                                'modelName': req.params.modelName,
    //                                                'model': model,
    //                                                'fields': fields,
    //                                                'renderedDocument': html,
    //                                                'renderedHead':head,
    //                                                'document': {},
    //                                                'allowDelete':false,
    //                                                'rootPath': MongooseAdmin.singleton.root
    //                                            }
    //                                        });
    //                                    MongooseAdmin.singleton.popExpressConfig(config);
    //                                }                            ;
    //                            Renderer.renderDocument(models, fields, options, null, function(html) {
     //                           });
                            } else {
                                MongooseAdmin.singleton.getDocument(req.params.modelName, req.params.documentId, function(err, document) {
                                    if (err) {
                                        res.redirect('/error');
                                    } else {
                                        var form = new forms.MongooseForm(req,{instance:document},model);
                                        render_document_from_form(form,req,res,model.modelName);
    //                                            var html = form.render_str();
    //                                            var head = form.render_head();
    //                                            var config = MongooseAdmin.singleton.pushExpressConfig();
    //                                            res.render('document.jade',
    //                                                {layout: 'adminlayout.jade',
    //                                                    locals: {
    //                                                        'pageTitle': 'Admin - ' + model.modelName,
    //                                                        'models': models,
    //                                                        'modelName': req.params.modelName,
    //                                                        'model': model,
    //                                                        'fields': fields,
    //                                                        'renderedDocument': html,
    //                                                        'renderedHead':head,
    //                                                        'document': document,
    //                                                        'allowDelete':false,
    //                                                        'rootPath': MongooseAdmin.singleton.root
    //                                                    }
    //                                                });
    //                                            MongooseAdmin.singleton.popExpressConfig(config);
    //                                    Renderer.renderDocument(models, fields, options, document, function(html) {
    //                                        var config = MongooseAdmin.singleton.pushExpressConfig();
    //                                        res.render('document',
    //                                                   {layout: 'adminlayout.jade',
    //                                                    locals: {
    //                                                       'pageTitle': 'Admin - ' + model.modelName,
    //                                                       'models': models,
    //                                                       'modelName': req.params.modelName,
    //                                                       'model': model,
    //                                                       'fields': fields,
    //                                                       'renderedDocument': html,
    //                                                       'document': document,
    //                                                       'allowDelete': true,
    //                                                       'rootPath': MongooseAdmin.singleton.root
    //                                                   }
    //                                                 });
    //                                        MongooseAdmin.singleton.popExpressConfig(config);
    //                                    });
                                    }
                                });
                            }
                        }
                    }
                });
            }
        });
    }
};

