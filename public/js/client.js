WTF.socket.on('connect', function (data){

    
    WTF.socket.emit('setChannel', {
        'channelName': 'Race'
    });

    WTF.socket.on('playerFinish', function(data) {
        if(data.username === WTF.username) {
            WTF.playerFinish(data.position);
        }
    });
});

WTF.controls = {
    lastTouchX: 0,

    init: function() {

        $('.mobileui').on('touchstart', function(e) {
            WTF.controls.lastTouchX = e.touches[0].pageX;

            return false;
        });

        $('.mobileui').on('touchmove', function(e) {
            if(WTF.controls.lastTouchX - e.touches[0].pageX > 50) {
                WTF.controls.lastTouchX = e.touches[0].pageX;
                WTF.socket.emit('buttons', {'userId': WTF.username, 'foot': 'right'});
            } else if(e.touches[0].pageX - WTF.controls.lastTouchX > 50) {
                WTF.controls.lastTouchX = e.touches[0].pageX;
                WTF.socket.emit('buttons', {'userId': WTF.username, 'foot': 'left'});
            }

            return false;
        });
    }
};

WTF.playerFinish = function(position) {
    $('.controls').remove();
    $('h1').append('<h2>Congratulations!</h2><h3>You came <strong>'+ord(position)+'</strong>!</h3>');
};

if($('body').attr('id') !== "") {
    WTF.username = $('body').attr('id');

    WTF.socket.emit('playerJoin', {
        'username': WTF.username
    });

    WTF.controls.init();
}

$(window).on('beforeunload', function() {
    WTF.socket.emit('removeName', {
        'username': WTF.username
    });
});