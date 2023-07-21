// Обработка движения бота
function updateBot() {
    if (bot == undefined) {
        return;
    }
    let action = generateRandomAction();
    console.log("action: ", action);
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