


$(function(){

    $("#facebook-connect").on('click', function(){
        facebookLogin(function(error, result) {
            if (!error) {
                if(result.is_new) {
                    user_is_new = 'facebook';
                }
                user_logged = true;
                popupProvider.showOkPopup({message: 'חוברת למערכת בהצלחה.'});
                $('.vote-container-non-reg').addClass('vote-container').removeClass('vote-container-non-reg');
            } else {
                console.error(error);
                popupProvider.showOkPopup({message: 'הנסיון להתחבר באמצעות פייסבוק כשל.'});
            }
        });
        return false;
    });

    $('#share-facebook').one('click', function() {
        facebookLogin(function(error) {
            $.post('/elections/fbimage/' + FB.getUserID(), function(data) {
                var obj = {
                    url : data.target_url,
                    message: 'גם אני מרגיש חלק מהרוב הלא מיוצג, שמתי בצד הבדלים של שמאל-ימין מדיני ובחרתי בנושאים שחשוב לי לשנות. מרגישים כמוני? הצטרפו והצביעו!\nhttp://www.uru.org.il'
                };
                FB.api('/me/photos', 'post', obj , function(response) {
                    if (!response || response.error) {
                        alert('Error occured');
                    } else {
                        popupProvider.showOkPopup({message:'השיתוף הסתיים בהצלחה.'});
                    }
                });
            });
        });
    });

    $('#share-twitter').on('click', function() {
        window.open('https://twitter.com/share?url=' + encodeURIComponent('http://www.uru.org.il') + '&text=' +
            encodeURIComponent('גם אני מרגיש חלק מהרוב הלא מיוצג, שמתי בצד הבדלים של שמאל-ימין מדיני ובחרתי בנושאים שחשוב לי לשנות. מרגישים כמוני? הצטרפו והצביעו!') +
            '&via=URUisrael', 'share-twitter', 'status=0,scrollbars=0,location=0,height=320,width=660,resizable=1');
        return false;
    });

    $('#share-google').on('click', function() {
        window.open('https://plusone.google.com/_/+1/confirm?hl=en&url=' + encodeURIComponent('http://www.uru.org.il'),
            'share-google', 'status=0,scrollbars=0,location=0,height=320,width=660,resizable=1');
        return false;
    });

})