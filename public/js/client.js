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

WTF.controls = function(){
    $('.controls a').on('click', function(evt){

        evt.preventDefault();

        WTF.socket.emit('buttons', {'userId': WTF.username, 'foot': $(this).attr('class') });

    }); 

    FastClick(document.querySelectorAll('.controls a'));
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

    WTF.controls();
}

$(window).on('beforeunload', function() {
    WTF.socket.emit('removeName', {
        'username': WTF.username
    });
});