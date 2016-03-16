// Ekran
var canvas = document.getElementById("logo");
var context = canvas.getContext("2d");
context.strokeStyle = "rgb(255,255,255)";
var display = {
    width: canvas.width,
    height: canvas.height
};
// Wyświetlanie siatki i układu współrzędnych
var displayGrid = true;
var displayGizmo = true;

// sinus i cosinus dla leniwych ( ͡°ᨓ ͡°)
var pi = Math.PI;
var sin = Math.sin;
var cos = Math.cos;
var tan = Math.tan;
// do wyświetlenia na stronie
function deg(rad) {
    return rad * (180 / Math.PI);
}

// Odcinek
function Line(fromX, fromY, fromZ, toX, toY, toZ) {
    this.p = { x:fromX, y:fromY, z:fromZ };
    this.r = { x:toX, y:toY, z:toZ };
}

function renderGizmo() {
    // Długość
    length = 5;
    // Grubość linii
    context.lineWidth=3;
    // X
    context.strokeStyle = "rgba(255,0,0,0.2)";
    render(new Line(0, 0, 0, length, 0, 0));
    // Y
    context.strokeStyle = "rgba(0,255,0,0.2)";
    render(new Line(0, 0, 0, 0, length, 0));
    // Z
    context.strokeStyle = "rgba(0,0,255,0.2)";
    render(new Line(0, 0, 0, 0, 0, length));
    // Reset ustawień
    context.strokeStyle = "rgb(255,255,255)";
    context.lineWidth=1;

}

// Renderuje linie siatki na ekranie wokół początku układu współrzędnych
function renderGrid() {

    // Odległość między elementami siatki
    interval = 10;

    // Wielkość siatki
    size = 5;

    for(var i = -size; i <= size; i++) {

        // Jaśniejsza linia w zerze
        if(i == 0) context.strokeStyle = "rgba(255,255,255,0.3)";
        else context.strokeStyle = "rgba(255,255,255,0.1)";

        // Linia na osi X
        render(new Line(
            -size * interval, 0, i * interval,
            size * interval, 0, i * interval));
        // Linia na osi Z
        render(new Line(
            i * interval, 0, -size * interval,
            i * interval, 0, size * interval));
    }

    // Powrót do ustawień domyślnych
    context.strokeStyle = "rgb(255,255,255)";
}

// Zwraca linię w której oba punkty mają współrzędną Z nieujemną.
function cropLine(p, r) {

    // Zamiana punktów tak, by p miał współrzędną Z < 0.
    if(r.z < 0) {
        tmp = p;
        p = r;
        r = tmp;
    }
    // Jeśli oba punkty mają współrzędne Z >= 0, nic nie trzeba robić.
    else if(p.z >= 0 && r.z >= 0)
        return {p:p, r:r};

    // Przeprowadzamy operacje na punkcie p. Chcemy obciąć linię tak, by
    // współrzędna Z punktu p była równa zero. Można skorzystać ze zwyczajnej
    // proporcji, jako że operujemy na linii prostej.

    // Długości rzutów odcinka na współrzędnych.
    lengthX = r.x - p.x;
    lengthY = r.y - p.y;
    lengthZ = r.z - p.z;

    // Współczynnik nowej długości odcinka na współrzędnej Z do starej.
    factor = r.z / lengthZ;

    // Nowe współrzędne punktu p
    p.x = r.x - (lengthX * factor);
    p.y = r.y - (lengthY * factor);

    // TODO: aktualna wartość powinna wynosić zero, ale spowodowałoby to
    // dzielenie przez zero w funckji obs.projection.
    p.z = 0.05;

    return {p:p, r:r};

}

// Rysuje linię na ekranie
function render(line) {

    // Pozycja w stosunku do kamery obu punktów
    var cpP = obs.relativePosition(line.p.x, line.p.y, line.p.z);
    var cpR = obs.relativePosition(line.r.x, line.r.y, line.r.z);

    // Jeżeli Z obu linii jest ujemny lub równy zero (cała linia znajduje się
    // za obserwatorem), wtedy nic nie jest rysowane.
    if(cpP.z < 0 && cpR.z < 0)
        return;

    // Obetnij linię tak, by zaczynała się na Z dodatnim lub równym zero
    var cropped = cropLine(cpP, cpR);

    // Współrzędne canvas punktu p
    var pP = obs.newProjection(cropped.p.x, cropped.p.y, cropped.p.z);
    // Współrzędne canvas punktu r
    var pR = obs.newProjection(cropped.r.x, cropped.r.y, cropped.r.z);

    // Narysuj
    context.beginPath();
    context.moveTo(pP.x,pP.y);
    context.lineTo(pR.x,pR.y);
    context.stroke();
}

