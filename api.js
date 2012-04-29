var mongoose_resource = require('jest'),
    UserResource = require('./model/UserResources.js'),
    InformationItemResource = require('./model/InformationItemResource.js'),
    ShoppingCartResource = require('./model/ShoppingCartResource'),
    DiscussionShoppingCartResource = require('./model/DiscussionShoppingCartResource'),
    SubjectResource = require('./model/SubjectResource'),
    DiscussionResource = require('./model/DiscussionResource.js');
    PostResource = require('./model/PostResource.js');
    PostsActionResource = require('./model/PostsActionResource.js');
    VoteResource = require('./model/VoteResource');
    GradeResource = require('./model/GradeResource');
    GradeActionResource = require('./model/GradeActionResource');
    LikeResource = require('./model/LikeResource');
    JoinResource = require('./model/JoinResource');
    CategoryResource = require('./model/CategoryResource'),
    SuggestionResource = require('./model/suggestionResource.js'),
    ActionResourceResource = require('./model/ActionResourceResource'),
    ActionResource = require('./model/ActionResource'),
    ActionPopulatedResource = require('./model/ActionPopulatedResource'),
    CycleResource = require('./model/CycleResource'),
    article_resources = require('./model/ArticleResource'),
    ArticleResource = article_resources.ArticleResource,
    TagResource = require('./model/TagResource'),
    ArticleCommentResource = article_resources.ArticleCommentResource,
    HeadlineResource = require('./model/HeadlineResource'),
    SuccessStoryResource = require('./model/SuccessStoryResource'),
    UpdateResource = require('./model/UpdateResource'),
    KilkulResource = require('./model/KilkulResource');






module.exports = function(app)
{
    var rest_api = new mongoose_resource.Api('api',app);
    rest_api.register_resource('users',new UserResource());
    rest_api.register_resource('information_items',new InformationItemResource());
    rest_api.register_resource('headlines',new HeadlineResource());
    rest_api.register_resource('success_stories',new SuccessStoryResource());
    rest_api.register_resource('updates',new UpdateResource());
    rest_api.register_resource('kilkule',new KilkulResource());
    rest_api.register_resource('shopping_cart',new ShoppingCartResource());
    rest_api.register_resource('discussions_shopping_cart',new DiscussionShoppingCartResource());
    rest_api.register_resource('subjects', new SubjectResource());
    rest_api.register_resource('discussions', new DiscussionResource());
    rest_api.register_resource('posts', new PostResource());
    rest_api.register_resource('posts_of_action', new PostsActionResource());
    rest_api.register_resource('votes', new VoteResource());
    rest_api.register_resource('grades', new GradeResource());
    rest_api.register_resource('grades_action', new GradeActionResource());
    rest_api.register_resource('likes', new LikeResource());
    rest_api.register_resource('joins', new JoinResource());
    rest_api.register_resource('suggestions', new SuggestionResource());
    rest_api.register_resource('categories', new CategoryResource());
    rest_api.register_resource('action_resources', new ActionResourceResource());
    rest_api.register_resource('actions', new ActionResource());
    rest_api.register_resource('actions_populated', new ActionPopulatedResource());
    rest_api.register_resource('cycles', new CycleResource());
    rest_api.register_resource('articles', new ArticleResource());
    rest_api.register_resource('tags', new TagResource());
    rest_api.register_resource('article_update', new ArticleCommentResource());

};