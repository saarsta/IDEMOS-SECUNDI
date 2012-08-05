var mongoose_resource = require('jest'),
    UserResource = require('./UserResources.js'),
    InformationItemResource = require('./InformationItemResource.js'),
    ShoppingCartResource = require('./ShoppingCartResource'),
    DiscussionShoppingCartResource = require('./discussions/DiscussionShoppingCartResource.js'),
    CycleResource = require('./cycles/CycleResource.js'),
    CyclePostResource = require('./cycles/CyclePostResource.js'),
    CycleShoppingCartResource = require('./cycles/CycleShoppingCartResource.js'),
    SubjectResource = require('./SubjectResource'),
    DiscussionResource = require('./discussions/DiscussionResource.js'),
    PostResource = require('./discussions/PostResource.js'),
    DiscussionHistoryResource = require('./discussions/DiscussionHistoryResource.js'),
    PostsActionResource = require('./actions/PostActionResource.js'),
    PostArticleResource = require('./blogs/PostArticleResource')
    VoteResource = require('./discussions/VoteResource.js'),
    VoteArticlePostResource = require('./blogs/VoteArticlePostResource'),
    VoteSuggestionResource = require('./VoteSuggestionResource'),
    GradeResource = require('./discussions/GradeResource.js'),
    GradeSuggestionResource = require('./GradeSuggestionResource'),
    GradeActionResource = require('./GradeActionResource'),
    LikeResource = require('./LikeResource'),
    JoinResource = require('./JoinResource'),
    CategoryResource = require('./CategoryResource'),
    SuggestionResource = require('./suggestionResource.js'),
    ActionResourceResource = require('./actions/ActionResourceResource.js'),
    ActionResource = require('./actions/ActionResource.js'),
    ActionPopulatedResource = require('./actions/ActionPopulatedResource.js'),
    article_resources = require('./blogs/ArticleResource.js'),
    ArticleResource = article_resources.ArticleResource,
    TagResource = require('./TagResource'),
    ArticleCommentResource = article_resources.ArticleCommentResource,
    HeadlineResource = require('./HeadlineResource'),
    SuccessStoryResource = require('./SuccessStoryResource'),
    UpdateResource = require('./UpdateResource'),
    KilkulResource = require('./KilkulResource'),
    HotObjectResource = require('./HotObjectResource'),
    NotificationResource = require('./NotificationResource'),
    UserFollowerResource = require('./UserFollowerResource'),
    UserProxyResource = require('./UserProxyResource'),
    ItemsCountByTagNameResource = require('./ItemsCountByTagNameResource'),
    FBRequestResource = require('./FBRequestResource'),
    ImageUploadResource = require('./ImageUploadResource'),
    AboutUruTextResource = require('./AboutUruTextResource'),
    AboutUruItemResource = require('./AboutUruItemResource'),
    TeamResource = require('./TeamResource'),
    QaResource = require('./QaResource'),
    ElectionsTextResource = require('./ElectionsTextResource'),
    ElectionsItemResource = require('./ElectionsItemResource'),
    LoginResource = require('./LoginResource'),
    FbConnectResource = require('./FbConnectResource'),
    AvatarResource = require('./avatar_resource'),
    OGActionResource = require('./og_action_resource');



module.exports = function(app)
{
    var rest_api = new mongoose_resource.Api('api',app);
    rest_api.register_resource('users',new UserResource());
    rest_api.register_resource('information_items',new InformationItemResource());
    rest_api.register_resource('headlines',new HeadlineResource());
    rest_api.register_resource('success_stories',new SuccessStoryResource());
    rest_api.register_resource('updates',new UpdateResource());
    rest_api.register_resource('kilkuls',new KilkulResource());
    rest_api.register_resource('shopping_cart',new ShoppingCartResource());
    rest_api.register_resource('discussions_shopping_cart',new DiscussionShoppingCartResource());
    rest_api.register_resource('cycles_shopping_cart',new CycleShoppingCartResource());
    rest_api.register_resource('subjects', new SubjectResource());
    rest_api.register_resource('discussions', new DiscussionResource());
    rest_api.register_resource('posts', new PostResource());
    rest_api.register_resource('discussions_history', new DiscussionHistoryResource());
    rest_api.register_resource('posts_of_article', new PostArticleResource());
    rest_api.register_resource('posts_of_action', new PostsActionResource());
    rest_api.register_resource('votes', new VoteResource());
    rest_api.register_resource('votes_on_article_comment', new VoteArticlePostResource());
    rest_api.register_resource('votes_on_suggestion', new VoteSuggestionResource());
    rest_api.register_resource('grades', new GradeResource());
    rest_api.register_resource('grades_suggestion', new GradeSuggestionResource());
    rest_api.register_resource('grades_action', new GradeActionResource());
    rest_api.register_resource('likes', new LikeResource());
    rest_api.register_resource('joins', new JoinResource());
    rest_api.register_resource('suggestions', new SuggestionResource());
    rest_api.register_resource('categories', new CategoryResource());
    rest_api.register_resource('action_resources', new ActionResourceResource());
    rest_api.register_resource('actions', new ActionResource());
    rest_api.register_resource('actions_populated', new ActionPopulatedResource());
    rest_api.register_resource('cycles', new CycleResource());
    rest_api.register_resource('cycle_posts', new CyclePostResource());
    rest_api.register_resource('articles', new ArticleResource());
    rest_api.register_resource('tags', new TagResource());
    rest_api.register_resource('article_update', new ArticleCommentResource());
    rest_api.register_resource('hot_objects', new HotObjectResource());
    rest_api.register_resource('notifications', new NotificationResource());
    rest_api.register_resource('user_followers', new UserFollowerResource());
    rest_api.register_resource('user_proxies', new UserProxyResource());
    rest_api.register_resource('about_uru_texts', new AboutUruTextResource());
    rest_api.register_resource('about_uru_items', new AboutUruItemResource());
    rest_api.register_resource('team', new TeamResource());
    rest_api.register_resource('qa', new QaResource());
    rest_api.register_resource('elections_items', new ElectionsItemResource());
    rest_api.register_resource('elections_texts', new ElectionsTextResource());
    rest_api.register_resource('login', new LoginResource());
    rest_api.register_resource('fb_connect', new FbConnectResource());
    rest_api.register_resource('items_count_by_tag_name', new ItemsCountByTagNameResource());
    rest_api.register_resource('fb_request', new FBRequestResource());
    rest_api.register('image_upload',new ImageUploadResource());
    rest_api.register('og_action', new OGActionResource());

    rest_api.register('avatar',new AvatarResource());
};