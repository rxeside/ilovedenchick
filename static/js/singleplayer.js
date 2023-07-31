
document.addEventListener("DOMContentLoaded", function () {
    
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
    

    // Создание и отображение кирпичей на поле
    const socket = new WebSocket("ws://localhost:3000/ws");

    socket.onopen = function () {
        console.log("Connected");
        socket.send("level");
        socket.onmessage = function (event) {
            level = JSON.parse(event.data);
            sideValue = boardSide / level.Side;
            tank.style.height = sideValue * 0.95 + "px";
            tank.style.width = sideValue * 0.95 + "px";
            bot.style.height = sideValue * 0.95 + "px";
            bot.style.width = sideValue * 0.95 + "px";
            console.log(sideValue);
            shell.style.height = sideValue * 0.3 + "px";
            shell.style.width = sideValue * 0.25 + "px";
            botShell.style.height = sideValue * 0.3 + "px";
            botShell.style.width = sideValue * 0.25 + "px";
            explosion.style.height = sideValue * 0.7 + "px";
            explosion.style.width = sideValue * 0.7 + "px";
            botShotExplosion.style.height = sideValue * 0.7 + "px";
            botShotExplosion.style.width = sideValue * 0.7 + "px";

            if (sideValue > 60) {
                step = 1;
                console.log("step", step);
            } else {
                speed = 200 / sideValue;
                botSpeed = 300 / sideValue;
                console.log("speed", speed);
            }
            newAns();
        };
        socket.send(boardSide);
        socket.send(marginLeft);
        socket.send(marginTop);


    }

    function newAns() {
        socket.onmessage = function (event) {
            brick = JSON.parse(event.data);
            for (let i = 0; i < brick.length; i++) {
                brick[i].Pos_X = brick[i].Pos_X + "px";
                brick[i].Pos_Y = brick[i].Pos_Y + "px";
                createNewElt(brick[i], i);
            };
        };
    }

    function createNewElt(element, i) {
        let obj = document.createElement("img");
        obj.id = i;
        obj.classList.add('brick');
        obj.src = element.ImgURL;

        obj.style.top = element.Pos_Y;
        obj.style.left = element.Pos_X;
        obj.style.width = sideValue + "px";
        obj.style.height = sideValue + "px";

        gameBoard.appendChild(obj);
    }

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

    // Добавление танка на игровое поле
    gameBoard.appendChild(tank);


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

    // Обработка движения бота
    function updateBot() {
        if (bot == undefined) {
            return;
        }
        let action = generateRandomAction();
        console.log("action: ", action);
        let direction;
        if (action == 'move') {
            clearInterval(botMovement);
            botMovement = 0;
            direction = getRandomDirection();
            console.log("direction: ", direction);

            botMovement = setInterval(function () {
                if (bot == undefined) {
                    return;
                }
                seeTank = false;

                if ((parseFloat(bot.style.top) > parseFloat(tank.style.top) + parseFloat(tank.style.height)) && (parseFloat(bot.style.left) + 20*step < parseFloat(tank.style.left) + parseFloat(tank.style.width)) && (parseFloat(bot.style.left) + parseFloat(bot.style.width) - 20*step > parseFloat(tank.style.left))) {
                    direction = "up";   
                    seeTank = true;
                }
                if ((parseFloat(bot.style.top) + parseFloat(bot.style.height) < parseFloat(tank.style.top)) && (parseFloat(bot.style.left) + 20*step < parseFloat(tank.style.left) + parseFloat(tank.style.width)) && (parseFloat(bot.style.left) + parseFloat(bot.style.width) - 20*step > parseFloat(tank.style.left))) {
                    direction = "down";
                    seeTank = true;
                }
                if (((parseFloat(tank.style.top) + parseFloat(tank.style.width) > parseFloat(bot.style.top) + 20*step) && (parseFloat(tank.style.top) < parseFloat(bot.style.top) + parseFloat(bot.style.height) - 20*step)) && ((parseFloat(tank.style.left) < (parseFloat(bot.style.left) + parseFloat(bot.style.width))))) {
                    direction = "left";
                    seeTank = true;
                }
                if (((parseFloat(tank.style.top) + parseFloat(tank.style.width) > parseFloat(bot.style.top) + 20*step) && (parseFloat(tank.style.top) < parseFloat(bot.style.top) + parseFloat(bot.style.height) - 20*step)) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width) + step) > parseFloat(bot.style.left)))) {
                    direction = "right"
                    seeTank = true;
                }

                if (direction == 'up') {
                    let can_move = true;

                    brick.forEach(element => {
                        if (element != undefined) {
                            if (((parseFloat(tank.style.top) + parseFloat(tank.style.height) < parseFloat(bot.style.top) + parseFloat(bot.style.height)) && (parseFloat(tank.style.top) + parseFloat(tank.style.height) + step > parseFloat(bot.style.top)) && (parseFloat(tank.style.left) + parseFloat(tank.style.width) > parseFloat(bot.style.left)) && (parseFloat(tank.style.left) < parseFloat(bot.style.left) + parseFloat(bot.style.width)))) {
                                can_move = false;
                            }
                            if ((((parseFloat(bot.style.top) + parseFloat(bot.style.width)) > parseFloat(element.Pos_Y)) && (parseFloat(bot.style.top) < (parseFloat(element.Pos_Y) + parseFloat(bot.style.width) + step))) && (((parseFloat(bot.style.left) + parseFloat(bot.style.width)) > parseFloat(element.Pos_X)) && (parseFloat(bot.style.left) < (parseFloat(element.Pos_X) + parseFloat(bot.style.width)))) || ((parseFloat(bot.style.top) <= 0))) {
                                if (element.CanTPass === 0) {
                                    can_move = false;
                                    if (!seeTank)
                                        direction = "down";
                                }
                            }
                        }
                    });

                    botShell.directionNew = 1;
                    if (botSkinStatus === 0) {
                        botSkinStatus = 1;
                        bot.src = '../static/image/botTop.png';
                    } else if (botSkinStatus === 1) {
                        botSkinStatus = 0;
                        bot.src = '../static/image/botTop1.png';
                    }
                    if (can_move) {
                        bot.style.top = (parseFloat(bot.style.top) - step) + "px";
                        botShotDirection();
                    }
                } if (direction == 'down') {
                    let can_move = true;
                    if (((parseFloat(tank.style.top) > parseFloat(bot.style.top)) && (parseFloat(tank.style.top) - step < parseFloat(bot.style.top) + parseFloat(bot.style.height)) && (parseFloat(tank.style.left) + parseFloat(tank.style.width) > parseFloat(bot.style.left)) && (parseFloat(tank.style.left) < parseFloat(bot.style.left) + parseFloat(bot.style.width)))) {
                        can_move = false;
                    }
                    brick.forEach(element => {
                        if (element != undefined) {
                            if ((((parseFloat(bot.style.top) + parseFloat(bot.style.width) + step) > parseFloat(element.Pos_Y)) && (parseFloat(bot.style.top) < (parseFloat(element.Pos_Y) + parseFloat(bot.style.width)))) && (((parseFloat(bot.style.left) + parseFloat(bot.style.width)) > parseFloat(element.Pos_X)) && (parseFloat(bot.style.left) < (parseFloat(element.Pos_X) + parseFloat(bot.style.width)))) || ((parseFloat(bot.style.top) + parseFloat(bot.style.width) >= boardSide))) {
                                if (element.CanTPass === 0) {
                                    can_move = false;
                                    if (!seeTank)
                                        direction = "up";
                                }
                            }
                        }
                    });

                    botShell.directionNew = 2;
                    if (botSkinStatus === 0) {
                        botSkinStatus = 1;
                        bot.src = '../static/image/botDown.png';
                    } else if (botSkinStatus === 1) {
                        botSkinStatus = 0;
                        bot.src = '../static/image/botDown1.png';
                    }
                    if (can_move) {
                        bot.style.top = (parseFloat(bot.style.top) + step) + "px";
                        botShotDirection();
                    }
                } if (direction == 'left') {
                    let can_move = true;
                    if ((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(bot.style.top)) && (parseFloat(tank.style.top) < (parseFloat(bot.style.top) + parseFloat(bot.style.height)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width) + 2 * step) > parseFloat(bot.style.left)) && (parseFloat(tank.style.left) < (parseFloat(bot.style.left) + parseFloat(bot.style.width))))) {
                        can_move = false;
                    }
                    brick.forEach(element => {
                        if (element != undefined) {
                            if ((((parseFloat(bot.style.top) + parseFloat(bot.style.width)) > parseFloat(element.Pos_Y)) && (parseFloat(bot.style.top) < (parseFloat(element.Pos_Y) + parseFloat(bot.style.width)))) && (((parseFloat(bot.style.left) + parseFloat(bot.style.width)) > parseFloat(element.Pos_X)) && (parseFloat(bot.style.left) < (parseFloat(element.Pos_X) + parseFloat(bot.style.width) + step))) || ((parseFloat(bot.style.left) <= 0))) {
                                if (element.CanTPass === 0) {
                                    can_move = false;
                                    if (!seeTank) {
                                        direction = "right";
                                    }
                                }
                            }
                        }
                    });

                    botShell.directionNew = 3;
                    if (botSkinStatus === 0) {
                        botSkinStatus = 1;
                        bot.src = '../static/image/botLeft.png';
                    } else if (status === 1) {
                        botSkinStatus = 0;
                        bot.src = '../static/image/botLeft1.png';
                    }
                    if (can_move) {
                        bot.style.left = (parseFloat(bot.style.left) - step) + "px";
                        botShotDirection();
                    }
                } if (direction == 'right') {
                    let can_move = true;
                    if ((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(bot.style.top)) && (parseFloat(tank.style.top) < (parseFloat(bot.style.top) + parseFloat(tank.style.width)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width)) > parseFloat(bot.style.left)) && (parseFloat(tank.style.left) < (parseFloat(bot.style.left) + parseFloat(tank.style.width) + step)))) {
                        can_move = false;
                    }
                    brick.forEach(element => {
                        if (element != undefined) {
                            if ((((parseFloat(bot.style.top) + parseFloat(bot.style.width)) > parseFloat(element.Pos_Y)) && (parseFloat(bot.style.top) < (parseFloat(element.Pos_Y) + parseFloat(bot.style.width)))) && (((parseFloat(bot.style.left) + parseFloat(bot.style.width) + step) > parseFloat(element.Pos_X)) && (parseFloat(bot.style.left) < (parseFloat(element.Pos_X) + parseFloat(bot.style.width)))) || ((parseFloat(bot.style.left) + parseFloat(bot.style.width) >= boardSide))) {
                                if (element.CanTPass === 0) {
                                    can_move = false;
                                    if (!seeTank)
                                        direction = "left";
                                }
                            }
                        }
                    });

                    botShell.directionNew = 4;
                    if (botSkinStatus === 0) {
                        botSkinStatus = 1;
                        bot.src = '../static/image/botRight.png';
                    } else if (botSkinStatus === 1) {
                        botSkinStatus = 0;
                        bot.src = '../static/image/botRight1.png';
                    }
                    if (can_move) {
                        bot.style.left = (parseFloat(bot.style.left) + step) + "px";
                        botShotDirection();
                    }
                }
            }, botSpeed);
        }
        else if (action == 'shoot') {
            botShotDirection();
        }
    }

    function startBot() {
        // Обновляем состояние игры каждые 2 секунд
        if (bot != undefined)
            setInterval(updateBot, 1000);

    }
    startBot();



    let botShootDelay = 0;

    function botDelaying() {
          setTimeout(() => {botShootDelay = 0;}, 1500);
    }



    function botShotDirection() {
        if (botShell.update == 0) {
            botShell.direction = botShell.directionNew;

            if (botShell.direction == 1) {
                botShell.src = "../static/image/ShellTop.png";
                botShell.style.top = (parseInt(bot.style.top) - parseInt(botShell.style.height) * 0.5) + "px";
                botShell.style.left = (parseInt(bot.style.left) + parseInt(bot.style.width) * 0.5 - parseInt(botShell.style.width) * 0.5) + "px";
            }
            if (botShell.direction == 2) {
                botShell.src = "../static/image/ShellDown.png";
                botShell.style.top = (parseInt(bot.style.top) + parseInt(bot.style.height) - parseInt(botShell.style.height) * 0.5) + "px";
                botShell.style.left = (parseInt(bot.style.left) + parseInt(bot.style.width) * 0.5 - parseInt(botShell.style.width) * 0.5) + "px";
            }
            if (botShell.direction == 3) {
                botShell.src = "../static/image/ShellLeft.png";
                botShell.style.top = (parseInt(bot.style.top) + parseInt(bot.style.height) * 0.5 - parseInt(botShell.style.height) * 0.5) + "px";
                botShell.style.left = (parseInt(bot.style.left) - parseInt(bot.style.width) * 0.5) + "px";
            }
            if (botShell.direction == 4) {
                botShell.src = "../static/image/ShellRight.png";
                botShell.style.top = (parseInt(bot.style.top) + parseInt(bot.style.height) * 0.5 - parseInt(botShell.style.height) * 0.5) + "px";
                botShell.style.left = (parseInt(bot.style.left) + parseInt(bot.style.width) - parseInt(botShell.style.width) * 0.5) + "px";
            }
            if (botShootDelay == 0)
                botShooting();
        }
    }

    function botShooting() {
        gameBoard.appendChild(botShell);
        updateBotShall();
        botShell.update = 1;
        //console.log("bot's shot");
        if ((parseInt(botShell.style.top) < 0) || ((parseInt(botShell.style.top) + 16) >= boardSide) || (parseInt(botShell.style.left) < 0) || (parseInt(botShell.style.left) >= boardSide - 16)) {
            explosionBotShall();
        }


        if ((((parseInt(botShell.style.top) + botShell.height) > parseInt(tank.style.top)) && (parseInt(botShell.style.top) < (parseInt(tank.style.top) + sideValue))) && (((parseInt(botShell.style.left) + botShell.width) > parseInt(tank.style.left)) && (parseInt(botShell.style.left) < (parseInt(tank.style.left) + sideValue)))) {
            explosionBotShall();
            hit += 1;
            if (hit == 3) {
                dead = true;
                console.log("GAME OVER");
                tank.remove();
                setTimeout(() => { location.reload(); }, 2000);

            }
        }


        for (var i = 0; i < brick.length; i++) {
            element = brick[i];
            if (element != undefined) {
                if ((((parseInt(botShell.style.top) + botShell.height) > parseInt(element.Pos_Y)) && (parseInt(botShell.style.top) < (parseInt(element.Pos_Y) + 40))) && (((parseInt(botShell.style.left) + botShell.width) > parseInt(element.Pos_X)) && (parseInt(botShell.style.left) < (parseInt(element.Pos_X) + 40))) && (element.CanBPass === 0)) {
                    explosionBotShall();
                    if (element.IsDestructible === 1) {
                        let removeObj = document.getElementById(i);
                        brick[i] = undefined;
                        removeObj.remove();
                    }
                }
            }
        }
        if (botShell.update == 1) {
            requestAnimationFrame(botShooting);
        }
        botShootDelay = 1; 
    }


    function updateBotShall() {
        let botShellSpeed = sideValue / 7;

        if (botShell.direction == 1) {
            botShell.style.top = (parseInt(botShell.style.top) - botShellSpeed) + "px";
        }
        if (botShell.direction == 2) {
            botShell.style.top = (parseInt(botShell.style.top) + botShellSpeed) + "px";
        }
        if (botShell.direction == 3) {
            botShell.style.left = (parseInt(botShell.style.left) - botShellSpeed) + "px";
        }
        if (botShell.direction == 4) {
            botShell.style.left = (parseInt(botShell.style.left) + botShellSpeed) + "px";
        }

    }


    function explosionBotShall() {
        botShell.update = 0;
        botShellPlacement = sideValue / 5;
        gameBoard.removeChild(botShell);
        botShotExplosion.style.top = (parseInt(botShell.style.top) - botShellPlacement) + "px";
        botShotExplosion.style.left = (parseInt(botShell.style.left) - botShellPlacement) + "px";
        botShotExplosion.src = '../static/image/explosion1.png';
        gameBoard.appendChild(botShotExplosion);
        setTimeout(() => { botShotExplosion.src = '../static/image/explosion2.png'; botShotExplosion.style.top = (parseInt(botShotExplosion.style.top) - 2) + "px"; botShotExplosion.style.left = (parseInt(botShotExplosion.style.left) - 2) + "px"; }, 80);
        setTimeout(() => { botShotExplosion.src = '../static/image/explosion3.png'; botShotExplosion.style.top = (parseInt(botShotExplosion.style.top) - 1) + "px"; botShotExplosion.style.left = (parseInt(botShotExplosion.style.left) - 1) + "px"; }, 160);
        setTimeout(() => { gameBoard.removeChild(botShotExplosion); }, 240);
        botDelaying();

    }



    // Обработка клавиш для управления танком
    let keyPressed = 0;
    document.addEventListener('keydown', (event) => {
        if (!keyPressed) {
            audioTankStarted.play();
            keyPressed = setInterval(function () {
                let key = event.key;

                console.log("in");
                moveTank(key);
            }, speed);
        }
    })

    function moveTank(key) {
        if (dead == true)
            return;
        if ((key === "ArrowUp")) {
            let can_move = true;
            audioTankRide.play();
            if (bot != undefined) {
                if (((parseFloat(tank.style.top) > parseFloat(bot.style.top)) && (parseFloat(tank.style.top) < parseFloat(bot.style.top) + parseFloat(bot.style.height) + step) && (parseFloat(tank.style.left) + parseFloat(tank.style.width) > parseFloat(bot.style.left)) && (parseFloat(tank.style.left) < parseFloat(bot.style.left) + parseFloat(bot.style.width)))) {
                    can_move = false;
                }
            }

            brick.forEach(element => {
                if (element != undefined) {
                    if ((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(element.Pos_Y)) && (parseFloat(tank.style.top) < (parseFloat(element.Pos_Y) + parseFloat(tank.style.width) + step))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width)) > parseFloat(element.Pos_X)) && (parseFloat(tank.style.left) < (parseFloat(element.Pos_X) + parseFloat(tank.style.width)))) || ((parseFloat(tank.style.top) <= 0))) {
                        if (element.CanTPass === 0)
                            can_move = false;

                    }
                }
            });

            shell.directionNew = 1;
            if (status === 0) {
                status = 1;
                tank.src = '../static/image/top.png';
            } else if (status === 1) {
                status = 0;
                tank.src = '../static/image/top1.png';
            }

            if (can_move) {
                tank.style.top = (parseFloat(tank.style.top) - step) + "px";
            }

        } else if ((key === "ArrowDown")) {
            let can_move = true;
            audioTankRide.play();
            if (bot != undefined) {
                if (((parseFloat(tank.style.top) + parseFloat(tank.style.height) < parseFloat(bot.style.top) + parseFloat(bot.style.height)) && (parseFloat(tank.style.top) + parseFloat(tank.style.height) > parseFloat(bot.style.top) - step) && (parseFloat(tank.style.left) + parseFloat(tank.style.width) > parseFloat(bot.style.left)) && (parseFloat(tank.style.left) < parseFloat(bot.style.left) + parseFloat(bot.style.width)))) {
                    can_move = false;
                }
            }

            brick.forEach(element => {
                if (element != undefined) {
                    if ((((parseFloat(tank.style.top) + parseFloat(tank.style.width) + step) > parseFloat(element.Pos_Y)) && (parseFloat(tank.style.top) < (parseFloat(element.Pos_Y) + parseFloat(tank.style.width)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width)) > parseFloat(element.Pos_X)) && (parseFloat(tank.style.left) < (parseFloat(element.Pos_X) + parseFloat(tank.style.width)))) || ((parseFloat(tank.style.top) + parseFloat(tank.style.width) >= boardSide))) {
                        if (element.CanTPass === 0)
                            can_move = false;
                    }
                }
            });

            shell.directionNew = 2;
            if (status === 0) {
                status = 1;
                tank.src = '../static/image/down.png';
            } else if (status === 1) {
                status = 0;
                tank.src = '../static/image/down1.png';
            }

            if (can_move) {
                tank.style.top = (parseFloat(tank.style.top) + step) + "px";
            }

        } else if ((key === "ArrowLeft")) {
            let can_move = true;
            audioTankRide.play();
            if (bot != undefined) {
                if ((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(bot.style.top)) && (parseFloat(tank.style.top) < (parseFloat(bot.style.top) + parseFloat(tank.style.width)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width)) > parseFloat(bot.style.left)) && (parseFloat(tank.style.left) < (parseFloat(bot.style.left) + parseFloat(tank.style.width) + step)))) {
                    can_move = false;
                }
            }

            brick.forEach(element => {
                if (element != undefined) {
                    if ((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(element.Pos_Y)) && (parseFloat(tank.style.top) < (parseFloat(element.Pos_Y) + parseFloat(tank.style.width)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width)) > parseFloat(element.Pos_X)) && (parseFloat(tank.style.left) < (parseFloat(element.Pos_X) + parseFloat(tank.style.width) + step))) || ((parseFloat(tank.style.left) <= 0))) {
                        if (element.CanTPass === 0)
                            can_move = false;
                    }
                }
            });

            shell.directionNew = 3;
            if (status === 0) {
                status = 1;
                tank.src = '../static/image/left.png';
            } else if (status === 1) {
                status = 0;
                tank.src = '../static/image/left1.png';
            }

            if (can_move) {
                tank.style.left = (parseFloat(tank.style.left) - step) + "px";
            }
        } else if ((key === "ArrowRight")) {
            let can_move = true;
            audioTankRide.play();
            if (bot != undefined) {
                if ((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(bot.style.top)) && (parseFloat(tank.style.top) < (parseFloat(bot.style.top) + parseFloat(bot.style.height)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width) + step) > parseFloat(bot.style.left)) && (parseFloat(tank.style.left) < (parseFloat(bot.style.left) + parseFloat(bot.style.width))))) {
                    can_move = false;
                }
            }

            brick.forEach(element => {
                if (element != undefined) {
                    if ((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(element.Pos_Y)) && (parseFloat(tank.style.top) < (parseFloat(element.Pos_Y) + parseFloat(tank.style.width)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width) + step) > parseFloat(element.Pos_X)) && (parseFloat(tank.style.left) < (parseFloat(element.Pos_X) + parseFloat(tank.style.width)))) || ((parseFloat(tank.style.left) + parseFloat(tank.style.width) >= boardSide))) {
                        if (element.CanTPass === 0)
                            can_move = false;
                    }
                }
            });

            shell.directionNew = 4;
            if (status === 0) {
                status = 1;
                tank.src = '../static/image/right.png';
            } else if (status === 1) {
                status = 0;
                tank.src = '../static/image/right1.png';
            }

            if (can_move) {
                tank.style.left = (parseFloat(tank.style.left) + step) + "px";
            }
        }
        document.addEventListener('keyup', (event) => {
            if (keyPressed) {
                var key = event.key;
                if (key == "ArrowUp" || "ArrowDown" || "ArrowRight" || "ArrowLeft") {
                    clearInterval(keyPressed);
                    keyPressed = 0;
                }

            } else { audioTankRide.pause(); }
        })
    }


    let shootDelay = 0;

    function delaying() {
          setTimeout(() => {shootDelay = 0;}, 1500);
    }

    function updateShall() {
        let shellSpeed = sideValue / 7;

        if (shell.direction == 1) {
            shell.style.top = (parseInt(shell.style.top) - shellSpeed) + "px";
        }
        if (shell.direction == 2) {
            shell.style.top = (parseInt(shell.style.top) + shellSpeed) + "px";
        }
        if (shell.direction == 3) {
            shell.style.left = (parseInt(shell.style.left) - shellSpeed) + "px";
        }
        if (shell.direction == 4) {
            shell.style.left = (parseInt(shell.style.left) + shellSpeed) + "px";
        }
    }

    function explosionShall() {
        shell.update = 0;
        
        shellPlacement = sideValue / 5;
        gameBoard.removeChild(shell);
        explosion.style.top = (parseInt(shell.style.top) - shellPlacement) + "px";
        explosion.style.left = (parseInt(shell.style.left) - shellPlacement) + "px";
        explosion.src = '../static/image/explosion1.png';
        if (r % 3 === 0) {
            audioExpllosion.play();
        } else {
            if (r % 2 === 0) {
                audioExpllosion1.play();
            } else { audioExpllosion2.play(); }
        }
        audioConcrete.play();
        gameBoard.appendChild(explosion);
        setTimeout(() => { explosion.src = '../static/image/explosion2.png'; explosion.style.top = (parseInt(explosion.style.top) - 2) + "px"; explosion.style.left = (parseInt(explosion.style.left) - 2) + "px"; }, 80);
        setTimeout(() => { explosion.src = '../static/image/explosion3.png'; explosion.style.top = (parseInt(explosion.style.top) - 1) + "px"; explosion.style.left = (parseInt(explosion.style.left) - 1) + "px"; }, 160);
        setTimeout(() => { gameBoard.removeChild(explosion); }, 240);
        delaying();

    }

    

    function shooting() {
        if (dead == true)
            return;
        gameBoard.appendChild(shell);
        updateShall();
        shell.update = 1;
        
        console.log("shot");



        if ((parseInt(shell.style.top) < 0) || ((parseInt(shell.style.top) + 16) >= boardSide) || (parseInt(shell.style.left) < 0) || (parseInt(shell.style.left) >= boardSide - 16)) {
            explosionShall();
        }


        if (bot != undefined) {
            if ((((parseInt(shell.style.top) + shell.height) > parseInt(bot.style.top)) && (parseInt(shell.style.top) < (parseInt(bot.style.top) + sideValue))) && (((parseInt(shell.style.left) + shell.width) > parseInt(bot.style.left)) && (parseInt(shell.style.left) < (parseInt(bot.style.left) + sideValue)))) {
                explosionShall();
                bot.remove();
                bot = undefined;
                console.log(bot);
            }
        }


        for (var i = 0; i < brick.length; i++) {
            element = brick[i];
            if (element != undefined) {
                if ((((parseInt(shell.style.top) + shell.height) > parseInt(element.Pos_Y)) && (parseInt(shell.style.top) < (parseInt(element.Pos_Y) + sideValue))) && (((parseInt(shell.style.left) + shell.width) > parseInt(element.Pos_X)) && (parseInt(shell.style.left) < (parseInt(element.Pos_X) + sideValue))) && (element.CanBPass === 0)) {
                    explosionShall();
                    if (element.IsDestructible === 1) {
                        audioConcrete.pause();
                        audioBrickShot.play();
                        let removeObj = document.getElementById(i);
                        brick[i] = undefined;
                        removeObj.remove();
                    }

                }
            }
        }
        if ((shell.update == 1)) {
            requestAnimationFrame(shooting);
        }
        shootDelay = 1;
    }




    // управление снарядом
    document.addEventListener("keydown", function (event) {
        var shot = event.code;

        if ((shot == "KeyZ" || shot == "Space") && (shell.update == 0)) {
            shell.direction = shell.directionNew;
            audioShell.play();
            if (shell.direction == 1) {
                shell.src = "../static/image/ShellTop.png";
                shell.style.top = (parseInt(tank.style.top) - parseInt(shell.style.height) * 0.5) + "px";
                shell.style.left = (parseInt(tank.style.left) + parseInt(tank.style.width) * 0.5 - parseInt(shell.style.width) * 0.5) + "px";
            }
            if (shell.direction == 2) {
                shell.src = "../static/image/ShellDown.png";
                shell.style.top = (parseInt(tank.style.top) + parseInt(tank.style.height) - parseInt(shell.style.height) * 0.5) + "px";
                shell.style.left = (parseInt(tank.style.left) + parseInt(tank.style.width) * 0.5 - parseInt(shell.style.width) * 0.5) + "px";
            }
            if (shell.direction == 3) {
                shell.src = "../static/image/ShellLeft.png";
                shell.style.top = (parseInt(tank.style.top) + parseInt(tank.style.height) * 0.5 - parseInt(shell.style.height) * 0.5) + "px";
                shell.style.left = (parseInt(tank.style.left) - parseInt(shell.style.width) * 0.5) + "px";
            }
            if (shell.direction == 4) {
                shell.src = "../static/image/ShellRight.png";
                shell.style.top = (parseInt(tank.style.top) + parseInt(tank.style.height) * 0.5 - parseInt(shell.style.height) * 0.5) + "px";
                shell.style.left = (parseInt(tank.style.left) + parseInt(tank.style.width) - parseInt(shell.style.width) * 0.5) + "px";
            }
            if (shootDelay == 0)
                shooting();
        }
    });

    // Функция для генерации случайного направления
    function getRandomDirection() {
        const directions = ['up', 'down', 'left', 'right'];
        return directions[Math.floor(Math.random() * directions.length)];
    }

    // Функция для генерации случайного действия
    function generateRandomAction() {
        const actions = ['move', 'shoot'];
        return actions[Math.floor(Math.random() * actions.length)];
    }
});