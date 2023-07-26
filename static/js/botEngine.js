let bots = [bot1, bot2];

// Обработка движения бота
function updateBot() {

    console.log(bots);
    bots.forEach(bot1 => {
        currentBot = bots.indexOf(bot1);
        console.log(bot1);
        if (bot1 == undefined) {
            return;
        }
        let action = generateRandomAction();
        console.log("action: ", action);
        if (action == 'move') {
            clearInterval(bot1.botMovement);
            bot1.botMovement = 0;
            bot1.direction = getRandomDirection();
            console.log("direction: ", bot1.direction);

            bot1.botMovement = setInterval(function () {
                if (bot1 == undefined) {
                    return;
                }
                bot1.seeTank = false;

                if ((parseFloat(bot1.style.top) > parseFloat(tank.style.top) + parseFloat(tank.style.height)) && (parseFloat(bot1.style.left) + 20 * step < parseFloat(tank.style.left) + parseFloat(tank.style.width)) && (parseFloat(bot1.style.left) + parseFloat(bot1.style.width) - 20 * step > parseFloat(tank.style.left))) {
                    bot1.direction = "up";
                    bot1.seeTank = true;
                }
                if ((parseFloat(bot1.style.top) + parseFloat(bot1.style.height) < parseFloat(tank.style.top)) && (parseFloat(bot1.style.left) + 20 * step < parseFloat(tank.style.left) + parseFloat(tank.style.width)) && (parseFloat(bot1.style.left) + parseFloat(bot1.style.width) - 20 * step > parseFloat(tank.style.left))) {
                    bot1.direction = "down";
                    bot1.seeTank = true;
                }
                if (((parseFloat(tank.style.top) + parseFloat(tank.style.width) > parseFloat(bot1.style.top) + 20 * step) && (parseFloat(tank.style.top) < parseFloat(bot1.style.top) + parseFloat(bot1.style.height) - 20 * step)) && ((parseFloat(tank.style.left) < (parseFloat(bot1.style.left) + parseFloat(bot1.style.width))))) {
                    bot1.direction = "left";
                    bot1.seeTank = true;
                }
                if (((parseFloat(tank.style.top) + parseFloat(tank.style.width) > parseFloat(bot1.style.top) + 20 * step) && (parseFloat(tank.style.top) < parseFloat(bot1.style.top) + parseFloat(bot1.style.height) - 20 * step)) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width) + step) > parseFloat(bot1.style.left)))) {
                    bot1.direction = "right"
                    bot1.seeTank = true;
                }

                if (bot1.direction == 'up') {
                    let can_move = true;
                    brick.forEach(element => {
                        if (element != undefined) {
                            if (((parseFloat(tank.style.top) + parseFloat(tank.style.height) < parseFloat(bot1.style.top) + parseFloat(bot1.style.height)) && (parseFloat(tank.style.top) + parseFloat(tank.style.height) + step > parseFloat(bot1.style.top)) && (parseFloat(tank.style.left) + parseFloat(tank.style.width) > parseFloat(bot1.style.left)) && (parseFloat(tank.style.left) < parseFloat(bot1.style.left) + parseFloat(bot1.style.width)))) {
                                can_move = false;
                            }
                            if ((((parseFloat(bot1.style.top) + parseFloat(bot1.style.width)) > parseFloat(element.Pos_Y)) && (parseFloat(bot1.style.top) < (parseFloat(element.Pos_Y) + parseFloat(bot1.style.width) + step))) && (((parseFloat(bot1.style.left) + parseFloat(bot1.style.width)) > parseFloat(element.Pos_X)) && (parseFloat(bot1.style.left) < (parseFloat(element.Pos_X) + parseFloat(bot1.style.width)))) || ((parseFloat(bot1.style.top) <= 0))) {
                                if (element.CanTPass === 0) {
                                    can_move = false;
                                    if (!bot1.seeTank)
                                        bot1.direction = "down";
                                }
                            }
                        }
                    });

                    bot1.botShell.directionNew = 1;
                    if (bot1.botSkinStatus === 0) {
                        bot1.botSkinStatus = 1;
                        bot1.src = '../static/image/botTop.png';
                    } else if (bot1.botSkinStatus === 1) {
                        bot1.botSkinStatus = 0;
                        bot1.src = '../static/image/botTop1.png';
                    }
                    if (can_move) {
                        bot1.style.top = (parseFloat(bot1.style.top) - step) + "px";
                        //botShotDirection(bot1);
                    }
                } if (bot1.direction == 'down') {
                    let can_move = true;
                    if (((parseFloat(tank.style.top) > parseFloat(bot1.style.top)) && (parseFloat(tank.style.top) - step < parseFloat(bot1.style.top) + parseFloat(bot1.style.height)) && (parseFloat(tank.style.left) + parseFloat(tank.style.width) > parseFloat(bot1.style.left)) && (parseFloat(tank.style.left) < parseFloat(bot1.style.left) + parseFloat(bot1.style.width)))) {
                        can_move = false;
                    }
                    brick.forEach(element => {
                        if (element != undefined) {
                            if ((((parseFloat(bot1.style.top) + parseFloat(bot1.style.width) + step) > parseFloat(element.Pos_Y)) && (parseFloat(bot1.style.top) < (parseFloat(element.Pos_Y) + parseFloat(bot1.style.width)))) && (((parseFloat(bot1.style.left) + parseFloat(bot1.style.width)) > parseFloat(element.Pos_X)) && (parseFloat(bot1.style.left) < (parseFloat(element.Pos_X) + parseFloat(bot1.style.width)))) || ((parseFloat(bot1.style.top) + parseFloat(bot1.style.width) >= boardSide))) {
                                if (element.CanTPass === 0) {
                                    can_move = false;
                                    if (!bot1.seeTank)
                                        bot1.direction = "up";
                                }
                            }
                        }
                    });

                    bot1.botShell.directionNew = 2;
                    if (bot1.botSkinStatus === 0) {
                        bot1.botSkinStatus = 1;
                        bot1.src = '../static/image/botDown.png';
                    } else if (bot1.botSkinStatus === 1) {
                        bot1.botSkinStatus = 0;
                        bot1.src = '../static/image/botDown1.png';
                    }
                    if (can_move) {
                        bot1.style.top = (parseFloat(bot1.style.top) + step) + "px";
                        //botShotDirection(bot1);
                    }
                } if (bot1.direction == 'left') {
                    let can_move = true;
                    if ((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(bot1.style.top)) && (parseFloat(tank.style.top) < (parseFloat(bot1.style.top) + parseFloat(bot1.style.height)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width) + 2 * step) > parseFloat(bot1.style.left)) && (parseFloat(tank.style.left) < (parseFloat(bot1.style.left) + parseFloat(bot1.style.width))))) {
                        can_move = false;
                    }
                    brick.forEach(element => {
                        if (element != undefined) {
                            if ((((parseFloat(bot1.style.top) + parseFloat(bot1.style.width)) > parseFloat(element.Pos_Y)) && (parseFloat(bot1.style.top) < (parseFloat(element.Pos_Y) + parseFloat(bot1.style.width)))) && (((parseFloat(bot1.style.left) + parseFloat(bot1.style.width)) > parseFloat(element.Pos_X)) && (parseFloat(bot1.style.left) < (parseFloat(element.Pos_X) + parseFloat(bot1.style.width) + step))) || ((parseFloat(bot1.style.left) <= 0))) {
                                if (element.CanTPass === 0) {
                                    can_move = false;
                                    if (!bot1.seeTank) {
                                        bot1.direction = "right";
                                    }
                                }
                            }
                        }
                    });

                    bot1.botShell.directionNew = 3;
                    if (bot1.botSkinStatus === 0) {
                        bot1.botSkinStatus = 1;
                        bot1.src = '../static/image/botLeft.png';
                    } else if (bot1.botSkinStatus === 1) {
                        bot1.botSkinStatus = 0;
                        bot1.src = '../static/image/botLeft1.png';
                    }
                    if (can_move) {
                        bot1.style.left = (parseFloat(bot1.style.left) - step) + "px";
                        //botShotDirection(bot1);
                    }
                } if (bot1.direction == 'right') {
                    let can_move = true;
                    if ((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(bot1.style.top)) && (parseFloat(tank.style.top) < (parseFloat(bot1.style.top) + parseFloat(tank.style.width)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width)) > parseFloat(bot1.style.left)) && (parseFloat(tank.style.left) < (parseFloat(bot1.style.left) + parseFloat(tank.style.width) + step)))) {
                        can_move = false;
                    }
                    brick.forEach(element => {
                        if (element != undefined) {
                            if ((((parseFloat(bot1.style.top) + parseFloat(bot1.style.width)) > parseFloat(element.Pos_Y)) && (parseFloat(bot1.style.top) < (parseFloat(element.Pos_Y) + parseFloat(bot1.style.width)))) && (((parseFloat(bot1.style.left) + parseFloat(bot1.style.width) + step) > parseFloat(element.Pos_X)) && (parseFloat(bot1.style.left) < (parseFloat(element.Pos_X) + parseFloat(bot1.style.width)))) || ((parseFloat(bot1.style.left) + parseFloat(bot1.style.width) >= boardSide))) {
                                if (element.CanTPass === 0) {
                                    can_move = false;
                                    if (!bot1.seeTank)
                                        bot1.direction = "left";
                                }
                            }
                        }
                    });

                    bot1.botShell.directionNew = 4;
                    if (bot1.botSkinStatus === 0) {
                        bot1.botSkinStatus = 1;
                        bot1.src = '../static/image/botRight.png';
                    } else if (bot1.botSkinStatus === 1) {
                        bot1.botSkinStatus = 0;
                        bot1.src = '../static/image/botRight1.png';
                    }
                    if (can_move) {
                        bot1.style.left = (parseFloat(bot1.style.left) + step) + "px";
                        //botShotDirection(bot1);
                    }
                }
            }, botSpeed);
        }
        else if (action == 'shoot') {
            botShotDirection(bot1);
        }
    });
}

