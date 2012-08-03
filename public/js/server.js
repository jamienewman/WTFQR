var LOL = LOL || {};

LOL.preloadedAssets = {};
LOL.canvas = null;
LOL.canvasData = [];
LOL.timer = {};
LOL.running = false;

LOL.preloadAssets = function(sources, callback) {
    LOL.preloadedAssets = {};

    var loadedImages = 0;
    var numImages = 0;
    
    for(var src in sources) {
        numImages++;
    }

    for(var src in sources) {
        LOL.preloadedAssets[src] = new Image();
        LOL.preloadedAssets[src].onload = function() {
            if(++loadedImages >= numImages) {
                callback();
            }
        };
        LOL.preloadedAssets[src].src = sources[src];
    }
};

LOL.setupCanvas = function() {
    if(LOL.canvas = document.getElementById('canvas')) {
        LOL.ctx = LOL.canvas.getContext('2d');
        
        LOL.width = 810;
        LOL.height = 1100;

        LOL.updateCanvas();
    }
};

LOL.clearCanvas = function(){
    LOL.ctx.clearRect(0, 0, LOL.width, LOL.height);
};

LOL.updateCanvas = function() {
    if(typeof LOL.ctx !== "undefined") {
        requestAnimationFrame(LOL.updateCanvas);

        LOL.clearCanvas();

        for(var i=0; i<LOL.canvasData.length; i++) {
            if(LOL.canvasData[i].type === "text") {
                LOL.drawText(LOL.canvasData[i].text,LOL.canvasData[i].x,LOL.canvasData[i].y,LOL.canvasData[i].font,LOL.canvasData[i].textAlign,LOL.canvasData[i].fillStyle,LOL.canvasData[i].strokeStyle);
            } else if (LOL.canvasData[i].type === "image") {
                LOL.drawImage(LOL.canvasData[i].imageId, LOL.canvasData[i].x, LOL.canvasData[i].y, LOL.canvasData[i].width, LOL.canvasData[i].height);
            } else if (LOL.canvasData[i].type === "rect") {
                LOL.drawRect(LOL.canvasData[i].x, LOL.canvasData[i].y, LOL.canvasData[i].width, LOL.canvasData[i].height);
            }
        }
    }
};

LOL.drawText = function(text,x,y,font,textAlign,fillStyle,strokeStyle) {
    LOL.ctx.font = font;
    LOL.ctx.textAlign = textAlign;
    LOL.ctx.fillStyle = fillStyle;
    LOL.ctx.strokeStyle = strokeStyle;
    LOL.ctx.fillText(text, x, y);
};

LOL.drawImage = function(imageId,x,y,width,height) {

    if(typeof width !== "undefined" && height !== "undefined") {
        console.log(LOL.preloadedAssets[imageId]);
        LOL.ctx.drawImage(LOL.preloadedAssets[imageId], x, y, width, height);
    } else {
        console.log(imageId);
        LOL.ctx.drawImage(LOL.preloadedAssets[imageId], x, y);
    }
};

LOL.drawRect = function(x,y,width,height){
    /*LOL.ctx.beginPath();
    LOL.ctx.rect(x,y,width,height);
    LOL.ctx.closePath();
    LOL.ctx.fill();
    LOL.ctx.stroke();*/
};

LOL.socket.on('connect', function (data){

    LOL.socket.emit('setChannel', {
        'channelName': 'Race'
    });

    LOL.socket.on('raceData', function(data){
        LOL.canvasData = data.canvasData;
        if(LOL.running === false) {
            LOL.running = true;
            LOL.updateCanvas();
        }
    });

    LOL.socket.on('playerPhoto', function(data){
        
    });

});

$(window).bind('keypress', function(e) {
        console.log('key',e.keyCode);
    var code = (e.keyCode ? e.keyCode : e.which);
    if(code >= 49 && code <= 52) { 
        var player = code - 49;

        var i = 0;

        LOL.socket.emit('debugMove', {'player': player, 'foot': 'left'});
    }
});