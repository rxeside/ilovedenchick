let bots = [bot1, bot2, bot3];

// Обработка движения бота
function updateBot() {

    console.log(bots);
    bots.forEach(bot => {
        currentBot = bots.indexOf(bot);
        let action = generateRandomAction();
        console.log("action: ", action);
        if (action == 'move') {
            clearInterval(bot.botMovement);
            bot.botMovement = 0;
            bot.direction = getRandomDirection();
            console.log("direction: ", bot.direction);
            bot.botMovement = setInterval(function () {
                bot.seeTank = false;

                if ((parseFloat(bot.style.top) > parseFloat(tank.style.top) + parseFloat(tank.style.height)) && (parseFloat(bot.style.left) + 20 * step < parseFloat(tank.style.left) + parseFloat(tank.style.width)) && (parseFloat(bot.style.left) + parseFloat(bot.style.width) - 20 * step > parseFloat(tank.style.left))) {
                    bot.direction = "up";
                    bot.seeTank = true;
                }
                if ((parseFloat(bot.style.top) + parseFloat(bot.style.height) < parseFloat(tank.style.top)) && (parseFloat(bot.style.left) + 20 * step < parseFloat(tank.style.left) + parseFloat(tank.style.width)) && (parseFloat(bot.style.left) + parseFloat(bot.style.width) - 20 * step > parseFloat(tank.style.left))) {
                    bot.direction = "down";
                    bot.seeTank = true;
                }
                if (((parseFloat(tank.style.top) + parseFloat(tank.style.width) > parseFloat(bot.style.top) + 20 * step) && (parseFloat(tank.style.top) < parseFloat(bot.style.top) + parseFloat(bot.style.height) - 20 * step)) && ((parseFloat(tank.style.left) < (parseFloat(bot.style.left) + parseFloat(bot.style.width))))) {
                    bot.direction = "left";
                    bot.seeTank = true;
                }
                if (((parseFloat(tank.style.top) + parseFloat(tank.style.width) > parseFloat(bot.style.top) + 20 * step) && (parseFloat(tank.style.top) < parseFloat(bot.style.top) + parseFloat(bot.style.height) - 20 * step)) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width) + step) > parseFloat(bot.style.left)))) {
                    bot.direction = "right"
                    bot.seeTank = true;
                }

                if (bot.direction == 'up') {
                    let can_move = true;
                    brick.forEach(element => {
                        if (element != undefined) {
                            if (((parseFloat(tank.style.top) + parseFloat(tank.style.height) < parseFloat(bot.style.top) + parseFloat(bot.style.height)) && (parseFloat(tank.style.top) + parseFloat(tank.style.height) + step > parseFloat(bot.style.top)) && (parseFloat(tank.style.left) + parseFloat(tank.style.width) > parseFloat(bot.style.left)) && (parseFloat(tank.style.left) < parseFloat(bot.style.left) + parseFloat(bot.style.width)))) {
                                can_move = false;
                            }
                            if ((((parseFloat(bot.style.top) + parseFloat(bot.style.width)) > parseFloat(element.Pos_Y)) && (parseFloat(bot.style.top) < (parseFloat(element.Pos_Y) + parseFloat(bot.style.width) + step))) && (((parseFloat(bot.style.left) + parseFloat(bot.style.width)) > parseFloat(element.Pos_X)) && (parseFloat(bot.style.left) < (parseFloat(element.Pos_X) + parseFloat(bot.style.width)))) || ((parseFloat(bot.style.top) <= 0))) {
                                if (element.CanTPass === 0) {
                                    can_move = false;
                                    if (!bot.seeTank)
                                        bot.direction = "down";
                                }
                            }
                        }
                    });

                    bot.botShell.directionNew = 1;
                    if (bot.botSkinStatus === 0) {
                        bot.botSkinStatus = 1;
                        bot.src = '../static/image/botTop.png';
                    } else if (bot.botSkinStatus === 1) {
                        bot.botSkinStatus = 0;
                        bot.src = '../static/image/botTop1.png';
                    }
                    if (can_move) {
                        bot.style.top = (parseFloat(bot.style.top) - step) + "px";
                    }
                } if (bot.direction == 'down') {
                    let can_move = true;
                    if (((parseFloat(tank.style.top) > parseFloat(bot.style.top)) && (parseFloat(tank.style.top) - step < parseFloat(bot.style.top) + parseFloat(bot.style.height)) && (parseFloat(tank.style.left) + parseFloat(tank.style.width) > parseFloat(bot.style.left)) && (parseFloat(tank.style.left) < parseFloat(bot.style.left) + parseFloat(bot.style.width)))) {
                        can_move = false;
                    }
                    brick.forEach(element => {
                        if (element != undefined) {
                            if ((((parseFloat(bot.style.top) + parseFloat(bot.style.width) + step) > parseFloat(element.Pos_Y)) && (parseFloat(bot.style.top) < (parseFloat(element.Pos_Y) + parseFloat(bot.style.width)))) && (((parseFloat(bot.style.left) + parseFloat(bot.style.width)) > parseFloat(element.Pos_X)) && (parseFloat(bot.style.left) < (parseFloat(element.Pos_X) + parseFloat(bot.style.width)))) || ((parseFloat(bot.style.top) + parseFloat(bot.style.width) >= boardSide))) {
                                if (element.CanTPass === 0) {
                                    can_move = false;
                                    if (!bot.seeTank)
                                        bot.direction = "up";
                                }
                            }
                        }
                    });

                    bot.botShell.directionNew = 2;
                    if (bot.botSkinStatus === 0) {
                        bot.botSkinStatus = 1;
                        bot.src = '../static/image/botDown.png';
                    } else if (bot.botSkinStatus === 1) {
                        bot.botSkinStatus = 0;
                        bot.src = '../static/image/botDown1.png';
                    }
                    if (can_move) {
                        bot.style.top = (parseFloat(bot.style.top) + step) + "px";
                    }
                } if (bot.direction == 'left') {
                    let can_move = true;
                    if ((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(bot.style.top)) && (parseFloat(tank.style.top) < (parseFloat(bot.style.top) + parseFloat(bot.style.height)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width) + 2 * step) > parseFloat(bot.style.left)) && (parseFloat(tank.style.left) < (parseFloat(bot.style.left) + parseFloat(bot.style.width))))) {
                        can_move = false;
                    }
                    brick.forEach(element => {
                        if (element != undefined) {
                            if ((((parseFloat(bot.style.top) + parseFloat(bot.style.width)) > parseFloat(element.Pos_Y)) && (parseFloat(bot.style.top) < (parseFloat(element.Pos_Y) + parseFloat(bot.style.width)))) && (((parseFloat(bot.style.left) + parseFloat(bot.style.width)) > parseFloat(element.Pos_X)) && (parseFloat(bot.style.left) < (parseFloat(element.Pos_X) + parseFloat(bot.style.width) + step))) || ((parseFloat(bot.style.left) <= 0))) {
                                if (element.CanTPass === 0) {
                                    can_move = false;
                                    if (!bot.seeTank) {
                                        bot.direction = "right";
                                    }
                                }
                            }
                        }
                    });

                    bot.botShell.directionNew = 3;
                    if (bot.botSkinStatus === 0) {
                        bot.botSkinStatus = 1;
                        bot.src = '../static/image/botLeft.png';
                    } else if (bot.botSkinStatus === 1) {
                        bot.botSkinStatus = 0;
                        bot.src = '../static/image/botLeft1.png';
                    }
                    if (can_move) {
                        bot.style.left = (parseFloat(bot.style.left) - step) + "px";
                    }
                } if (bot.direction == 'right') {
                    let can_move = true;
                    if ((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(bot.style.top)) && (parseFloat(tank.style.top) < (parseFloat(bot.style.top) + parseFloat(tank.style.width)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width)) > parseFloat(bot.style.left)) && (parseFloat(tank.style.left) < (parseFloat(bot.style.left) + parseFloat(tank.style.width) + step)))) {
                        can_move = false;
                    }
                    brick.forEach(element => {
                        if (element != undefined) {
                            if ((((parseFloat(bot.style.top) + parseFloat(bot.style.width)) > parseFloat(element.Pos_Y)) && (parseFloat(bot.style.top) < (parseFloat(element.Pos_Y) + parseFloat(bot.style.width)))) && (((parseFloat(bot.style.left) + parseFloat(bot.style.width) + step) > parseFloat(element.Pos_X)) && (parseFloat(bot.style.left) < (parseFloat(element.Pos_X) + parseFloat(bot.style.width)))) || ((parseFloat(bot.style.left) + parseFloat(bot.style.width) >= boardSide))) {
                                if (element.CanTPass === 0) {
                                    can_move = false;
                                    if (!bot.seeTank)
                                        bot.direction = "left";
                                }
                            }
                        }
                    });

                    bot.botShell.directionNew = 4;
                    if (bot.botSkinStatus === 0) {
                        bot.botSkinStatus = 1;
                        bot.src = '../static/image/botRight.png';
                    } else if (bot.botSkinStatus === 1) {
                        bot.botSkinStatus = 0;
                        bot.src = '../static/image/botRight1.png';
                    }
                    if (can_move) {
                        bot.style.left = (parseFloat(bot.style.left) + step) + "px";
                    }
                }
            }, botSpeed);
        }
        else if (action == 'shoot') {
            botShotDirection(bot);
        }
    });
}