function startBot() {
    // Обновляем состояние игры каждые 2 секунд

    if (bot1 != undefined)
        setInterval(updateBot, 5000);

}
startBot();


function botDelaying(bot1) {
    setTimeout(() => { bot1.botShootDelay = 0; }, 1500);
}



function botShotDirection(bot1) {
    if (bot1.botShell.update == 0) {
        bot1.botShell.direction = bot1.botShell.directionNew;

        if (bot1.botShell.direction == 1) {
            bot1.botShell.src = "../static/image/ShellTop.png";
            bot1.botShell.style.top = (parseInt(bot1.style.top) - parseInt(bot1.botShell.style.height) * 0.5) + "px";
            bot1.botShell.style.left = (parseInt(bot1.style.left) + parseInt(bot1.style.width) * 0.5 - parseInt(bot1.botShell.style.width) * 0.5) + "px";
        }
        if (bot1.botShell.direction == 2) {
            bot1.botShell.src = "../static/image/ShellDown.png";
            bot1.botShell.style.top = (parseInt(bot1.style.top) + parseInt(bot1.style.height) - parseInt(bot1.botShell.style.height) * 0.5) + "px";
            bot1.botShell.style.left = (parseInt(bot1.style.left) + parseInt(bot1.style.width) * 0.5 - parseInt(bot1.botShell.style.width) * 0.5) + "px";
        }
        if (bot1.botShell.direction == 3) {
            bot1.botShell.src = "../static/image/ShellLeft.png";
            bot1.botShell.style.top = (parseInt(bot1.style.top) + parseInt(bot1.style.height) * 0.5 - parseInt(bot1.botShell.style.height) * 0.5) + "px";
            bot1.botShell.style.left = (parseInt(bot1.style.left) - parseInt(bot1.style.width) * 0.5) + "px";
        }
        if (bot1.botShell.direction == 4) {
            bot1.botShell.src = "../static/image/ShellRight.png";
            bot1.botShell.style.top = (parseInt(bot1.style.top) + parseInt(bot1.style.height) * 0.5 - parseInt(bot1.botShell.style.height) * 0.5) + "px";
            bot1.botShell.style.left = (parseInt(bot1.style.left) + parseInt(bot1.style.width) - parseInt(bot1.botShell.style.width) * 0.5) + "px";
        }
        if (bot1.botShootDelay == 0)
            botShooting(bot1);
    }
}

