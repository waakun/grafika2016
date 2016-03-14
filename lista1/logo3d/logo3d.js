/* ekran
 * width, height : rozmiary canvas
 */
var canvas = document.getElementById("logo");
var context = canvas.getContext("2d");
context.strokeStyle = "rgb(255,255,255)";
var display = {
    width: canvas.width,
    height: canvas.height
};

// sinus i cosinus dla leniwych ( ͡°ᨓ ͡°)
var pi = Math.PI;
var sin = Math.sin;
var cos = Math.cos;
function deg(rad) {
    return rad * (180 / Math.PI);
}

// obserwator
var obs = {
    // Współrzędne kamery
    cX: 9.0, cY: 0.0, cZ: 0.0,
    // Obrót kamery w radianach (180 deg = PI rad)
    rX: 0.0, rY: 0.0, rZ: 0.0,
    // field of view
    fov: pi / 2,
    changePosition: function(x, y, z) {
        this.cX += x;
        this.cY += y;
        this.cZ += z;
        renderAll();
    },

    changeRotation: function(x, y, z) {
        this.rX += x;
        this.rY += y;
        this.rZ += z;
        renderAll();
    },

    changeFOV: function(fov) {
        if(this.fov > Math.PI - 0.2 && fov > 0)
            return;
        if(this.fov < 0.1 && fov < 0)
            return;
        this.fov += fov;
        renderAll();
    },

    // Funkcja wyznacza współrzędne X i Y punktu w przestrzeni trójwymiarowej rzutowanego na przestrzeń dwuwymiarową.
    projection: function(pX, pY, pZ) {
        // Wyznaczenie wektora d – wektor określa pozycję rzutowanego punktu w stosunku do położenia kamery (początkiem układu jest wtedy punkt c obrócony o kąt r)
        x = pX - this.cX;
        y = pY - this.cY;
        z = pZ - this.cZ;

        sX = sin(this.rX);
        sY = sin(this.rY);
        sZ = sin(this.rZ);
        csX = cos(this.rX);
        csY = cos(this.rY);
        csZ = cos(this.rZ);

        dX = csY * (sZ*y + csZ*x) - sY*z;
        dY = sX * (csY*z + sY * (sZ*y + csZ*x)) + csX * (csZ*y - sZ*x);
        dZ = csX * (csY*z + sY * (sZ*y + csZ*x)) - sX * (csZ*y - sZ*x);

        // ASPECT RATIO
        ratio = display.width / display.height;

        R = this.fov / 2;
        // rozmiar "okna" zależy od odległości Z punktu od 0,0,0.
        sizeFactor = dZ;

        // zakładamy, że ekran jest kwadratowy [100px,100px], czyli środek jest w [50px,50px]
        // maksymalna współrzędna Y na ekranie
        windowSizeY = sizeFactor * Math.tan(R);
        // maksymalna współrzędna X na ekranie
        windowSizeX = windowSizeY * ratio;
        // przenieś współrzędną z 3D na 2D
        bX = dX + windowSizeX/2;
        bY = dY + windowSizeY/2;
        // współrzędne canvas
        canvasX = bX * display.width / windowSizeX;
        canvasY = display.height - bY * display.height / windowSizeY;

        return {x:canvasX, y:canvasY};
        //return {bX:bX, bY:bY, wsX:windowSizeX, wsY:windowSizeY, dX:dX, dY:dY, dZ:dZ, canvasX:canvasX, canvasY:canvasY};
    }
};

/* klasa linia
 * fromX, fromY, fromZ
 * toX, toY, toZ
 */
function Line(p, r) {
    this.p = p;
    this.r = r;
}
function Line(fromX, fromY, fromZ, toX, toY, toZ) {
    this.p = { x:fromX, y:fromY, z:fromZ };
    this.r = { x:toX, y:toY, z:toZ };
}

// renderuje linię na ekranie
function render(line, obs) {
    // weź współrzędne punktu 1
    var projP = obs.projection(line.p.x, line.p.y, line.p.z);
    // weź współrzędne punktu 2
    var r = {x:0,y:-3,z:7};
    var projR = obs.projection(line.r.x, line.r.y, line.r.z);
    // narysuj
    context.beginPath();
    context.moveTo(projP.x,projP.y);
    context.lineTo(projR.x,projR.y);
    context.stroke();
}

var lines = new Array(); // tablica linii zakreślonych przez żółwia
lines.push(new Line(0,-3,7, 0,-3,200));
lines.push(new Line(0,-3,200, 24,-3,200));
lines.push(new Line(0,-3,200, 0,33,200));
lines.push(new Line(24,-3,200, 0,33,200));
lines.push(new Line(24,-3,7, 0,33,200));
lines.push(new Line(24,-3,200, 24,-3,7));
lines.push(new Line(24,-3,7, 0,-3,7));
// cube
lines.push(new Line(30,30,30, 30,30,50));
lines.push(new Line(30,30,30, 30,50,30));
lines.push(new Line(30,30,30, 50,30,30));
lines.push(new Line(50,50,50, 50,50,30));
lines.push(new Line(50,50,50, 50,30,50));
lines.push(new Line(50,50,50, 30,50,50));
lines.push(new Line(50,50,30, 50,30,30));
lines.push(new Line(50,30,50, 50,30,30));
lines.push(new Line(50,30,50, 30,30,50));
lines.push(new Line(30,30,50, 30,50,50));
lines.push(new Line(30,50,30, 50,50,30));
lines.push(new Line(30,50,30, 30,50,50));

function updateStat() {
    document.getElementById("cX").innerHTML = obs.cX;
    document.getElementById("cY").innerHTML = obs.cY;
    document.getElementById("cZ").innerHTML = obs.cZ;
    document.getElementById("rX").innerHTML = Math.round(deg(obs.rX))+"&deg;";
    document.getElementById("rY").innerHTML = Math.round(deg(obs.rY))+"&deg;";
    document.getElementById("rZ").innerHTML = Math.round(deg(obs.rZ))+"&deg;";
    document.getElementById("fov").innerHTML = Math.round(deg(obs.fov))+"&deg;";
}

function renderAll() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for(i = 0; i < lines.length; i++) {
        render(lines[i], obs);
    }
    updateStat();
}
renderAll();

// obsługa klawiatury
document.onkeydown = checkKey;

function checkKey(e) {
    e = e || window.event;

    if (e.keyCode == '38') { // up
        obs.changePosition(0,0,1);
    }
    else if (e.keyCode == '40') { // down
        obs.changePosition(0,0,-1);
    }
    else if (e.keyCode == '37') { // left
        obs.changeRotation(0,-1/32,0);
    }
    else if (e.keyCode == '39') { // right
        obs.changeRotation(0,1/32,0);
    }
    // fov
    else if (e.keyCode == '81') // q
        obs.changeFOV(1/32);
    else if (e.keyCode == '87') // w
        obs.changeFOV(-1/32);

}
