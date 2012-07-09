// requestAnimationFrame shim
(function(){
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());


/**
 * 
 * 
 * 
 * 
 * 
 */

var WTF = WTF || {};


WTF.socket = io.connect( window.location.origin );

    
WTF.socket.on('connect', function (data){

    
    WTF.socket.emit('setChannel', {
        'channelName': 'Race'
    });


    WTF.socket.on('playerData', function(data){
        console.log(data);
    });


    WTF.socket.on('raceData', function(data){

        console.log(data);

        if (WTF.finished){
            return;
        }

        if(WTF.player1name === null){
            WTF.player1name = data.user;
            $('.racers').append('<p>'+WTF.player1name+'</p>')
            return;
        }

        if(WTF.player2name === null){
            WTF.player2name = data.user;
            $('.racers').append('<p>'+WTF.player2name+'</p>')
            return;
        }

        if(WTF.player1name === data.user){

            if(data.foot === 'left'){
                WTF.runner1.src = 'img/runner1.png';
            }
            
            if (data.foot === 'right'){
                WTF.runner1.src = 'img/runner1_2.png';
            }

            WTF.r1x += WTF.steps;

            return;

        }

        if(WTF.player2name === data.user){
            
            if(data.foot === 'left'){
                WTF.runner1.src = 'img/runner2.png';
            }
            
            if (data.foot === 'right'){
                WTF.runner1.src = 'img/runner2_2.png';
            }

            WTF.r2x += WTF.steps;

            return;

        }

    });


});


$(window).on('beforeunload', function() {
    WTF.socket.emit('removeName', {
        'username': WTF.username
    });
});


WTF.controls = function(){

    $('.controls a').on('click', function(evt){

        evt.preventDefault();

        WTF.socket.emit('buttons', {'user': WTF.username, 'foot': $(this).attr('class') });

    }); 

};



WTF.gameInit = function(){

    WTF.animateCanvas();

};


WTF.animateCanvas = function(){

    requestAnimationFrame(WTF.animateCanvas);
    WTF.drawCanvas();   

};


WTF.clearCanvas = function(){
    WTF.ctx.clearRect(0, 0, WTF.width, WTF.height);
};


WTF.rect = function(x,y,w,h){
    WTF.ctx.beginPath();
    WTF.ctx.rect(x,y,w,h);
    WTF.ctx.closePath();
    WTF.ctx.fill();
    WTF.ctx.stroke();
};


WTF.drawCanvas = function(){

    WTF.clearCanvas();

    WTF.rect(0,0, WTF.width, WTF.height);
    
    WTF.ctx.drawImage(WTF.background, 0, 0);
        
    WTF.framenumber++;
    
    if (WTF.framenumber % 100 === 0 && WTF.countdown){
        WTF.countdown--;
    }

    if (WTF.countdown >= 2){
        WTF.ctx.font = "bold 40px sans-serif";
        WTF.ctx.fillText(WTF.countdown-1, WTF.width / 2, 50);
        WTF.ctx.textAlign = "center";
    }

    if (WTF.countdown === 1){
        WTF.ctx.font = "bold 40px sans-serif";
        WTF.ctx.fillText("GO", WTF.width / 2, 50);
        WTF.ctx.textAlign = "center";
    }

    WTF.ctx.drawImage(WTF.runner1, WTF.r1x, WTF.r1y);
    WTF.ctx.drawImage(WTF.runner2, WTF.r2x, WTF.r2y);

    if (WTF.r1x >= 566){
        WTF.finished = true;
        WTF.ctx.clearRect(0, 0, WTF.width, WTF.height);
        WTF.rect(0, 0, WTF.width, WTF.height);

        WTF.ctx.drawImage(WTF.background, 0, 0);
        WTF.ctx.drawImage(WTF.runner1, WTF.r1x, WTF.r1y);
        WTF.ctx.drawImage(WTF.runner2, WTF.r2x, WTF.r2y);
        
        WTF.ctx.font = "bold 20px sans-serif";
        WTF.ctx.fillText("The Winner is " + WTF.player1name, WTF.width / 2, 135);
        WTF.ctx.textAlign = "center";
    }

    if (WTF.r2x >= 566){
        WTF.finished = true;
        WTF.ctx.clearRect(0, 0, WTF.width, WTF.height);
        WTF.rect(0, 0, WTF.width, WTF.height);
        
        WTF.ctx.drawImage(WTF.background, 0, 0);
        WTF.ctx.drawImage(WTF.runner1, WTF.r1x, WTF.r1y);
        WTF.ctx.drawImage(WTF.runner2, WTF.r2x, WTF.r2y);
        
        WTF.ctx.font = "bold 20px sans-serif";
        WTF.ctx.fillText("The Winner is " + WTF.player2name, width / 2, 135);
        WTF.ctx.textAlign = "center";
    }

};


// Page specific functionality

// Race page
if( window.location.pathname === '/race' ){

    WTF.canvas = document.getElementById('canvas'),
    WTF.ctx = WTF.canvas.getContext('2d'),
    WTF.steps = 10,
    WTF.r1x = 10,
    WTF.r1y = 80,
    WTF.r2x = 10,
    WTF.r2y = 170,
    WTF.width = 600,
    WTF.height = 241,
    WTF.background = new Image(),
    WTF.runner1 = new Image(),
    WTF.runner2 = new Image(),
    WTF.finished = false,
    WTF.key1 = false,
    WTF.key2 = false,
    WTF.key3 = false,
    WTF.key4 = false,
    WTF.framenumber = 0,
    WTF.countdown = 4;

    WTF.background.src = 'img/bg.gif';
    WTF.runner1.src = 'img/runner1.png';
    WTF.runner2.src = 'img/runner2.png';

    WTF.player1name = null; 
    WTF.player2name = null;

    WTF.gameInit();

}

// Mobile ui page
if( window.location.pathname === '/ui' ) {
    WTF.username = prompt('Enter your name');

    WTF.socket.emit('setName', {
        'username': WTF.username
    }); 
    
    WTF.controls();
}