function botShooting(bot1) {

    console.log(bot1.botShell, " 1--------")
    gameBoard.appendChild(bot1.botShell);
    updateBotShall(bot1);
    bot1.botShell.update = 1;
    //console.log("bot's shot");
    if ((parseInt(bot1.botShell.style.top) < 0) || ((parseInt(bot1.botShell.style.top) + 16) >= boardSide) || (parseInt(bot1.botShell.style.left) < 0) || (parseInt(bot1.botShell.style.left) >= boardSide - 16)) {
        explosionBotShall(bot1);
    }


    if ((((parseInt(bot1.botShell.style.top) + bot1.botShell.height) > parseInt(tank.style.top)) && (parseInt(bot1.botShell.style.top) < (parseInt(tank.style.top) + sideValue))) && (((parseInt(bot1.botShell.style.left) + bot1.botShell.width) > parseInt(tank.style.left)) && (parseInt(bot1.botShell.style.left) < (parseInt(tank.style.left) + sideValue)))) {
        explosionBotShall(bot1);
        hit += 1;
        if (hit == 30) {
            dead = true;
            console.log("GAME OVER");
            tank.remove();
            setTimeout(() => { location.reload(); }, 2000);

        }
    }


    for (var i = 0; i < brick.length; i++) {
        element = brick[i];
        if (element != undefined) {
            if ((((parseInt(bot1.botShell.style.top) + bot1.botShell.height) > parseInt(element.Pos_Y)) && (parseInt(bot1.botShell.style.top) < (parseInt(element.Pos_Y) + 40))) && (((parseInt(bot1.botShell.style.left) + bot1.botShell.width) > parseInt(element.Pos_X)) && (parseInt(bot1.botShell.style.left) < (parseInt(element.Pos_X) + 40))) && (element.CanBPass === 0)) {
                explosionBotShall(bot1);
                if (element.IsDestructible === 1) {
                    let removeObj = document.getElementById(i);
                    brick[i] = undefined;
                    removeObj.remove();
                }
            }
        }
    }
    if (bot1.botShell.update == 1) {
        console.log("TUT");
        requestAnimationFrame(botShooting);
    }
    bot1.botShootDelay = 1;
}