function startBot() {
    // Обновляем состояние игры каждые 2 секунд

        setInterval(updateBot, 1000);

}
startBot();


function botDelaying(bot) {
    setTimeout(() => { bot.botShootDelay = 0; }, 1500);
}



function botShotDirection(bot) {
    if (bot.botShell.update == 0) {
        bot.botShell.direction = bot.botShell.directionNew;

        if (bot.botShell.direction == 1) {
            bot.botShell.src = "../static/image/ShellTop.png";
            bot.botShell.style.top = (parseInt(bot.style.top) - parseInt(bot.botShell.style.height) * 0.5) + "px";
            bot.botShell.style.left = (parseInt(bot.style.left) + parseInt(bot.style.width) * 0.5 - parseInt(bot.botShell.style.width) * 0.5) + "px";
        }
        if (bot.botShell.direction == 2) {
            bot.botShell.src = "../static/image/ShellDown.png";
            bot.botShell.style.top = (parseInt(bot.style.top) + parseInt(bot.style.height) - parseInt(bot.botShell.style.height) * 0.5) + "px";
            bot.botShell.style.left = (parseInt(bot.style.left) + parseInt(bot.style.width) * 0.5 - parseInt(bot.botShell.style.width) * 0.5) + "px";
        }
        if (bot.botShell.direction == 3) {
            bot.botShell.src = "../static/image/ShellLeft.png";
            bot.botShell.style.top = (parseInt(bot.style.top) + parseInt(bot.style.height) * 0.5 - parseInt(bot.botShell.style.height) * 0.5) + "px";
            bot.botShell.style.left = (parseInt(bot.style.left) - parseInt(bot.style.width) * 0.5) + "px";
        }
        if (bot.botShell.direction == 4) {
            bot.botShell.src = "../static/image/ShellRight.png";
            bot.botShell.style.top = (parseInt(bot.style.top) + parseInt(bot.style.height) * 0.5 - parseInt(bot.botShell.style.height) * 0.5) + "px";
            bot.botShell.style.left = (parseInt(bot.style.left) + parseInt(bot.style.width) - parseInt(bot.botShell.style.width) * 0.5) + "px";
        }
        if (bot.botShootDelay == 0) 
            botShooting(bot);
    }
}

