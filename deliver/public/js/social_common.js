


$(function(){

    $('#send-vote,#send_vote_1').on('click', function(e) {
        e.preventDefault();

        if ($('.checkBox:checked').length > 5) {
            popupProvider.showOkPopup({message: 'באפשרותך לבחור עד 5 הצעות.'});
            return false;
        }

        var validationErrors = $('#user-signup').validate().errorList;
        if(validationErrors.length > 0){
            popupProvider.showOkPopup({
                message: validationErrors[0].message
            });
            return false;
        }

        if($('#display-inline-block-example .checkBox:checked').length === 0){
            popupProvider.showOkPopup(
                {
                    message: 'עליך לבחור הצעה',
                    callback: function(){
                        location.hash = "#main-thing";
                    }
                }
            );

            return false;
        }

        if ($('.intext-last-checkbox p.checkBox:checked').length > 0) {
            if ($('#styledSelect').val() === '0') {
                popupProvider.showOkPopup({
                    message: 'עליך לבחור נושא מהרשימה.',
                    callback: function(){
                        location.hash = "#main-thing";
                    }});

                return false;
            } else if ($('#textarea').hasClass('placeholder')) {
                popupProvider.showOkPopup({message: 'עליך לתת תיאור להצעתך.'});
                return false;
            }
        }

        if (user_logged === false) {
            var $input		= $('#user-signup :input'),
                full_name	= $input.eq(0).val_if_not_placeholder(),
                email		= $input.eq(1).val_if_not_placeholder();

            if (!full_name && !email) {
                popupProvider.showOkPopup({message: 'אנא התחבר למערכת או הירשם כדי להצביע.'});
                return false;
            } else if (!full_name) {
                popupProvider.showOkPopup({message: 'יש למלא שם מלא.'});
                return false;
            } else if (!email) {
                popupProvider.showOkPopup({message: 'יש למלא מייל.'});
                return false;
            }


            $.post('/api/register', {full_name:full_name, email:email}, sendVote).fail(function(e) {
                var msg =  'ההרשמה לא הצליחה, אנא בידקו את כתובת המייל שהוזנה';
                if (e.responseText === 'already_exists')
                {
                    sendVote();
                }
                else
                {
                    popupProvider.showOkPopup({message:msg});
                }
            });
            return false;
        }
        sendVote();

        return false;
    });

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