function rad(deg) {
    return deg * (Math.PI / 180);
}

var canvas = document.getElementById("logo");
var context = canvas.getContext("2d");
var height = canvas.height;
var width = canvas.width;
var xpos = document.getElementById("xpos");
var ypos = document.getElementById("ypos");
var xtur = document.getElementById("xtur");
var ytur = document.getElementById("ytur");

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}
canvas.addEventListener('mousemove', function(evt) {
  var mousePos = getMousePos(canvas, evt);
  var x = Math.floor(mousePos.x);
  var y = Math.floor(height - mousePos.y);
  xpos.innerHTML = x;
  ypos.innerHTML = y;
}, false);


var turtle = {
    x: 320,
    y: 150,
    r: 0, // obrót żółwia w stopniach.
    cR: 0, // czerwony
    cG: 0, // zielony
    cB: 0, // niebieski
    color: "#000000",
    pen: true,
    forward: function(context, d) {
        newX = this.x + Math.sin(rad(this.r)) * d;
        newY = this.y + Math.cos(rad(this.r)) * d;
        if(this.pen) {
            this.drawLine(context, newX, newY);
        }
        else {
            this.moveLine(context, newX, newY);
        }
        this.x = newX;
        this.y = newY;
        return {x: newX, y: newY};
    },
    backward: function(context, d) {
        this.forward(context, -d);
    },
    rotate: function(d) {
        this.r = (this.r + d) % 360;
        return this.r;
    },
    togglePen: function() {
        this.pen = !this.pen;
    },
    drawLine: function(context, toX, toY) {
        context.beginPath();
        context.moveTo(this.screenX(this.x),this.screenY(this.y));
        context.lineTo(this.screenX(toX),this.screenY(toY));
        context.stroke();
    },
    moveLine: function(context, toX, toY) {
        context.beginPath();
        context.moveTo(this.screenX(toX),this.screenY(toY));
        context.stroke();
    },
    screenX: function(x) {
        return x+0.5;
    },
    screenY: function(y) {
        return 300 - y + 0.5;
    },
    changeColor: function(R,G,B) {
        this.cR = R;
        this.cG = G;
        this.cB = B;
        context.strokeStyle = "rgb(" + this.cR + "," + this.cG + "," + this.cB +")";
    }
}

// button handle
var buttonGo = document.getElementById("click");
var buttonReset = document.getElementById("reset");
var input = document.getElementById("text");

buttonReset.addEventListener("click",function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    turtle.x = 320;
    turtle.y = 150;
    turtle.r = 0;
    turtle.changeColor(0, 0, 0);
    logAppend("reset");
    updateCoords();
});