function updateBotShall(bot1) {
    let botShellSpeed = sideValue / 7;

    if (bot1.botShell.direction == 1) {
        bot1.botShell.style.top = (parseInt(bot1.botShell.style.top) - botShellSpeed) + "px";
    }
    if (bot1.botShell.direction == 2) {
        bot1.botShell.style.top = (parseInt(bot1.botShell.style.top) + botShellSpeed) + "px";
    }
    if (bot1.botShell.direction == 3) {
        bot1.botShell.style.left = (parseInt(bot1.botShell.style.left) - botShellSpeed) + "px";
    }
    if (bot1.botShell.direction == 4) {
        bot1.botShell.style.left = (parseInt(bot1.botShell.style.left) + botShellSpeed) + "px";
    }
    console.log(bot1.botShell, " --------")

}


function explosionBotShall(bot1) {
    bot1.botShell.update = 0;
    botShellPlacement = sideValue / 5;
    gameBoard.removeChild(bot1.botShell);
    bot1.botShotExplosion.style.top = (parseInt(bot1.botShell.style.top) - botShellPlacement) + "px";
    bot1.botShotExplosion.style.left = (parseInt(bot1.botShell.style.left) - botShellPlacement) + "px";
    bot1.botShotExplosion.src = '../static/image/explosion1.png';
    gameBoard.appendChild(bot1.botShotExplosion);
    setTimeout(() => { bot1.botShotExplosion.src = '../static/image/explosion2.png'; bot1.botShotExplosion.style.top = (parseInt(bot1.botShotExplosion.style.top) - 2) + "px"; bot1.botShotExplosion.style.left = (parseInt(bot1.botShotExplosion.style.left) - 2) + "px"; }, 80);
    setTimeout(() => { bot1.botShotExplosion.src = '../static/image/explosion3.png'; bot1.botShotExplosion.style.top = (parseInt(bot1.botShotExplosion.style.top) - 1) + "px"; bot1.botShotExplosion.style.left = (parseInt(bot1.botShotExplosion.style.left) - 1) + "px"; }, 160);
    setTimeout(() => { gameBoard.removeChild(bot1.botShotExplosion); }, 240);
    botDelaying(bot1);

}

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