// Wyświetlanie wszystkich obiektów
function renderAll(lines) {

    // Reset płótna
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Wyświetlanie siatki
    if(grid) renderGrid();

    // Wyświetlanie gizmo
    if(gizmo) renderGizmo();

    // Wyświetlanie linii
    for(i = 0; i < lines.length; i++) {
        render(lines[i], obs);
    }

    // Aktualizacja statystyk
    updateStat();
}

// Obserwator (kamera)
var obs = {
    // Współrzędne kamery
    cX: 75.0, cY: 40.0, cZ: -75.0,
    // Obrót kamery w radianach (180 deg = PI rad)
    rX: pi/8, rY: -pi/4, rZ: 0.0,
    // Kąt widzenia (field of view)
    fov: pi / 2,
    // Zmiana pozycji kamery
    // TODO: zmodyfikować tak, by zmiana pozycji była uzależniona od obrotu
    // kamery, aktualnie jest to trochę niedopracowane
    changePosition: function(x, y, z) {
        this.cX += x;
        this.cY += y;
        this.cZ += z;
        renderAll(turtle.lines);
    },
    // Obrót kamery, prawdopodobnie obrót wokół osi Z nie będzie potrzebny
    changeRotation: function(x, y, z) {
        this.rX += x;
        this.rY += y;
        this.rZ += z;
        renderAll(turtle.lines);
    },
    // statyczne ustawienie kamery
    setRotation: function(x, y, z) {
        this.rX = x;
        this.rY = y;
        this.rZ = z;
        renderAll(turtle.lines);
    },
    // Zmiana kąta widzenia na przedziale [0.2, PI-0.2]
    changeFOV: function(fov) {
        if(this.fov > Math.PI - 0.2 && fov > 0)
            return;
        if(this.fov < 0.2 && fov < 0)
            return;
        this.fov += fov;
        renderAll(turtle.lines);
    },

    // Funkcja wyznacza współrzędne danego punktu w stosunku do kamery
    // (i jej obrotu).
    relativePosition: function(pX, pY, pZ) {

        x = pX - this.cX;
        y = pY - this.cY;
        z = pZ - this.cZ;

        sX = sin(this.rX);
        sY = sin(this.rY);
        sZ = sin(this.rZ);

        csX = cos(this.rX);
        csY = cos(this.rY);
        csZ = cos(this.rZ);

        // Wyznaczenie wektora d – wektor określa pozycję rzutowanego punktu w
        // stosunku do położenia kamery (początkiem układu jest wtedy punkt c
        // obrócony o kąt r). Wykorzystane wzory pochodzą ze strony
        // https://en.wikipedia.org/wiki/3D_projection#Perspective_projection
        dX = csY * (sZ*y + csZ*x) - sY*z;
        dY = sX * (csY*z + sY * (sZ*y + csZ*x)) + csX * (csZ*y - sZ*x);
        dZ = csX * (csY*z + sY * (sZ*y + csZ*x)) - sX * (csZ*y - sZ*x);

        return {x:dX, y:dY, z:dZ};
    },

    // Funkcja wyznacza współrzędne canvas przygotowanego punktu ustawionego
    // w układzie współrzędnych relatywnym do obserwatora.
    newProjection: function(dX, dY, dZ) {
        // ASPECT RATIO
        ratio = display.width / display.height;
        R = this.fov / 2;
        // Rozmiar "okna" zależy od odległości Z punktu od 0,0,0.
        sizeFactor = dZ;

        // Maksymalna współrzędna Y na ekranie
        windowSizeY = sizeFactor * Math.tan(R);
        // Maksymalna współrzędna X na ekranie
        windowSizeX = windowSizeY * ratio;
        // Przenieś współrzędną z 3D na 2D
        bX = dX + windowSizeX / 2;
        bY = dY + windowSizeY / 2;
        // Współrzędne canvas
        canvasX = bX * display.width / windowSizeX;
        canvasY = display.height - bY * display.height / windowSizeY;

        return {x:canvasX, y:canvasY};
    }
};