function botShooting(bot) {
    gameBoard.appendChild(bot.botShell);
    updateBotShall(bot);
    bot.botShell.update = 1;
    if ((parseInt(bot.botShell.style.top) < 0) || ((parseInt(bot.botShell.style.top) + 16) >= boardSide) || (parseInt(bot.botShell.style.left) < 0) || (parseInt(bot.botShell.style.left) >= boardSide - 16)) {
        explosionBotShall(bot);
    }


    if ((((parseInt(bot.botShell.style.top) + bot.botShell.height) > parseInt(tank.style.top)) && (parseInt(bot.botShell.style.top) < (parseInt(tank.style.top) + sideValue))) && (((parseInt(bot.botShell.style.left) + bot.botShell.width) > parseInt(tank.style.left)) && (parseInt(bot.botShell.style.left) < (parseInt(tank.style.left) + sideValue)))) {
        explosionBotShall(bot);
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
            if ((((parseInt(bot.botShell.style.top) + bot.botShell.height) > parseInt(element.Pos_Y)) && (parseInt(bot.botShell.style.top) < (parseInt(element.Pos_Y) + 40))) && (((parseInt(bot.botShell.style.left) + bot.botShell.width) > parseInt(element.Pos_X)) && (parseInt(bot.botShell.style.left) < (parseInt(element.Pos_X) + 40))) && (element.CanBPass === 0)) {
                explosionBotShall(bot);
                if (element.IsDestructible === 1) {
                    let removeObj = document.getElementById(i);
                    brick[i] = undefined;
                    removeObj.remove();
                }
            }
        }
    }
    if (bot.botShell.update == 1) {
        requestAnimationFrame(() => {
            botShooting(bot)
        });
    }
    bot.botShootDelay = 1;
}


