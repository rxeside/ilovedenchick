document.addEventListener("DOMContentLoaded", function() {
    // Создание игрового поля
    let gameBoard = document.getElementById("game-board");
    gameBoard.style.height = innerHeight * 0.8 + "px";
    gameBoard.style.width = gameBoard.style.height;
    let boardSide = gameBoard.clientHeight;
    let marginLeft = (innerWidth - boardSide) / 2;
    let marginTop = innerHeight - boardSide;
    gameBoard.style.top = marginTop / 2 + "px";
    gameBoard.style.left = marginLeft + "px";
    let brick;
    let tanks = [];
    let bullets = [];
    let level;
    let sideValue;
    let step = 0.4;
    let numOfTanks = 0;
    let tankside;
    const room = document.getElementById('room');
    // Создание и отображение кирпичей на поле
    const socket = new WebSocket("ws://localhost:3000/ws/" + room.textContent);

    socket.onopen = function() {
        console.log("Connected");
    }

    socket.onmessage = function(event) {
        level = JSON.parse(event.data);

        sideValue = boardSide / level.Side;
        step = sideValue / 50;
        tankside = sideValue * 0.95 + "px";
        // tank.style.height = sideValue * 0.95 + "px";
        // tank.style.width = sideValue * 0.95 + "px";
        // tank.style.top = (boardSide / 2 - sideValue) + "px";
        // tank.style.left = (boardSide / 2 - sideValue) + "px";

        getObjects();
    };

    function getObjects() {
        socket.send("level");
        socket.send(boardSide);
        socket.send(marginLeft);
        socket.send(marginTop);
        socket.onmessage = function(event) {
            brick = JSON.parse(event.data);
            for (let i = 0; i < brick.length; i++) {
                brick[i].Pos_X = brick[i].Pos_X + "px";
                brick[i].Pos_Y = brick[i].Pos_Y + "px";
                createNewElt(brick[i], i);
            };
            answersFromServer();
        };
    }

    function answersFromServer() {
        socket.onmessage = function(event) {
            let newState = JSON.parse(event.data);
            if (newState.Message === "Bullets") {
                updateBullets(newState.Bullets);
            } else {
                updateTanks(newState);
            }
        }; 
    }

    function updateTanks(newstate){
        for(key in newstate) {
            let index = -1;
            if (tanks !== undefined) {
                index = tanks.findIndex((tank) => tank.ID === newstate[key].ID);
            }

            if (index === -1) {
                createNewTank(newstate[key]);
                tanks.push(newstate[key]);
            } else {
                tanks[index].X = newstate[key].X;
                tanks[index].Y = newstate[key].Y;
                tanks[index].Direction = newstate[key].Direction;
                tanks[index].Distance = newstate[key].Distance;
            }
        };

        if (tanks !== undefined) {
            for (key in tanks) {
                index = newstate.findIndex((element) => element.ID === tanks[key].ID)

                if (index === -1) {
                    const removeTank = document.getElementById("tank" + tanks[key].ID);

                    removeTank.remove();
                    tanks.splice(key, 1);
                }
            }
        }

        for (key in tanks) {
            // console.log(currTank);
            let currTank = document.getElementById("tank" + tanks[key].ID);

            if(tanks[key].Distance === 0) {
                // console.log("Coordinates");
                currTank.classList.remove("moving");
                currTank.style.top = tanks[key].Y + "px";
                currTank.style.left = tanks[key].X + "px";
            } else {
                if (!currTank.classList.contains("moving")) {
                    currTank.classList.add("moving");
                    moveByDistance(tanks[key]);
                } else {
                    changeAnimation(currTank, tanks[key].Direction);
                }
            }
        }
    }

    function updateBullets(newstate) {
        for (key in newstate) {
            if (bullets[key] === undefined) {
                createNewBullet(newstate[key], key);
                bullets[key] = newstate[key];
                bulletLive(key);
            }
        }

        for (key in bullets) {
            if (newstate[key] === undefined) {
                removeBullet(key);
            }
        }
    }

    function bulletLive(bulletId) {
        // const Bullet = document.getElementById("bullet" + bulletId);
        setTimeout(function() {
            removeBullet(bulletId)
        }, 7000)
    }

    function removeBullet(bulletId) {
        const bullet = document.getElementById("bullet" + bulletId);
        if (bullet !== null) {
            bullet.remove();
        }
        if (bullets[bulletId] !== undefined) {
            console.log(bullets[bulletId]);
            bullets.splice(bulletId, 1);
        }
    }

    function createNewTank(element) {
        const newTank = document.createElement("img");
        newTank.id = "tank" + element.ID;
        newTank.className = "tank";
        newTank.src = "../static/image/top.png";
        newTank.style.top = element.Y + "px";
        newTank.style.left = element.X + "px";

        newTank.style.width = tankside;
        newTank.style.height = tankside;

        gameBoard.appendChild(newTank);
    }

    function createNewBullet(element, id){
        const newBullet = document.createElement('img');
        newBullet.id = "bullet" + id;
        newBullet.className = "bullet";
        newBullet.style.top = element.Start_Y + "px";
        newBullet.style.left = element.Start_X + "px";
        
        switch (element.Direction) {
            case "1":
                newBullet.src = "../static/image/ShellTop.png";
                break;
            case "2":
                newBullet.src = "../static/image/ShellDown.png";
                break;
            case "3":
                newBullet.src = "../static/image/ShellLeft.png";
                break;
            case "4":
                newBullet.src = "../static/image/ShellRight.png";
                break;
        }

        gameBoard.appendChild(newBullet);
    }
    
    function createNewElt(element, i) {
        let obj = document.createElement("img");
        obj.id =  i;
        obj.classList.add('brick');
        obj.src = element.ImgURL;
        if (element.CanTPass == 1) {
            obj.style.zIndex = "3";
        }

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
    shell.update = 0;
    shell.height = 14;
    shell.width = 12;

    //Создание взрыва
    var explosion = document.createElement("img");
    explosion.className = "explosion";
    explosion.src = '../static/image/explosion1.png'
    
    // Создание танка
    // var tank = document.createElement("img");

    // tank.className = "tank";
    // tank.src = '../static/image/top.png';
    
    // Добавление танка на игровое поле
    // gameBoard.appendChild(tank);
    
    // Обработка клавиш для управления танком
    
    let status = 0;
    let distance = 0; 
    let direction = 1
    let is_move = false;

    document.addEventListener("keydown", function(event) {
        let key = event.key;

        if (key == "c") {
            socket.send("Close");
            console.log("Close");
        }

        if (!is_move) {
            switch (key) {
                case "ArrowUp":
                    direction = 1;
                    // stopMove();
                    movingTank();
                    break;
                case "ArrowDown":
                    direction = 2;
                    // stopMove();
                    movingTank();
                    break;
                case "ArrowLeft":
                    direction = 3;
                    // stopMove();
                    movingTank();
                    break;
                case "ArrowRight":
                    direction = 4;
                    // stopMove();
                    movingTank();
                    break;
            }
        }
    });

    document.addEventListener("keyup", function(event) {
        
        if (is_move) {
            switch (event.key) {
                case "ArrowUp":
                    if (direction == 1) {
                        stopMove();
                    }
                    break;
                case "ArrowDown":
                    if (direction == 2) {
                        stopMove();
                    }
                    break;
                case "ArrowLeft":
                    if (direction == 3) {
                        stopMove();
                    }
                    break;
                case "ArrowRight":
                    if (direction == 4) {
                        stopMove();
                    }
                    break;  
            }
        }
    });

    function stopMove() {
        socket.send("stopMoving");
        // updateCoordinates = true;
        // if (distance > 0) {
            // let partOfWay = (startDistance - distance) % (step * 10);//Часть пути которое проедет клиент, но сервер не обработает
            // console.log(tank);
            // console.log(partOfWay);
            // socket.send(partOfWay);
        // }
        // else {
        // }
        // socket.send(0);
        is_move = false;
        distance = 0;
    }

    function movingTank() {
        sendDir();
        // is_move = true;

        // let moveTimerID = setInterval(function() {
            // changAnimation();

        //     if (is_move) {
        //         if (distance !== 0) 
        //         {
                    // moveByDistance();
        //         } 
        //         else 
        //         {
        //             // moveByCoordinates();
        //         }
        //     } 
        //     else 
        //     {
        //         clearInterval(moveTimerID);
        //     }
        // }, 10);
    }

    function sendDir()
    {
        is_move = true;
        socket.send("move");
        socket.send(direction);
    }

    function moveByDistance(currTank) {
        let tankElement = document.getElementById("tank" + tanks[key].ID);
        // distance = currTank.Distance;
        direction = currTank.Direction;
        let status = 0;
        let moveTimerID = setInterval(function(){
            if (currTank.Distance <= step) {
                clearInterval(moveTimerID);
            }

            currTank.Distance -= step;
            switch (direction) {
                case "1":
                    tankElement.style.top = parseFloat(tankElement.style.top) - step + "px";
                    break;
                case "2":
                    tankElement.style.top = parseFloat(tankElement.style.top) + step + "px";
                    break;
                case "3":
                    tankElement.style.left = parseFloat(tankElement.style.left) - step + "px";
                    break;
                case "4":
                    tankElement.style.left = parseFloat(tankElement.style.left) + step + "px";
                    break;
            }
        }, 10)

    }
    
    function moveByCoordinates() {
    
        switch (direction) {
            case 1:
                brick.forEach(element => { if (element != undefined) {
                    if (element.CanTPass === 0) {
                        if (((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(element.Pos_Y)) && (parseFloat(tank.style.top) < (parseFloat(element.Pos_Y) + parseFloat(tank.style.width) + step))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width)) > parseFloat(element.Pos_X)) && (parseFloat(tank.style.left) < (parseFloat(element.Pos_X) + parseFloat(tank.style.width)))) || ((parseFloat(tank.style.top) <= 0))))
                        {  
                           return;
                        } 
                    }
                }});
                tank.style.top = (parseFloat(tank.style.top) - step) + "px";
               break;
            case 2:
                brick.forEach(element => { if (element != undefined) {
                    if (element.CanTPass === 0) {
                        if (((((parseFloat(tank.style.top) + parseFloat(tank.style.width) +  step) > parseFloat(element.Pos_Y)) && (parseFloat(tank.style.top) < (parseFloat(element.Pos_Y) + parseFloat(tank.style.width)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width)) > parseFloat(element.Pos_X)) && (parseFloat(tank.style.left) < (parseFloat(element.Pos_X) + parseFloat(tank.style.width)))) || ((parseFloat(tank.style.top) + parseFloat(tank.style.width) >= boardSide))))
                        {  
                            return;
                        } 
                    }
                }});
            
                tank.style.top = (parseFloat(tank.style.top) + step) + "px"; 
                break;
            case 3:
                brick.forEach(element => { if (element != undefined) {
                    if (element.CanTPass === 0) {
                        if ((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(element.Pos_Y)) && (parseFloat(tank.style.top) < (parseFloat(element.Pos_Y) + parseFloat(tank.style.width)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width)) > parseFloat(element.Pos_X)) && (parseFloat(tank.style.left) < (parseFloat(element.Pos_X) + parseFloat(tank.style.width) +  step))) || ((parseFloat(tank.style.left) <= 0)))
                        {  
                            return;
                        } 
                    }
                }});
            
                tank.style.left = (parseFloat(tank.style.left) - step) + "px";
            case 4:
                brick.forEach(element => { if (element != undefined) {
                    if (element.CanTPass === 0) {
                        if (((((parseFloat(tank.style.top) + parseFloat(tank.style.width)) > parseFloat(element.Pos_Y)) && (parseFloat(tank.style.top) < (parseFloat(element.Pos_Y) + parseFloat(tank.style.width)))) && (((parseFloat(tank.style.left) + parseFloat(tank.style.width) +  step) > parseFloat(element.Pos_X)) && (parseFloat(tank.style.left) < (parseFloat(element.Pos_X) + parseFloat(tank.style.width)))) || ((parseFloat(tank.style.left) + parseFloat(tank.style.width) >= boardSide))))
                        {   
                            return;
                        } 
                    }
                }});
            
                tank.style.left = (parseFloat(tank.style.left) + step) + "px";
                break;
        }
        
    }

    function changeAnimation(currTank, dir) {
        switch (dir) {
            case "1":
                if (currTank.src.includes("top1")) {
                    currTank.src = '../static/image/top.png';
                } else {
                    currTank.src = '../static/image/top1.png';
                }
                break;
            case "2":
                if (currTank.src.includes("down1")) {
                    currTank.src = '../static/image/down.png';
                } else {
                    currTank.src = '../static/image/down1.png';
                }
                break;
            case "3":
                if (currTank.src.includes("left1")) {
                    currTank.src = '../static/image/left.png';
                } else {
                    currTank.src = '../static/image/left1.png';
                }
                break;
            case "4":
                if (currTank.src.includes("right1")) {
                    currTank.src = '../static/image/right.png';
                } else {
                    currTank.src = '../static/image/right1.png';
                }
                break;
        }
    }

    function updateShall() {
        if (shell.direction == 1) {
            shell.style.top = (parseInt(shell.style.top) - 6) + "px";
        }
        if (shell.direction == 2) {
            shell.style.top = (parseInt(shell.style.top) + 6) + "px";
        }
        if (shell.direction == 3) {
            shell.style.left = (parseInt(shell.style.left) - 6) + "px";
        }
        if (shell.direction == 4) {
            shell.style.left = (parseInt(shell.style.left) + 6) + "px";
        }
    }

    function explosionShall() {
        shell.update = 0;
        gameBoard.removeChild(shell);
        explosion.style.top = (parseInt(shell.style.top) - 9) + "px";
        explosion.style.left = (parseInt(shell.style.left) - 9) + "px";
        explosion.src = '../static/image/explosion1.png';
        gameBoard.appendChild(explosion);
        setTimeout(() => { explosion.src = '../static/image/explosion2.png'; explosion.style.top = (parseInt(explosion.style.top) - 2) + "px"; explosion.style.left = (parseInt(explosion.style.left) - 2) + "px"; }, 80 );
        setTimeout(() => { explosion.src = '../static/image/explosion3.png'; explosion.style.top = (parseInt(explosion.style.top) - 1) + "px"; explosion.style.left = (parseInt(explosion.style.left) - 1) + "px"; }, 160 );
        setTimeout(() => { gameBoard.removeChild(explosion); }, 240 );

    }

    function play() {
        gameBoard.appendChild(shell);
        updateShall();
        shell.update = 1;
        if ((parseInt(shell.style.top) < 0) || ((parseInt(shell.style.top) + 16) >= boardSide) || (parseInt(shell.style.left) < 0) || (parseInt(shell.style.left) >= boardSide - 16)) {
            explosionShall();
        }

        for (var i = 0; i < brick.length; i++) {
            element = brick[i];
            if (element != undefined) {
                if ((((parseInt(shell.style.top) + shell.height) > parseInt(element.Pos_Y)) && (parseInt(shell.style.top) < (parseInt(element.Pos_Y) + 40))) && (((parseInt(shell.style.left) + shell.width) > parseInt(element.Pos_X)) && (parseInt(shell.style.left) < (parseInt(element.Pos_X) + 40))) && (element.CanBPass === 0)) {
                    explosionShall();
                    if (element.IsDestructible === 1) {
                        let removeObj = document.getElementById(i);
                        brick[i] = undefined;
                        removeObj.remove();
                    }
                }
            }
        }

        if (shell.update == 1) {
            requestAnimationFrame(play);
        }
    }

    // управление снарядом
    document.addEventListener("keydown", function(event) {
        let shot = event.code;
        if ((shot == "KeyZ" || shot == "Enter")){ //&& (shell.update == 0)){
            socket.send("Fire");
            // shell.direction = direction;
            // if (shell.direction == 1) {
            //     shell.src = "../static/image/ShellTop.png";
            //     shell.style.top = (parseInt(tank.style.top) - 6) + "px";
            //     shell.style.left = (parseInt(tank.style.left) + 14) + "px";
            // }
            // if (shell.direction == 2) {
            //     shell.src = "../static/image/ShellDown.png";
            //     shell.style.top = (parseInt(tank.style.top) + 34) + "px";
            //     shell.style.left = (parseInt(tank.style.left) + 14) + "px";
            // }
            // if (shell.direction == 3) {
            //     shell.src = "../static/image/ShellLeft.png";
            //     shell.style.top = (parseInt(tank.style.top) + 13) + "px";
            //     shell.style.left = (parseInt(tank.style.left) - 5) + "px";
            // }
            // if (shell.direction == 4) {
            //     shell.src = "../static/image/ShellRight.png";
            //     shell.style.top = (parseInt(tank.style.top) + 13) + "px";
            //     shell.style.left = (parseInt(tank.style.left) + 34) + "px";
            // }
            // play();
        }
    });

});