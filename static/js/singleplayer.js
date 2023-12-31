document.addEventListener("DOMContentLoaded", function () {
    
    //Отправка fetch запроса
    document.addEventListener("onload", getLevelData());
    
    function getLevelData() {
        const id = getLevelID()
        console.log("Hello", id);
    
        const requestOption = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(id)
        }
    
        fetch("/api/getlevel", requestOption)
            .then(Response => Response.json())
            .then(data => {
                console.log(data);
                levelDataProccessing(data);
                getObjects(requestOption);
            })
            .catch(Error => console.error(Error));
    }

    function getObjects(requestOption) {
        fetch("/api/getlevelobj", requestOption)
            .then(Response => Response.json())
            .then(data => {
                console.log(data);
                createLevel(data);
            })
            .catch(error => console.error(error));
    }
    
    function getLevelID() {
        const levelData = document.getElementById("level_data");
        let id = levelData.getAttribute("num");
    
        id = Number(id);
        return id
    } 

    //Обработка данных об уровне и изменение переменных по данным
    function levelDataProccessing(data){
        level = data;
        sideValue = boardSide / level.Size;
        bot2.style.left = ((level.Size - 1) / 2) * sideValue + "px";
        bot3.style.left = boardSide - sideValue + "px";
        levelSide = level.Size;
        tank.style.height = sideValue * 0.95 + "px";
        tank.style.width = sideValue * 0.95 + "px";
        console.log(sideValue);
        shell.style.height = sideValue * 0.3 + "px";
        shell.style.width = sideValue * 0.25 + "px";
        explosion.style.height = sideValue * 0.7 + "px";
        explosion.style.width = sideValue * 0.7 + "px";
        bots.forEach(bot => {
            bot.style.height = sideValue * 0.95 + "px";
            bot.style.width = sideValue * 0.95 + "px";
            bot.botShell.style.height = sideValue * 0.3 + "px";
            bot.botShell.style.width = sideValue * 0.25 + "px";
            bot.botShotExplosion.style.height = sideValue * 0.7 + "px";
            bot.botShotExplosion.style.width = sideValue * 0.7 + "px";
        })
        
        if (sideValue > 60) {
            step = 1;
            console.log("step", step);
        } else {
            speed = 200 / sideValue;
            botSpeed = 300 / sideValue;
            console.log("speed", speed);
        }
    }

    //Построение уровня
    function createLevel(data) {
        let tankThere = false;
        brick = data;
        for (let i = 0; i < brick.length; i++) {
            if (((brick[i].Pos_X === 0) || ((brick[i].Pos_X === (level.Size - 1) / 2)) || (brick[i].Pos_X === (level.Size - 1))) && (brick[i].Pos_Y === 0)) {
                brick[i] = undefined;
                continue;
            }
            brick[i].Pos_X = brick[i].Pos_X * sideValue + "px";
            brick[i].Pos_Y = brick[i].Pos_Y * sideValue + "px";
            if (brick[i].Name !== "Tank") {
                createNewElt(brick[i], i);
            } else if (brick[i].Name == "Tank") {
                tank.style.top = brick[i].Pos_Y;
                tank.style.left = brick[i].Pos_X;
                tankThere = true;
            } 
        };
        
        if (!tankThere) {
            let x = Math.floor((level.Size - 1) / 2) * sideValue + "px";
            let y = Math.floor(level.Size - 1) * sideValue + "px";
            console.log(x, ' ', y);
            for (let i = 0; i < brick.length; i++) {
                if (brick[i] !== undefined) {
                    if ((brick[i].Pos_X == x) && (brick[i].Pos_Y == y)) {
                        const removeObj = document.getElementById(i);
                        removeObj.remove();
                        brick[i] = undefined;
                    }
                }
            }

            tank.style.top = y;
            tank.style.left = x;
        }
    }

    const continueBtn = document.getElementById("continueBtn");
    const exitBtn = document.getElementById("exitBtn");
    function handleKeyPress(event) {
        if (event.key === "p" || event.keyCode === 80) {
          isPause = !isPause;
          const menu = document.getElementById("menu");
        if (menu.style.display === "none") {
            menu.style.display = "block";
            overlay.style.display = "block";
        }
        else {
            menu.style.display = "none";
            overlay.style.display = "none";
        }
        function continueAction() {
            console.log("Нажата кнопка 'Продолжить'");
            menu.style.display = "none";
            overlay.style.display = "none";
            isPause = false;
            return;
        }
          
          function exitAction() {
            console.log("Нажата кнопка 'Выход'");
            window.location.href = "/select_level"
          }
        continueBtn.addEventListener("click", continueAction);
        exitBtn.addEventListener("click", exitAction);
        }
      }
      
    document.addEventListener("keydown", handleKeyPress);

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


    // Добавление танка на игровое поле
    gameBoard.appendChild(tank);


    // Обработка клавиш для управления танком
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
        if (isPause) {
            return;
        }
        if (dead == true)
            return;
        if ((key === "ArrowUp")) {
            let can_move = true;
            audioTankRide.play();
            bots.forEach(bot => {
            if (bot != undefined) {
                    if (((parseFloat(tank.style.top) > parseFloat(bot.style.top)) && (parseFloat(tank.style.top) < parseFloat(bot.style.top) + parseFloat(bot.style.height) + step) && (parseFloat(tank.style.left) + parseFloat(tank.style.width) > parseFloat(bot.style.left)) && (parseFloat(tank.style.left) < parseFloat(bot.style.left) + parseFloat(bot.style.width)))) {
                        can_move = false;
                    }
                }
            })

            if (parseFloat(tank.style.top) <= 0) {
                can_move = false;
            }

            brick.forEach(element => {
                if (element != undefined) {
                    if ((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(element.Pos_Y)) && (parseFloat(tank.style.top) < (parseFloat(element.Pos_Y) + parseFloat(tank.style.width) + step))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width)) > parseFloat(element.Pos_X)) && (parseFloat(tank.style.left) < (parseFloat(element.Pos_X) + parseFloat(tank.style.width))))) {
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
            bots.forEach(bot => {
                if (bot != undefined) {
                    if (((parseFloat(tank.style.top) + parseFloat(tank.style.height) < parseFloat(bot.style.top) + parseFloat(bot.style.height)) && (parseFloat(tank.style.top) + parseFloat(tank.style.height) > parseFloat(bot.style.top) - step) && (parseFloat(tank.style.left) + parseFloat(tank.style.width) > parseFloat(bot.style.left)) && (parseFloat(tank.style.left) < parseFloat(bot.style.left) + parseFloat(bot.style.width)))) {
                        can_move = false;
                    }
                }
            });

            if (parseFloat(tank.style.top) + parseFloat(tank.style.width) >= boardSide) {
                can_move = false;
            }

            brick.forEach(element => {
                if (element != undefined) {
                    if ((((parseFloat(tank.style.top) + parseFloat(tank.style.width) + step) > parseFloat(element.Pos_Y)) && (parseFloat(tank.style.top) < (parseFloat(element.Pos_Y) + parseFloat(tank.style.width)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width)) > parseFloat(element.Pos_X)) && (parseFloat(tank.style.left) < (parseFloat(element.Pos_X) + parseFloat(tank.style.width))))) {
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
            bots.forEach(bot => {
                if (bot != undefined) {
                    if ((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(bot.style.top)) && (parseFloat(tank.style.top) < (parseFloat(bot.style.top) + parseFloat(tank.style.width)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width)) > parseFloat(bot.style.left)) && (parseFloat(tank.style.left) < (parseFloat(bot.style.left) + parseFloat(tank.style.width) + step)))) {
                        can_move = false;
                    }
                }
            })

            if (parseFloat(tank.style.left) <= 0) {
                can_move = false;
            }

            brick.forEach(element => {
                if (element != undefined) {
                    if ((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(element.Pos_Y)) && (parseFloat(tank.style.top) < (parseFloat(element.Pos_Y) + parseFloat(tank.style.width)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width)) > parseFloat(element.Pos_X)) && (parseFloat(tank.style.left) < (parseFloat(element.Pos_X) + parseFloat(tank.style.width) + step)))) {
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
            bots.forEach(bot => {
                if (bot != undefined) {
                    if ((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(bot.style.top)) && (parseFloat(tank.style.top) < (parseFloat(bot.style.top) + parseFloat(bot.style.height)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width) + 2*step) > parseFloat(bot.style.left)) && (parseFloat(tank.style.left) < (parseFloat(bot.style.left) + parseFloat(bot.style.width))))) {
                        can_move = false;
                    }
                }
            })

            if (parseFloat(tank.style.left) + parseFloat(tank.style.width) >= boardSide) {
                can_move = false
            }

            brick.forEach(element => {
                if (element != undefined) {
                    if ((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(element.Pos_Y)) && (parseFloat(tank.style.top) < (parseFloat(element.Pos_Y) + parseFloat(tank.style.width)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width) + step) > parseFloat(element.Pos_X)) && (parseFloat(tank.style.left) < (parseFloat(element.Pos_X) + parseFloat(tank.style.width))))) {
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
                if (key == "ArrowUp" || key == "ArrowDown" || key == "ArrowRight" || key == "ArrowLeft") {
                    clearInterval(keyPressed);
                    keyPressed = 0;
                }

            } else { audioTankRide.pause(); }
        })
    }


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
        if (!isPause) {
            updateShall(); 
        }
        shell.update = 1;
        console.log("shot");
        if ((parseInt(shell.style.top) < 0) || ((parseInt(shell.style.top) + 16) >= boardSide) || (parseInt(shell.style.left) < 0) || (parseInt(shell.style.left) >= boardSide - 16)) {
            explosionShall();
        }

        bots.forEach(bot => {
            if (bot != undefined) {
                if ((((parseInt(shell.style.top) + shell.height) > parseInt(bot.style.top)) && (parseInt(shell.style.top) < (parseInt(bot.style.top) + sideValue))) && (((parseInt(shell.style.left) + shell.width) > parseInt(bot.style.left)) && (parseInt(shell.style.left) < (parseInt(bot.style.left) + sideValue)))) {
                    explosionShall();
                    bot.health -= 1;
                    if (bot.health == 0) {
                        deadBot = bots.indexOf(bot);
                        botsNum--;
                        if (botsNum < 3) {
                            bot.remove();
                            bots.splice(deadBot, 1);
                        } else {
                            bot.health = 1;
                            bot.style.top = 1 + "px";

                            let pos = Math.floor(Math.random() * 3);

                            switch (pos) {
                                case 0:
                                    bot.style.left = 1 + "px";
                                    break;
                                case 1:
                                    bot.style.left = ((level.Size - 1) / 2) * sideValue + "px";
                                    break;
                                case 2:
                                    bot.style.left = boardSide - sideValue + "px";
                                    break;
                            }
                        }
                        updateTankCount(); 
                    }
                    console.log(bot);
                }
            }
        })

        for (var i = 0; i < brick.length; i++) {
            element = brick[i];
            if (element != undefined) {
                if ((((parseInt(shell.style.top) + shell.height) > parseInt(element.Pos_Y)) && (parseInt(shell.style.top) < (parseInt(element.Pos_Y) + sideValue))) && (((parseInt(shell.style.left) + shell.width) > parseInt(element.Pos_X)) && (parseInt(shell.style.left) < (parseInt(element.Pos_X) + sideValue))) && (element.CanBPass === 0)) {
                    explosionShall();
                    if (element.IsDestructible === 1) {
                        audioConcrete.pause();
                        audioBrickShot.play();
                        let removeObj = document.getElementById(i);
                        if (element.Name === "Base") {
                            removeObj.src = "../static/image/destroyed_base.png"
                            console.log("LOSE by angel");
                            lose();
                        } else {
                            brick[i] = undefined;
                            removeObj.remove();
                        }
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
        let shot = event.code;
        if ((shot == "KeyZ" || shot == "Space") && (shell.update == 0)) {
            shell.direction = shell.directionNew;
            audioShell.play();
            if (!isPause) {
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
        }
    });
});

function lose() {
    dead = true;
    console.log("GAME OVER");
    textWin.style.color = 'red';
    textWin.textContent = "YOU LOSE";
    tank.remove();
    setTimeout(() => { location.reload(); }, 2000);
}

function win() {
    console.log("WIN");
    textWin.textContent = "YOU WIN";
    setTimeout(() => { window.location.href = "/select_level"; }, 2000);
}

function updateTankCount() {
    botcountEvent.textContent = "enemys left: " + botsNum;
}

function updateHealth() {
    tankHpEvent.textContent = "health: " + health + "hp";
}

function exit() {
    audioButton.play();
    setTimeout(() => { window.location.href = "/select_level";}, 200);
}