function updateBotShall(bot) {
    let botShellSpeed = sideValue / 7;

    if (bot.botShell.direction == 1) {
        bot.botShell.style.top = (parseInt(bot.botShell.style.top) - botShellSpeed) + "px";
    }
    if (bot.botShell.direction == 2) {
        bot.botShell.style.top = (parseInt(bot.botShell.style.top) + botShellSpeed) + "px";
    }
    if (bot.botShell.direction == 3) {
        bot.botShell.style.left = (parseInt(bot.botShell.style.left) - botShellSpeed) + "px";
    }
    if (bot.botShell.direction == 4) {
        bot.botShell.style.left = (parseInt(bot.botShell.style.left) + botShellSpeed) + "px";
    }
}


function explosionBotShall(bot) {
    bot.botShell.update = 0;
    botShellPlacement = sideValue / 5;
    gameBoard.removeChild(bot.botShell);
    bot.botShotExplosion.style.top = (parseInt(bot.botShell.style.top) - botShellPlacement) + "px";
    bot.botShotExplosion.style.left = (parseInt(bot.botShell.style.left) - botShellPlacement) + "px";
    bot.botShotExplosion.src = '../static/image/explosion1.png';
    gameBoard.appendChild(bot.botShotExplosion);
    setTimeout(() => { bot.botShotExplosion.src = '../static/image/explosion2.png'; bot.botShotExplosion.style.top = (parseInt(bot.botShotExplosion.style.top) - 2) + "px"; bot.botShotExplosion.style.left = (parseInt(bot.botShotExplosion.style.left) - 2) + "px"; }, 80);
    setTimeout(() => { bot.botShotExplosion.src = '../static/image/explosion3.png'; bot.botShotExplosion.style.top = (parseInt(bot.botShotExplosion.style.top) - 1) + "px"; bot.botShotExplosion.style.left = (parseInt(bot.botShotExplosion.style.left) - 1) + "px"; }, 160);
    setTimeout(() => { gameBoard.removeChild(bot.botShotExplosion); }, 240);
    botDelaying(bot);

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