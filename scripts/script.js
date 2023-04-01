//zmienne
var score = 0;
var health = 3;
var zombieCount = 0;
var username = "";
var zombieInteval = {};
const board = document.querySelector("#board");
const menu = document.querySelector("#name-prompt");
const nameOnSite = document.querySelector("#name");
const hs = document.querySelector("#hs");
const mouse = document.querySelector("#gamecursor");
const elScore = document.querySelector("#score");

//funkcje

//score
function updateScore(){
    //funkcja ustawiajaca wynik
    elScore.textContent=score;
}

function boardShot(){
    //strzal w tyl
    score -= 6;
    updateScore();
}
function zombieShot(){
    //strzal zombie
    score += 18;
    updateScore();
    clearInterval(zombieInteval[this.id]);
    this.remove();
}

function followcursor(e){
    //ustawienia celownika, kursora
    document.querySelector("#gamecursor").style.display = "flex";
    mouse.style.top = e.pageY + "px";
    mouse.style.left = e.pageX + "px";
}


//zombie
function zombieSpeed(speed){ //ustawiamy interval zaleznie od predkosci naszego zombie
    //5 grup z rozna predkoscia
    let interval;
    switch(speed){
        case 1:
            interval=85;
            break;
        case 2:
            interval = 70;
            break;
        case 3:
            interval=55;
            break;
        case 4:
            interval=35;
            break;
        case 5:
            interval=20;
            break;
        default:
            interval=35;
            break;
    }
    return interval;
}

function animateZombie(el, speed){
    //dlugosc obrazka
    let offset = 200;
    //pozycja na mapie
    let curPos = 0;
    //animacja
    let curBgPos = 0;
    //predkosc zombie
    let interval = zombieSpeed(speed);
    zombieInteval[el.id] = setInterval ( () => {
        //animacja
        el.style.backgroundPosition = curBgPos + offset +"px 0px";
        //przesuwanie
        el.style.left = 101 - curPos + "vw";
        curBgPos -= offset;
        curPos++;
        if (curBgPos==-1800)
            //zapetlenie animacji
            curBgPos=0;
        if(curPos==110){
            //dotarcie do konca
            el.remove();
            score -= 6;
            health -= 1;
            updateScore();
            if(health <= 0)
                //zakonczenie gry po utracie zdrowia 
                gameEnd();
            clearInterval(zombieInteval[el.id]);
        }
    }, interval);
}

function spawnZombie(speed, top, size, start_pos){
    //stworzenie elementu
    let zombie = document.createElement("div");
    //cechy zombie
    zombie.classList.add("zombie");
    zombie.style.top = 30 + top + "vh";
    zombie.style.left = 100 + start_pos + "vw";
    zombie.style.transform = "scale(" + size + ")";
    //strzal do zombie
    zombie.addEventListener("click", zombieShot);
    //relacje
    zombie.setAttribute("id", zombieCount);
    board.appendChild(zombie);
    zombieCount++;
    //dodanie animacji ^
    animateZombie(zombie, speed);
}

function generateZombie(){
    //prędkość
    let speed = Math.round(Math.random()*5);
    //vertical
    let top = Math.round(Math.random()*30);
    //rozmiar zombie
    let size = Math.round(((Math.random()*6+6)/10));
    //horizontal, to sprawia, ze przychodza w roznym czasie
    let start_pos = Math.round(Math.random()*20);
    //spawnowanie zombie ^
    spawnZombie(speed,top, size, start_pos);
}

//game
function start(){
    if (!document.getElementById("username").checkValidity()){
        return;
    }
    let form = document.getElementById("username").value;
    //ukrycie menu
    menu.style.display = "none";
    //ustawienie nicku
    nameOnSite.textContent="Hi " + form + "!";
    username = form;
    //inicjalizacja gry
    gameStart();
}

function gameStart(){
    //ekran highscores
    hs.style.display = "none";
    //zmienne
    health = 3;
    score = 0;
    updateScore();
    zombieCount = 0;
    //kursor
    document.body.style.cursor="none";
    window.addEventListener("mousemove", followcursor);
    //tył
    board.addEventListener("click", boardShot);
    //wyczyszczenie zombie po poprzedniej grze
    let zombies = document.querySelectorAll("div.zombie");
    for (let i = 0; i < zombies.length; i++){
        zombies[i].remove();
    }
    //spawnowanie zombie cykliczne
    gameRunning = setInterval ( () => {
        generateZombie();
    }, 777);
}

function gameEnd(){
    //ekran highscores 
    hs.style.display = "flex";
    //kursor
    document.body.style.cursor="default";
    window.removeEventListener("mousemove", followcursor);
    //tyl
    board.removeEventListener("click", boardShot);
    //usuniecie poruszania zombie i spawnowania zombie
    clearInterval(gameRunning);
    Object.keys(zombieInteval).forEach(function(key) {
        clearInterval(zombieInteval[key]);
    });
    updateHighscores();
}

async function sendScore(data) {
    //wysylanie danych do jsona
    const response = await fetch("https://jsonblob.com/api/jsonBlob/1091799483607695360", {
        method: 'PUT', 
        mode: 'cors', 
        cache: 'no-cache', 
        redirect: 'follow',
        headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        body: JSON.stringify(data)
    });
    return response.json();
}

async function updateHighscores(){
    //pobranie danych z jsona, aktualizacja ich, wypisanie na stronie i wywolanie przeslania do jsona
    let data = await fetch("https://jsonblob.com/api/jsonBlob/1091799483607695360")
                     .then(res => res.json());
    //formatowanie daty
    let date = new Date();
    let yyyy = date.getFullYear();
    let mm = date.getMonth() + 1;
    let dd = date.getDate();
    data.push({"name": username,"score":score, "date": dd + "/" + mm + "/" + yyyy});
    data.sort(compare);
    var entries = document.querySelectorAll("li");
    for (var i = 0; i < entries.length; i++) {
        entries[i].remove();
    }
    for (var i = 0; i < Math.min(data.length, 7); i++){
        var entry = document.createElement("li");
        entry.textContent = "nick: " + data[i]["name"] + ", pkt: " + data[i]["score"] + ', data: ' + data[i]["date"];
        document.querySelector("#hs-list").appendChild(entry);
    }
    await sendScore(data);
}

//obsluga highscores
function compare(a,b){
    return (b["score"]-a["score"]);
}


//listenery

//wlasciwe wywolanie gry
document.getElementById("gamestart").addEventListener("click", start);
//wywolanie po resecie
document.getElementById("gamestart2").addEventListener("click",start);

