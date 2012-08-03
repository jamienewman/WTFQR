LOL.socket.on('connect', function (data){

    
    LOL.socket.emit('setChannel', {
        'channelName': 'Race'
    });

    LOL.socket.on('playerFinished', function(data) {
        if(data.username === LOL.username) {
            LOL.playerFinished(data.position);
        }
    });

    LOL.socket.on('playerState', function(data) {
        if(data.username === LOL.username) {
            switch(data.state) {
                case "winner":
                    break;
                case "gameover":
                    $('body.mobileui').attr('class', "mobileui gameover");
                    $('.mobile p').text('Game over! Unlucky.');
                    break;
                case "playing":
                    $('body.mobileui').attr('class', "mobileui playing");
                    //$('.mobile p').text('Swipe me, really fast.');
                    $('.mobile p').html('<a class="left" href="#">L</a><a class="right" href="#">R</a>');
                    $('.left, .right').on('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();

                        LOL.socket.emit('buttons', {'userId': LOL.username, 'foot': $(this).attr('class')});

                        return false;
                    });    
                    FastClick(document.querySelector('.left'));
                    FastClick(document.querySelector('.right'));
                    break;
                default:
                    $('body.mobileui').attr('class', "mobileui");
                    $('.mobile p').text('Sit tight...');
            };
        }
    });

    LOL.socket.on('resetRace', function() {
        location.href = '/join';
    });
});

LOL.controls = {
    lastTouchX: 0,
    lastTouchDate: {},

    init: function() {    

        /*
        $('.mobileui').on('touchstart', function(e) {
            LOL.controls.lastTouchX = e.touches[0].pageX;
            LOL.controls.lastTouchDate = new Date();

            return false;
        });

        $('.mobileui').on('touchmove', function(e) {
            var timeDiff = new Date() - LOL.controls.lastTouchDate;

            if(LOL.controls.lastTouchX - e.touches[0].pageX > 50 && timeDiff < 20) {
                LOL.socket.emit('buttons', {'userId': LOL.username, 'foot': 'right'});
            } else if(e.touches[0].pageX - LOL.controls.lastTouchX > 50 && timeDiff < 20) {
                LOL.socket.emit('buttons', {'userId': LOL.username, 'foot': 'left'});
            }

            LOL.controls.lastTouchX = e.touches[0].pageX;
            LOL.controls.lastTouchDate = new Date();

            return false;
        });
*/
    }
};

LOL.playerFinished = function(position) {
    if(position !== null) {
        $('body.mobileui').attr('class', "mobileui winner position"+position);
        $('.mobile').html('<p>You came <strong>'+position+''+ord(position)+'</strong>!</p>');    
    }
};

if($('body').attr('id') !== "") {
    LOL.username = $('body').attr('id');

    LOL.socket.emit('playerJoin', {
        'username': LOL.username
    });

    LOL.controls.init();
}