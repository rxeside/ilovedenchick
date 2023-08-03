// Создание игрового поля
let gameBoard = document.getElementById("game-board");
gameBoard.style.height = innerHeight * 0.8 + "px";
gameBoard.style.width = gameBoard.style.height;
let boardSide = gameBoard.clientHeight;
let marginLeft = (innerWidth - boardSide) / 2;
console.log("marginLeft: ", marginLeft);
let marginTop = innerHeight - boardSide;
gameBoard.style.top = marginTop / 2 + "px";
gameBoard.style.left = marginLeft + "px";
let levelSide;
let brick;
let level;
let sideValue;
let step = 0.5;
let speed = 0.5;
let botSpeed = 0.5;
let currentBot;
let deadBot;


//Создание звуков
const audioShell = new Audio('../static/audio/shot.mp3');
audioShell.volume = 0.2;
const audioTankRide = new Audio('../static/audio/tank_ride.mp3');
audioTankRide.loop = true;
audioTankRide.volume = 0.035;
const audioTankStarted = new Audio('../static/audio/tank_started.mp3');
audioTankStarted.loop = true;
audioTankStarted.volume = 0.2;
const audioBrickShot = new Audio('../static/audio_battle_sity/brick_shot.mp3');
audioBrickShot.volume = 0.6;
const audioConcrete = new Audio('../static/audio/concrete_shot.mp3');
audioConcrete.volume = 0.7;
const audioExpllosion = new Audio('../static/audio/projectile_explosion.mp3');
audioExpllosion.volume = 0.6;
const audioExpllosion1 = new Audio('../static/audio/projectile_explosion1.mp3');
audioExpllosion.volume = 0.6;
const audioExpllosion2 = new Audio('../static/audio/projectile_explosion2.mp3');
audioExpllosion.volume = 0.6;
let r = 1;

//Создание снаряда
let shell = document.createElement("img");
shell.className = "shell";
shell.src = "../static/image/ShellTop.png";
shell.direction = 1;
shell.directionNew = 1;
shell.update = 0;

//Создание взрыва
let explosion = document.createElement("img");
explosion.className = "explosion";
explosion.src = '../static/image/explosion1.png';

// Создание танка
let tank = document.createElement("img");
tank.className = "tank";
// tank.style.top = (boardSide / 2 - 40) + "px";
// tank.style.left = (boardSide / 2 - 40) + "px";
tank.src = '../static/image/top.png';
let status = 0;
let dead = false;
let health = 3;
// let tankThere = false;


let bot1 = document.createElement("img");
bot1.className = "bot1";
bot1.style.top = (boardSide / 4 - 40) + "px";
bot1.style.left = (boardSide / 2 - 40) + "px";
bot1.src = '../static/image/botTop.png';
gameBoard.appendChild(bot1);
bot1.botMovement = 0;
bot1.botShell = document.createElement("img");
bot1.botShell.className = "botShell1";
bot1.botShell.src = "../static/image/ShellTop.png";
bot1.botShell.direction = 1;
bot1.botShell.directionNew = 1;
bot1.botShell.update = 0;
bot1.botSkinStatus = 0;
bot1.botShotExplosion = document.createElement("img");
bot1.botShotExplosion.className = "botShotExplosion";
bot1.botShotExplosion.src = '../static/image/explosion1.png';
bot1.seeTank = false;
bot1.direction;
bot1.botShootDelay = 0;
bot1.health = 1;  



let bot2 = document.createElement("img");
bot2.className = "bot2";
bot2.style.top = (boardSide / 6 - 40) + "px";
bot2.style.left = (boardSide / 6 - 100) + "px";
bot2.src = '../static/image/botTop.png';
gameBoard.appendChild(bot2);
bot2.botMovement = 0;
bot2.botShell = document.createElement("img");
bot2.botShell.className = "botShell2";
bot2.botShell.src = "../static/image/ShellTop.png";
bot2.botShell.direction = 1;
bot2.botShell.directionNew = 1;
bot2.botShell.update = 0;
bot2.botSkinStatus = 0;
bot2.botShotExplosion = document.createElement("img");
bot2.botShotExplosion.className = "botShotExplosion";
bot2.botShotExplosion.src = '../static/image/explosion1.png';
bot2.seeTank = false;
bot2.direction;
bot2.botShootDelay = 0;
bot2.health = 1;



let bot3 = document.createElement("img");
bot3.className = "bot2";
bot3.style.top = (boardSide / 6 - 40) + "px";
bot3.style.left = (boardSide / 2 + 100) + "px";
bot3.src = '../static/image/botTop.png';
gameBoard.appendChild(bot3);
bot3.botMovement = 0;
bot3.botShell = document.createElement("img");
bot3.botShell.className = "botShell2";
bot3.botShell.src = "../static/image/ShellTop.png";
bot3.botShell.direction = 1;
bot3.botShell.directionNew = 1;
bot3.botShell.update = 0;
bot3.botSkinStatus = 0;
bot3.botShotExplosion = document.createElement("img");
bot3.botShotExplosion.className = "botShotExplosion";
bot3.botShotExplosion.src = '../static/image/explosion1.png';
bot3.seeTank = false;
bot3.direction;
bot3.botShootDelay = 0;  
bot3.health = 1;

// Прочие переменные для танка
let keyPressed = 0;
let shootDelay = 0;
let isPause = false;