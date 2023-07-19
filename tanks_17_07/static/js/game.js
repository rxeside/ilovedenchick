document.addEventListener("DOMContentLoaded", function () {
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

    // Создание звуков
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
            console.log(sideValue);
            shell.style.height = sideValue * 0.3 + "px";
            shell.style.width = sideValue * 0.25 + "px";
            explosion.style.height = sideValue * 0.7 + "px";
            explosion.style.width = sideValue * 0.7 + "px";

            if (sideValue > 60) {
                step = 1;
                console.log("step", step);
            } else {
                speed = 200 / sideValue;
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
    var shell = document.createElement("img");
    shell.className = "shell";
    shell.src = "../static/image/ShellTop.png";
    shell.direction = 1;
    shell.directionNew = 1;
    shell.update = 0;


    //Создание взрыва
    var explosion = document.createElement("img");
    explosion.className = "explosion";
    explosion.src = '../static/image/explosion1.png'

    // Создание танка
    var tank = document.createElement("img");

    tank.className = "tank";
    tank.style.top = (boardSide / 2 - 40) + "px";
    tank.style.left = (boardSide / 2 - 40) + "px";
    tank.src = '../static/image/top.png';

    // Добавление танка на игровое поле
    gameBoard.appendChild(tank);

    // Обработка клавиш для управления танком

    let status = 0;
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
        if ((key === "ArrowUp")) {
            let can_move = true;
            audioTankRide.play();
            brick.forEach(element => {
                if (element != undefined) {
                    if (((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(element.Pos_Y)) && (parseFloat(tank.style.top) < (parseFloat(element.Pos_Y) + parseFloat(tank.style.width) + step))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width)) > parseFloat(element.Pos_X)) && (parseFloat(tank.style.left) < (parseFloat(element.Pos_X) + parseFloat(tank.style.width)))) || ((parseFloat(tank.style.top) <= 0)))) {
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

            brick.forEach(element => {
                if (element != undefined) {
                    if (((((parseFloat(tank.style.top) + parseFloat(tank.style.width) + step) > parseFloat(element.Pos_Y)) && (parseFloat(tank.style.top) < (parseFloat(element.Pos_Y) + parseFloat(tank.style.width)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width)) > parseFloat(element.Pos_X)) && (parseFloat(tank.style.left) < (parseFloat(element.Pos_X) + parseFloat(tank.style.width)))) || ((parseFloat(tank.style.top) + parseFloat(tank.style.width) >= boardSide)))) {
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

            brick.forEach(element => {
                if (element != undefined) {
                    if (((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(element.Pos_Y)) && (parseFloat(tank.style.top) < (parseFloat(element.Pos_Y) + parseFloat(tank.style.width)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width) + step) > parseFloat(element.Pos_X)) && (parseFloat(tank.style.left) < (parseFloat(element.Pos_X) + parseFloat(tank.style.width)))) || ((parseFloat(tank.style.left) + parseFloat(tank.style.width) >= boardSide)))) {
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

    // const p = new Promise(() => {

    // })

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
        // audioExpllosion.play();
        // audio.then(alert);
        audioConcrete.play();
        gameBoard.appendChild(explosion);
        setTimeout(() => { explosion.src = '../static/image/explosion2.png'; explosion.style.top = (parseInt(explosion.style.top) - 2) + "px"; explosion.style.left = (parseInt(explosion.style.left) - 2) + "px"; }, 80);
        setTimeout(() => { explosion.src = '../static/image/explosion3.png'; explosion.style.top = (parseInt(explosion.style.top) - 1) + "px"; explosion.style.left = (parseInt(explosion.style.left) - 1) + "px"; }, 160);
        setTimeout(() => { gameBoard.removeChild(explosion); }, 240);
        r++;
    }

    // async function audio(){
    //     return explosionShall();
    // }

    function shooting() {
        gameBoard.appendChild(shell);
        updateShall();
        shell.update = 1;
        console.log("shot");
        if ((parseInt(shell.style.top) < 0) || ((parseInt(shell.style.top) + 16) >= boardSide) || (parseInt(shell.style.left) < 0) || (parseInt(shell.style.left) >= boardSide - 16)) {
            explosionShall();
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
        if (shell.update == 1) {
            requestAnimationFrame(shooting);
        }
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
            shooting();
        }
    });

});