buttonGo.addEventListener("click",function() {
    var cmd = input.value.split(" ");

    if (cmd.length < 1)
        return;

    if(equals(cmd[0],"pen")) {
        turtle.togglePen();
        var pen = "up";
        if(turtle.pen)
            pen = "down";
        logAppend("pen");
        return;
    }
    if(equals(cmd[0],"reset")) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        turtle.x = 320;
        turtle.y = 150;
        turtle.r = 0;
        turtle.changeColor(0, 0, 0);
        updateCoords();
        logAppend("reset");
    }
    if(equals(cmd[0],"zero")) {
        turtle.x = 0;
        turtle.y = 0;
        turtle.r = 0;
        updateCoords();
        logAppend("zero");
    }
    if(equals(cmd[0],"spirala")) {
        var initialAngle = 48;
        turtle.r = initialAngle;
        for(var i = 0; i < 255; i++) {
            turtle.changeColor(i, i, i);
            turtle.forward(context, 3);
            turtle.r = turtle.r * 0.5^i;
        }
    }

    if (cmd.length < 2) return;
    var num = parseInt(cmd[1]);

    if(equals(cmd[0],"fd")) {
        turtle.forward(context, num);
        logAppend("fd " + num);
    }

    if(equals(cmd[0],"bd")) {
        turtle.backward(context, num);
        logAppend("bd " + num);
    }

    if(equals(cmd[0],"lt")) {
        turtle.rotate(-num);
        logAppend("lt " + num);
    }

    if(equals(cmd[0],"rt")) {
        turtle.rotate(num);
        logAppend("rt " + num);
    }

    if(equals(cmd[0],"color")) {
        var R = 0;
        var G = 0;
        var B = 0;
        if(cmd.length >= 4) {
            R = parseInt(cmd[1]) % 256;
            G = parseInt(cmd[2]) % 256;
            B = parseInt(cmd[3]) % 256;
        }
        turtle.cR = R;
        turtle.cG = G;
        turtle.cB = B;
        turtle.changeColor(R,G,B);
        logAppend("color " + R + " " + G + " " + B);
    }

    if(equals(cmd[0],"wielokat")) {
        if(!turtle.pen) turtle.togglePen();
        var size = 50;
        if(cmd.length >= 3)
            size = cmd[2];
        for(var i = 0; i < num; i++) {
            turtle.forward(context, size);
            turtle.rotate(360 / num);
        }
        logAppend("wielokat " + num + " " + size);
    }
    if(equals(cmd[0],"sierpinski")) {
        var size = 20;
        if(cmd.length >= 3) size = parseInt(cmd[2]);
        sierpinski(size, num);
        logAppend("sierpinski " + num + " " + size);
    }
    if(equals(cmd[0],"hilbert")) {
        var size = 20;
        if(cmd.length >= 3) size = parseInt(cmd[2]);
        hilbert(size, num, 1);
        logAppend("hilbert " + num + " " + size);
    }
    updateCoords();
});

function equals(s1, s2) {
    return new String(s1).valueOf() == new String(s2).valueOf();
}

var log = document.getElementById("log");

function logAppend(text) {
    var div = document.createElement("div");
    div.setAttribute("class", "entry");
    var t = document.createTextNode(text);
    div.appendChild(t);

    div.addEventListener("click",function() {
        input.value = text;
    });

    var child = log.getElementsByClassName("entry")[0];
    log.insertBefore(div,child);
}

function updateCoords() {
    xtur.innerHTML = Math.floor(turtle.x);
    ytur.innerHTML = Math.floor(turtle.y);
}

/*
 * rysowanie krzywej Sierpińskiego
 */
function sierpinski(size, level) {
    turtle.rotate(-45);
    half(size, level);
    turtle.rotate(90);
    turtle.forward(context, size);
    turtle.rotate(90);
    half(size, level);
    turtle.rotate(90);
    turtle.forward(context, size);
    turtle.rotate(90);
    turtle.rotate(45);
}

function half(size, level) {
    if (level == 0) {
        turtle.forward(context, size);
        return;
    }
    half(size, level - 1);
    turtle.rotate(-45);
    turtle.forward(context, size * Math.sqrt(2));
    turtle.rotate(-45);
    half(size, level - 1);
    turtle.rotate(90);
    turtle.forward(context, size);
    turtle.rotate(90);
    half(size, level - 1);
    turtle.rotate(-45);
    turtle.forward(context, size * Math.sqrt(2));
    turtle.rotate(-45);
    half(size, level - 1);
}
/*
 * rysowanie krzywej Hilberta
 */
function hilbert(size, level, ang) {
    if (level == 0)
        return;
    turtle.rotate(90 * ang);
    hilbert(size, level - 1, -ang)
    turtle.forward(context, size);
    turtle.rotate(90 * -ang);
    hilbert(size, level - 1, ang)
    turtle.forward(context, size);
    hilbert(size, level - 1, ang);
    turtle.rotate(90 * -ang);
    turtle.forward(context, size);
    hilbert(size, level - 1, -ang);
    turtle.rotate(90 * ang);
}

function updateInput(t) {
    var input = document.getElementById("text");
    input.value = t;
}

updateCoords();
