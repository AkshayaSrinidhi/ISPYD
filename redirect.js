    function tagName ()
    var finalcanvas = document.createElement('canvas');
    var ctxfinal = finalcanvas.getContext("2d");
    var imageObj = new Image();

    imageObj.onload = function() {
        finalcanvas.width = imageObj.width;
        finalcanvas.height = imageObj.height;

        ctxfinal.drawImage(imageObj, 0, 0, imageObj.width, imageObj.height);
        var canvaslines = document.getElementById("canvasdraw");
        ctxfinal.drawImage(canvaslines, 0, 0, imageObj.width, imageO.height);
        scope.editimage.image = finalcanvas.toDataURL("image.jpeg");
    }

    