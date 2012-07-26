WTF.socket.on('connect', function (data){

    
    WTF.socket.emit('setChannel', {
        'channelName': 'Race'
    });

    WTF.socket.on('playerFinish', function(data) {
        if(data.username === WTF.username) {
            WTF.playerFinish(data.position);
        }
    });

    WTF.socket.on('playerState', function(data) {
        if(data.username === WTF.username) {
            switch(data.state) {
                case "winner":
                    break;
                case "gameover":
                    $('body.mobileui').attr('class', "mobileui gameover");
                    $('.mobile p').text('Game over! Unlucky.');
                    break;
                case "playing":
                    $('body.mobileui').attr('class', "mobileui playing");
                    $('.mobile p').text('Swipe me, really fast.');
                    break;
                default:
                    $('body.mobileui').attr('class', "mobileui");
                    $('.mobile p').text('Sit tight...');
            };
        }
    });

    WTF.socket.on('resetRace', function() {
            location.href('/join');
        });
    });
});

WTF.controls = {
    lastTouchX: 0,
    lastTouchDate: {},

    init: function() {

        $('.mobileui').on('touchstart', function(e) {
            WTF.controls.lastTouchX = e.touches[0].pageX;
            WTF.controls.lastTouchDate = new Date();

            return false;
        });

        $('.mobileui').on('touchmove', function(e) {
            var timeDiff = new Date() - WTF.controls.lastTouchDate;

            if(WTF.controls.lastTouchX - e.touches[0].pageX > 50 && timeDiff < 20) {
                WTF.socket.emit('buttons', {'userId': WTF.username, 'foot': 'right'});
            } else if(e.touches[0].pageX - WTF.controls.lastTouchX > 50 && timeDiff < 20) {
                WTF.socket.emit('buttons', {'userId': WTF.username, 'foot': 'left'});
            }

            WTF.controls.lastTouchX = e.touches[0].pageX;
            WTF.controls.lastTouchDate = new Date();

            return false;
        });
    }
};

WTF.playerFinish = function(position) {
    if(position !== null) {
        $('body.mobileui').attr('class', "mobileui winner position"+position);
        $('.mobile').html('<p>You came <strong>'+position+''+ord(position)+'</strong>!</p>');    
    }
};

if($('body').attr('id') !== "") {
    WTF.username = $('body').attr('id');

    WTF.socket.emit('playerJoin', {
        'username': WTF.username
    });

    WTF.controls.init();
}