// Żółw
var turtle = {
    // Pozycja żółwia w przestrzeni 3D
    pX: 0, pY: 0, pZ: 0,
    // Obrót żółwia
    rPhi: 0, rTheta: 0,
    // Stan pisaka: true: włączony, false: wyłączony
    pen: true,
    // Linie
    lines: new Array(),

    // Zmiana trybu pisaka
    togglePen: function() {
        this.pen = !this.pen;
    },
    // Tworzenie linii
    createLine: function(fromX, fromY, fromZ, toX, toY, toZ) {
        this.lines.push(new Line(fromX, fromY, fromZ, toX, toY, toZ));
    },

    // Ruch
    forward: function(d) {

        // Wektor przesunięcia
        // https://en.wikipedia.org/wiki/Spherical_coordinate_system
        dX = d * sin(this.rTheta) * cos(this.rPhi);
        dY = d * sin(this.rTheta) * sin(this.rPhi);
        dZ = d * cos(this.rTheta);

        // Przesunięcie
        nX = this.pX + dX;
        nY = this.pY + dY;
        nZ = this.pZ + dZ;

        // Dodanie linii
        this.createLine(this.pX, this.pY, this.pZ, nX, nY, nZ);

        // Zmiana położenia
        this.pX = nX;
        this.pY = nY;
        this.pZ = nZ;

        // Przerysowanie canvas
        renderAll(this.lines);
    },
    backward: function(d) {
        this.forward(-d);
    },
    // Obrót
    rotatePhi: function(d) {
        this.rPhi += d;
    },
    rotateTheta: function(d) {
        this.rTheta += d;
    },
    rotateLeft: function(d) { },
    rotateRight: function(d) { }
};

// Aktualizacja informacji o kamerze i żółwiu na stronie
function updateStat() {
    document.getElementById("cX").innerHTML = obs.cX;
    document.getElementById("cY").innerHTML = obs.cY;
    document.getElementById("cZ").innerHTML = obs.cZ;
    document.getElementById("rX").innerHTML = Math.round(deg(obs.rX))+"&deg;";
    document.getElementById("rY").innerHTML = Math.round(deg(obs.rY))+"&deg;";
    document.getElementById("rZ").innerHTML = Math.round(deg(obs.rZ))+"&deg;";
    document.getElementById("fov").innerHTML = Math.round(deg(obs.fov))+"&deg;";
    document.getElementById("tX").innerHTML = Math.round(turtle.pX);
    document.getElementById("tY").innerHTML = Math.round(turtle.pY);
    document.getElementById("tZ").innerHTML = Math.round(turtle.pZ);
    document.getElementById("tTheta").innerHTML = Math.round(deg(turtle.rTheta))+"&deg;";
    document.getElementById("tPhi").innerHTML = Math.round(deg(turtle.rPhi))+"&deg;";
}

// Obsługa klawiatury
document.onkeydown = checkKey;
function checkKey(e) {
    e = e || window.event;
    if (e.keyCode == '38') // up
        obs.changePosition(0,0,1);
    else if (e.keyCode == '40') // down
        obs.changePosition(0,0,-1);
    // obrót
    else if (e.keyCode == '37') // left
        obs.changePosition(-1,0,0);
    else if (e.keyCode == '39') // right
        obs.changePosition(1,0,0);
}

// Obsługa rolki
window.onwheel = function(){ return false; }
canvas.addEventListener("wheel", checkWheel, false);
function checkWheel(e) {
    var ctrl = e.ctrlKey;
    if(e.ctrlKey)
        obs.changeFOV(1/32 * e.deltaY);
    else if(e.altKey)
        obs.changeRotation(1/32 * e.deltaY,0,0);
    else if(e.shiftKey)
        obs.changeRotation(0,1/32 * e.deltaY,0);
    else
        obs.changePosition(0,-1 * e.deltaY,0);
}

// Modyfikacja kamery środkowym przyciskiem
var modCam = false;
var startX = 0;
var startY = 0;
var startRotX = 0;
var startRotY = 0;
var maxRotX = Math.PI / display.width;
var maxRotY = Math.PI / display.height;

// Ruch myszką
canvas.addEventListener("mousemove", moveCamera, false);
function moveCamera(e) {
    if(modCam) {
        x = e.offsetX - startX;
        y = e.offsetY - startY;
        rotX = x * maxRotX + startRotX;
        rotY = y * maxRotY + startRotY;
        obs.setRotation(rotY,rotX,obs.rZ);
    }
}

// Wciśnięcie przycisku
canvas.addEventListener("mousedown", checkButton, false);
function checkButton(e) {
    modCam = e.which == 2;
    if(modCam) {
        startRotX = obs.rY;
        startRotY = obs.rX;
        startX = e.offsetX;
        startY = e.offsetY;
    }
}

// Zwolnienie przycisku
canvas.addEventListener("mouseup", downButton, false);
function downButton(e) {
    modCam = false;
}

// Wyświetlanie siatki/gizmo
function gridDisplay() {
    grid = document.getElementById('grid').checked;
    renderAll(turtle.lines);
}
function gizmoDisplay() {
    gizmo = document.getElementById('gizmo').checked;
    renderAll(turtle.lines);
}

// Początkowe odpalenie
window.onload = function() {
    renderAll(turtle.lines);
}
