var mongoose_resource = require('jest'),
    UserResource = require('./UserResources.js'),
    InformationItemResource = require('./InformationItemResource.js'),
    ShoppingCartResource = require('./ShoppingCartResource'),
    DiscussionShoppingCartResource = require('./discussions/DiscussionShoppingCartResource.js'),
    CycleResource = require('./cycles/CycleResource.js'),
    CyclePostResource = require('./cycles/CyclePostResource.js'),
    CycleShoppingCartResource = require('./cycles/CycleShoppingCartResource.js'),
    CycleTimelineResource = require('./cycles/CycleTimeLineResource.js'),
    CycleFBPageResource = require('./cycles/CycleFBPageResource.js'),
    OpinionShaperResource = require('./cycles/OpinionShaperResource.js'),
    ActionShoppingCartResource = require('./actions/ActionShoppingCartResource.js'),
    SubjectResource = require('./SubjectResource'),
    DiscussionResource = require('./discussions/DiscussionResource.js'),
    PostResource = require('./discussions/PostResource.js'),
    PostOnSuggestionResource = require('./discussions/post_on_suggestion_resource.js'),
    PostOnCommentResource = require('./discussions/post_on_comment_resource.js'),
    SpecialPostsResource = require('./discussions/special_posts_resource.js'),
    DiscussionHistoryResource = require('./discussions/DiscussionHistoryResource.js'),
    PostsActionResource = require('./actions/PostActionResource.js'),
    VoteResource = require('./discussions/VoteResource.js'),
    VoteActionPostResource = require('./actions/VoteActionPostResource'),
    GradeResource = require('./discussions/GradeResource.js'),
    GradeSuggestionResource = require('./GradeSuggestionResource'),
    GradeActionSuggestionResource = require('./actions/grade_action_suggestion_resource'),
    GradeActionResource = require('./actions/GradeActionResource'),
    LikeResource = require('./LikeResource'),
    JoinResource = require('./actions/JoinResource'),
    CategoryResource = require('./CategoryResource'),
    SuggestionResource = require('./suggestionResource.js'),
    ActionSuggestionResource = require('./actions/ActionSuggestionResource.js'),
    ActionResourceResource = require('./actions/ActionResourceResource.js'),
    ActionResource = require('./actions/ActionResource.js'),
    ActionPopulatedResource = require('./actions/ActionPopulatedResource.js'),
    TagResource = require('./TagResource'),
    HeadlineResource = require('./HeadlineResource'),
    UpdateResource = require('./UpdateResource'),
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
    FounderResource = require('./founder_resource'),
    BringResourceResource = require('./actions/bring_resource_resource'),
    QaResource = require('./QaResource'),
    RegisterResource = require('./register_resource'),
    LoginResource = require('./LoginResource'),
    FbConnectResource = require('./FbConnectResource'),
    AvatarResource = require('./avatar_resource'),
    ResetNotificationResource = require('./reset_notification_resource'),
    CounterResource = require('./CounterResource'),
    OGActionResource = require('./og_action_resource'),
    UserInviteFriendsResource=      require('./UserInviteFriendsResource'),
    UserMailNotificationConfig = require('./user_mail_notification_config_resource');
    PressItemResource = require('./PressItemResource'),
    SendMailResource =  require('./send_mail_resource'),

module.exports = function(app)
{
    var rest_api = new mongoose_resource.Api('api',app);
    rest_api.register_resource('users',new UserResource());
    rest_api.register_resource('information_items',new InformationItemResource());
    rest_api.register_resource('headlines',new HeadlineResource());
    rest_api.register_resource('updates',new UpdateResource());
    rest_api.register_resource('shopping_cart',new ShoppingCartResource());
    rest_api.register_resource('discussions_shopping_cart',new DiscussionShoppingCartResource());
    rest_api.register_resource('cycles_shopping_cart',new CycleShoppingCartResource());
    rest_api.register_resource('actions_shopping_cart',new ActionShoppingCartResource());
    rest_api.register_resource('subjects', new SubjectResource());
    rest_api.register_resource('discussions', new DiscussionResource());
    rest_api.register_resource('posts', new PostResource());
    rest_api.register_resource('special_posts', new SpecialPostsResource());
    rest_api.register_resource('suggestion_posts', new PostOnSuggestionResource());
    rest_api.register_resource('posts_on_comment', new PostOnCommentResource());
    rest_api.register_resource('discussions_history', new DiscussionHistoryResource());
    rest_api.register_resource('posts_of_action', new PostsActionResource());
    rest_api.register_resource('votes', new VoteResource());
    rest_api.register_resource('votes_on_action_post', new VoteActionPostResource());
    rest_api.register_resource('grades', new GradeResource());
    rest_api.register_resource('grades_suggestion', new GradeSuggestionResource());
    rest_api.register_resource('action_suggestion_grades', new GradeActionSuggestionResource());
    rest_api.register_resource('action_grades', new GradeActionResource());
    rest_api.register_resource('action_suggestions', new ActionSuggestionResource());
    rest_api.register_resource('likes', new LikeResource());
    rest_api.register_resource('join', new JoinResource());
    rest_api.register_resource('suggestions', new SuggestionResource());
    rest_api.register_resource('categories', new CategoryResource());
    rest_api.register_resource('action_resources', new ActionResourceResource());
    rest_api.register_resource('actions', new ActionResource());
    rest_api.register_resource('actions_populated', new ActionPopulatedResource());
    rest_api.register_resource('cycles', new CycleResource());
    rest_api.register_resource('cycle_posts', new CyclePostResource());
    rest_api.register_resource('cycle_timeline', new CycleTimelineResource());
    rest_api.register_resource('cycle_pages', new CycleFBPageResource());
    rest_api.register_resource('opinion_shapers', new OpinionShaperResource());
    rest_api.register_resource('tags', new TagResource());
    rest_api.register_resource('hot_objects', new HotObjectResource());
    rest_api.register_resource('notifications', new NotificationResource());
    rest_api.register_resource('user_followers', new UserFollowerResource());
    rest_api.register_resource('user_proxies', new UserProxyResource());
    rest_api.register_resource('user_proxies', new UserProxyResource());
    rest_api.register_resource('user_invited_friends', new UserInviteFriendsResource());

    rest_api.register_resource('about_uru_texts', new AboutUruTextResource());
    rest_api.register_resource('about_uru_items', new AboutUruItemResource());
    rest_api.register_resource('team', new TeamResource());
    rest_api.register_resource('founders', new FounderResource());
    rest_api.register_resource('user_helps_action', new BringResourceResource());
    rest_api.register_resource('qa', new QaResource());
    rest_api.register_resource('user_mail_notification_config', new UserMailNotificationConfig());

    rest_api.register_resource('login', new LoginResource());
    rest_api.register('register',new RegisterResource());
    rest_api.register_resource('fb_connect', new FbConnectResource());

    rest_api.register_resource('items_count_by_tag_name', new ItemsCountByTagNameResource());
    rest_api.register_resource('fb_request', new FBRequestResource());
    rest_api.register('image_upload',new ImageUploadResource());
    rest_api.register('og_action', new OGActionResource());
    rest_api.register('avatar',new AvatarResource());
    rest_api.register('reset_notification',new ResetNotificationResource());
    rest_api.register_resource('counter', new CounterResource());
    rest_api.register_resource('press_item', new PressItemResource());
    rest_api.register_resource('send_mail', new SendMailResource());
};
