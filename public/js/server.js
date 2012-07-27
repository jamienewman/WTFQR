var LOL = LOL || {};

LOL.preloadedAssetCount = 0;
LOL.preloadedAssetCountLoaded = 0;
LOL.preloadedAssets = {};
LOL.canvas = null;
LOL.canvasData = [];
LOL.timer = {};
LOL.startedDrawing = false;

LOL.preloadAsset = function(imageURL) {
    var preloadedImage = new Image();
    (function(preloadedImage, imageURL) {
        preloadedImage.onload = function() {
            LOL.preloadedAssets[imageURL] = preloadedImage;
            LOL.preloadedAssetCountLoaded++;
        };
    }(preloadedImage,imageURL));
    preloadedImage.src = imageURL;
};

LOL.preloadAssets = function(imageURLs) {
    LOL.preloadedAssetCount = (imageURLs.length-1);
    for(var i = 0; i < imageURLs.length; i++) {
        if(imageURLs[i] !== "") {
            LOL.preloadAsset(imageURLs[i]);
        }
    }
    LOL.timer = window.setInterval(function(){
        console.log(LOL.preloadedAssetCount, LOL.preloadedAssetCountLoaded);
        if(LOL.preloadedAssetCount === LOL.preloadedAssetCountLoaded) {
            console.log('setting up');
            clearInterval(LOL.timer);
            LOL.setupCanvas();
        }
    },100);
};

LOL.getAsset = function(imageURL) {
    return LOL.preloadedAssets[imageURL];
};

LOL.setupCanvas = function() {
    if(LOL.canvas = document.getElementById('canvas')) {
        LOL.ctx = LOL.canvas.getContext('2d');
        
        LOL.width = 810;
        LOL.height = 1100;

        console.log('canvas');

        LOL.socket.on('connect', function (data){

            LOL.socket.emit('setChannel', {
                'channelName': 'Race'
            });

            LOL.socket.on('raceData', function(data){
                console.log('race data');
                LOL.canvasData = data.canvasData;
                if(LOL.startedDrawing === false) {
                    LOL.startedDrawing = true;
                    LOL.updateCanvas();
                }
            });
        });
    }
};

LOL.clearCanvas = function(){
    LOL.ctx.clearRect(0, 0, LOL.width, LOL.height);
};

LOL.updateCanvas = function() {

    requestAnimationFrame(LOL.updateCanvas);

    LOL.clearCanvas();

    console.log(LOL.canvasData);

    for(var i=0; i<LOL.canvasData.length; i++) {
        console.log(i);
        if(LOL.canvasData[i].type === "text") {
            LOL.drawText(LOL.canvasData[i].text,LOL.canvasData[i].x,LOL.canvasData[i].y,LOL.canvasData[i].font,LOL.canvasData[i].textAlign,LOL.canvasData[i].fillStyle,LOL.canvasData[i].strokeStyle);
        } else if (LOL.canvasData[i].type === "image") {
            LOL.drawImage(LOL.canvasData[i].imageURL, LOL.canvasData[i].x, LOL.canvasData[i].y, LOL.canvasData[i].width, LOL.canvasData[i].height);
        } else if (LOL.canvasData[i].type === "rect") {
            LOL.drawRect(LOL.canvasData[i].x, LOL.canvasData[i].y, LOL.canvasData[i].width, LOL.canvasData[i].height);
        } else if (LOL.canvasData[i].type === "dataImage") {
            LOL.drawDataImage(LOL.canvasData[i].imageData, LOL.canvasData[i].x, LOL.canvasData[i].y, LOL.canvasData[i].width, LOL.canvasData[i].height);
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

LOL.drawImage = function(imageURL,x,y,width,height) {
    if(typeof LOL.getAsset(imageURL) === "undefined") {
        var image = new Image();
        (function() { 
            image.onload = function() {
                if(typeof width !== "undefined" && height !== "undefined") {
                    LOL.ctx.drawImage(image, x, y, width, height);
                } else {
                    LOL.ctx.drawImage(image, x, y);
                }
            };
        }(image,x,y,width,height));
        image.src = imageURL;
    } else {
        if(typeof width !== "undefined" && height !== "undefined") {
            LOL.ctx.drawImage(LOL.getAsset(imageURL), x, y, width, height);
        } else {
            LOL.ctx.drawImage(LOL.getAsset(imageURL), x, y);
        }
    }
};

LOL.drawDataImage = function(imageData,x,y,width,height) {
    var image = new Image();
    image.onload = function() {
        LOL.ctx.drawImage(image, x, y, width, height);
    };
    image.src = imageData;
};

LOL.drawRect = function(x,y,width,height){
    LOL.ctx.beginPath();
    LOL.ctx.rect(x,y,width,height);
    LOL.ctx.closePath();
    LOL.ctx.fill();
    LOL.ctx.stroke();
};