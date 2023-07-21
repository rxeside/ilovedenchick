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
let brick;
let level;
let sideValue;
let step = 0.5;
let speed = 0.5;
let botSpeed = 0.5;

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
tank.style.top = (boardSide / 2 - 40) + "px";
tank.style.left = (boardSide / 2 - 40) + "px";
tank.src = '../static/image/top.png';
let status = 0;
let dead = false;
let hit = 0;

// Создание ботов
let bot = document.createElement("img");
bot.className = "bot1";
bot.style.top = (boardSide / 4 - 40) + "px";
bot.style.left = (boardSide / 2 - 40) + "px";
bot.src = '../static/image/botTop.png';
gameBoard.appendChild(bot);
let botMovement = 0;
let botShell = document.createElement("img");
botShell.className = "botShell";
botShell.src = "../static/image/ShellTop.png";
botShell.direction = 1;
botShell.directionNew = 1;
botShell.update = 0;
botSkinStatus = 0;
let botShotExplosion = document.createElement("img");
botShotExplosion.className = "botShotExplosion";
botShotExplosion.src = '../static/image/explosion1.png';
let seeTank = false;



// Прочие переменные для бота
let direction;
let botShootDelay = 0;  

// Прочие переменные для танка
let keyPressed = 0;
let shootDelay = 0;