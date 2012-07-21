WTF.socket.on('connect', function (data){
    
    WTF.socket.emit('setChannel', {
        'channelName': 'Race'
    });

    WTF.socket.on('playerCount', function(data){
        if(WTF.raceStatus === "waiting") {
            WTF.remainingPlayers = WTF.numPlayers - parseInt(data.number);

            WTF.playerThumbs = [];

            for(var i=0; i<data.photos.length; i++) {
                var newImage = new Image();
                newImage.load = function() {
                    WTF.playerThumbs.push(this);
                }
                newImage.src = data.photo;
            }
        }
    });

    WTF.socket.on('raceData', function(data){
        if (WTF.raceStatus !== "started"){
            return;
        }

        if(data.foot == 'left') {
            if(WTF.users[data.userId].image.src.indexOf('_2.png') >= 0) {
                WTF.users[data.userId].image.src = WTF.users[data.userId].image.src.replace('_2.png', '.png');
            }
        }

        if(data.foot == 'right') {
            if(WTF.users[data.userId].image.src.indexOf('_2.png') < 0) {
                WTF.users[data.userId].image.src = WTF.users[data.userId].image.src.replace('.png', '_2.png');
            }
        }      

        WTF.users[data.userId].x += WTF.steps;

    });

});

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
    
    WTF.ctx.drawImage(WTF.background, 0, -500);
        
    WTF.framenumber++;
    
    if (WTF.framenumber % 100 === 0 && WTF.countdown){
        WTF.countdown--;
    }

    if (WTF.countdown >= 2){
        WTF.ctx.font = "bold 40px sans-serif";
        WTF.ctx.fillText(WTF.countdown-1, WTF.width / 2, 231);
        WTF.ctx.textAlign = "center";
    }

    if (WTF.countdown === 1){
        WTF.ctx.font = "bold 40px sans-serif";
        WTF.ctx.fillText("GO", WTF.width / 2, 231);
        WTF.ctx.textAlign = "center";
        WTF.raceStatus = "started";
    }

    for(var userId in WTF.users) {
        WTF.ctx.font = "bold 20px sans-serif";
        WTF.ctx.textAlign = "left";
        WTF.ctx.fillText(WTF.users[userId].name, 100, (WTF.users[userId].y + 55));
        //WTF.ctx.drawImage(WTF.users[userId].photo, 400, (WTF.users[userId].y + 35), 25, 25);
        WTF.ctx.drawImage(WTF.users[userId].image, WTF.users[userId].x, WTF.users[userId].y);
        if(WTF.users[userId].x >= 926 && WTF.users[userId].playing === true) {
            WTF.users[userId].playing = false;
            WTF.users[userId].name = WTF.users[userId].name+" ("+WTF.nextPosition+")";
            WTF.socket.emit('playerFinished', {
                'username': userId,
                'position': WTF.nextPosition++
            });
        }
    }
};

WTF.canvasY = 0;
WTF.canvasMaxY = 500;

WTF.openingCeremony = function() {
    console.log(WTF.canvasY, WTF.canvasMaxY);
    if(WTF.canvasY <= WTF.canvasMaxY) {
        requestAnimationFrame(WTF.openingCeremony);
        WTF.drawOpeningCeremony();
    } else {
        WTF.gameInit();
    }
}

WTF.drawOpeningCeremony = function() {
    WTF.clearCanvas();

    WTF.rect(0,0, WTF.width, WTF.height);
    
    WTF.ctx.drawImage(WTF.background, 0, parseInt("-"+(++WTF.canvasY), 10));
}

WTF.updatePlayers = function() {
    if(WTF.remainingPlayers === 0) {
        WTF.startRace();
        return;
    }
    requestAnimationFrame(WTF.updatePlayers);

    WTF.ctx.drawImage(WTF.background, 0, 0);
    WTF.ctx.drawImage(WTF.qrImage, 330, 80, 300, 300);

    WTF.ctx.font = "bold 36px sans-serif";
    WTF.ctx.textAlign = "center";
    WTF.ctx.fillStyle = "black";
    WTF.ctx.strokeStyle = "black";
    WTF.ctx.fillText("Waiting for "+WTF.remainingPlayers+ " players", (WTF.width /2), 450);
    
    /*for(var i=0; i<WTF.playerThumbs.length; i++) {
        WTF.ctx.drawImage(WTF.qrImage, 330, 80, 300, 300);
    }*/

}

WTF.setupCanvas = function() {
    WTF.raceStatus = "waiting";

    if(WTF.canvas = document.getElementById('canvas')) {
        WTF.ctx = WTF.canvas.getContext('2d');

        WTF.remainingPlayers = WTF.numPlayers;
        
        WTF.width = 960;
        WTF.height = 1100;

        WTF.background = new Image();
        WTF.background.onload = function() {
            WTF.updatePlayers();
        };
        WTF.background.src = 'img/bg-full.png';

        //WTF.gameInit();
    }
}

WTF.startRace = function() {
    WTF.raceStatus = "starting";

    WTF.steps = 10,
    WTF.xStart = 10,
    WTF.yStart = 261,
    WTF.xOffset = 90,
    WTF.yOffset = 90,
    WTF.raceStatus = "finished",
    WTF.key1 = false,
    WTF.key2 = false,
    WTF.key3 = false,
    WTF.key4 = false,
    WTF.framenumber = 0,
    WTF.nextPosition = 1,
    WTF.countdown = 4;

    var i = 0;

    for(var userId in WTF.users) {
        //$('.racers ol').append('<li><img src="'+WTF.users[userId].photo.src+'" /> '+WTF.users[userId].name+'</li>')
        WTF.users[userId].x = WTF.xStart;
        WTF.users[userId].y = (WTF.yStart + (WTF.yOffset * i++));
        WTF.users[userId].image = new Image();
        WTF.users[userId].image.src = 'img/runner'+i+'.png';
        WTF.users[userId].photo = new Image();
        WTF.users[userId].photo.src = WTF.users[userId].photoSrc;
        WTF.users[userId].playing = true;
    }

    WTF.openingCeremony();
}
