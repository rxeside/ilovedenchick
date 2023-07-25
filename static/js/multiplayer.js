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
    let bulletStep = 0.4;
    let tankside;
    let ratio;

    const sizeOnServer = 100;
    const room = document.getElementById('room');
    const tanksize = 0.9;
    const tankstep = 50;
    const bulletstep = 5;
    const bulletwidth = 0.25;
    const bulletlen = 0.3;

    // Создание и отображение кирпичей на поле
    const socket = new WebSocket("ws://localhost:3000/ws/" + room.textContent);

    socket.onopen = function() {
        console.log("Connected");
    }

    socket.onmessage = function(event) {
        level = JSON.parse(event.data);

        ratio = boardSide / (level.Side * sizeOnServer)
        sideValue = boardSide / level.Side;

        step = sideValue / tankstep;
        bulletStep = step * bulletstep;
        tankside = sideValue * tanksize + "px";

        getObjects();
    };

    function getObjects() {
        socket.onmessage = function(event) {
            brick = JSON.parse(event.data);
            if (brick != null) {
                for (let i = 0; i < brick.length; i++) {
                    brick[i].Pos_X = brick[i].Pos_X*ratio + "px";
                    brick[i].Pos_Y = brick[i].Pos_Y*ratio + "px";
                    createNewElt(brick[i]);
                };
            }
            answersFromServer();
        };
    }

    function answersFromServer() {
        socket.onmessage = function(event) {
            let newState = JSON.parse(event.data);
            if (newState.Message === "Bullets") {
                updateBullets(newState.Bullets);
            } else if (newState.Message === "Objects") { 
                destroyObjects(newState.Objects)
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
                let newS = newstate[key];
                newS.X = newS.X * ratio;
                newS.Y = newS.Y * ratio;
                console.log(newS);
                tanks.push(newS);
                createNewTank(newS);
            } else {
                tanks[index].X = newstate[key].X * ratio;
                tanks[index].Y = newstate[key].Y * ratio;
                tanks[index].Direction = newstate[key].Direction;
                tanks[index].Distance = newstate[key].Distance * ratio;
                tanks[index].Status = newstate[key].Status
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
            let currTank = document.getElementById("tank" + tanks[key].ID);

            if(tanks[key].Distance === 0) {
                currTank.style.top = tanks[key].Y + "px";
                currTank.style.left = tanks[key].X + "px";
            } else if (!currTank.classList.contains("moving")) {
                currTank.classList.add("moving");
                moveByDistance(tanks[key]);
            }

            if ((tanks[key].Status === "Moving") || (tanks[key].Status === "Collision")) {
                changeAnimation(currTank, tanks[key].Direction);
            }
        }
    }

    function destroyObjects(newstate) {
        for (key in newstate) {
            const eltRemove = document.getElementById(newstate[key]);
            if (eltRemove != null) {
                eltRemove.remove();
            }
        }
    }

    function updateBullets(newstate) {
        for (key in newstate) {
            if (bullets[key] === undefined) {
                createNewBullet(newstate[key], key);
                bullets[key] = newstate[key];
                bullets[key].Start_X = bullets[key].Start_X * ratio;
                bullets[key].Start_Y = bullets[key].Start_Y * ratio;
                bullets[key].End_X = bullets[key].End_X * ratio;
                bullets[key].End_Y = bullets[key].End_Y * ratio;
                bulletLive(bullets[key], key);
            } else {
                bullets[key].End_X = newstate[key].End_X * ratio;
                bullets[key].End_Y = newstate[key].End_Y * ratio;
                console.log(bullets[key].End_X, ' ', bullets[key].End_Y);
            }
        }

        for (key in bullets) {
            if ((newstate[key] === undefined) || (newstate[key].Destroy)){
                removeBullet(key);
                console.log("Remove");
            }
        }
    }

    function bulletLive(currBullet, bulletId) {
        const bulletElt = document.getElementById("bullet" + bulletId);
        let destroy = false;
        let bulletTimerID = setInterval(function() {

            if(bulletElt !== null) {
                if (destroy) {
                    removeBullet(bulletId);
                    clearInterval(bulletTimerID);
                    return;
                }
                
                switch (currBullet.Direction) {
                    case "1":
                        if (parseFloat(bulletElt.style.top) - currBullet.End_Y > bulletStep) {
                            bulletElt.style.top = parseFloat(bulletElt.style.top) - bulletStep + "px"; 
                        } else {
                            bulletElt.style.top = currBullet.End_Y + "px";
                            destroy = true;
                        }
                        break;
                    case "2":
                        if (currBullet.End_Y - parseFloat(bulletElt.style.top) > bulletStep) {
                            bulletElt.style.top = parseFloat(bulletElt.style.top) + bulletStep + "px"; 
                        } else {
                            bulletElt.style.top = currBullet.End_Y + "px";
                            destroy = true;
                        }
                        break;
                    case "3":
                        if (parseFloat(bulletElt.style.left) - currBullet.End_X > bulletStep) {
                            bulletElt.style.left = parseFloat(bulletElt.style.left) - bulletStep + "px"; 
                        } else {
                            bulletElt.style.left = currBullet.End_X + "px";
                            destroy = true;
                        }
                        break;
                    case "4":
                        if (currBullet.End_X - parseFloat(bulletElt.style.left) > bulletStep) {
                            bulletElt.style.left = parseFloat(bulletElt.style.left) + bulletStep + "px"; 
                        } else {
                            bulletElt.style.left = currBullet.End_X + "px";
                            destroy = true;
                        }
                        break;
                }
            }
        }, 10)
    }

    function removeBullet(bulletId) {
        const bullet = document.getElementById("bullet" + bulletId);
        if (bullet !== null) {
            bullet.remove();
        }
        if (bullets[bulletId] !== undefined) {
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

        changeAnimation(newTank, element.Direction)

        gameBoard.appendChild(newTank);
    }

    function createNewBullet(element, id){
        const newBullet = document.createElement('img');
        newBullet.id = "bullet" + id;
        newBullet.className = "bullet";
        newBullet.style.top = element.Start_Y * ratio + "px";
        newBullet.style.left = element.Start_X * ratio + "px";
        
        switch (element.Direction) {
            case "1":
                newBullet.src = "../static/image/ShellTop.png";
                newBullet.style.width = sideValue * bulletwidth + "px";
                newBullet.style.height = sideValue * bulletlen + "px";
                break;
            case "2":
                newBullet.src = "../static/image/ShellDown.png";
                newBullet.style.width = sideValue * bulletwidth + "px";
                newBullet.style.height = sideValue * bulletlen + "px";
                break;
            case "3":
                newBullet.src = "../static/image/ShellLeft.png";
                newBullet.style.width = sideValue * bulletlen + "px";
                newBullet.style.height = sideValue * bulletwidth + "px";
                break;
            case "4":
                newBullet.src = "../static/image/ShellRight.png";
                newBullet.style.width = sideValue * bulletlen + "px";
                newBullet.style.height = sideValue * bulletwidth + "px";
                break;
        }

        gameBoard.appendChild(newBullet);
    }
    
    function createNewElt(element) {
        let obj = document.createElement("img");
        obj.id =  element.ID;
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
    
    // Обработка клавиш для управления танком
    let direction = 1
    let is_move = false;

    document.addEventListener("keydown", function(event) {
        let key = event.key;

        if (key == "c") {
            socket.send("Close");
            console.log("Close");
        }

        switch (key) {
            case "ArrowUp":
                if ((direction !== 1) || (!is_move)) {
                    if (is_move) {
                        stopMove();
                    }
                    direction = 1;
                    sendDir();
                }
                break;
            case "ArrowDown":
                if ((direction !== 2) || (!is_move)) {
                    if (is_move) {
                        stopMove();
                    }
                    direction = 2;
                    sendDir();
                }
                break;
            case "ArrowLeft":
                if ((direction !== 3) || (!is_move)) {
                    if (is_move) {
                        stopMove();
                    }
                    direction = 3;
                    sendDir();
                }
                break;
            case "ArrowRight":
                if ((direction !== 4) || (!is_move)) {
                    if (is_move) {
                        stopMove();
                    }
                    direction = 4;
                    sendDir();
                }
                break;
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
        is_move = false;
        distance = 0;
    }

    function sendDir()
    {
        is_move = true;
        socket.send("move");
        socket.send(direction);
    }

    function moveByDistance(currTank) {
        let tankElement = document.getElementById("tank" + currTank.ID);

        let moveTimerID = setInterval(function(){
            if (currTank.Distance <= step) {
                console.log(currTank);
                clearInterval(moveTimerID);
                tankElement.classList.remove("moving");
                return;
            }

            currTank.Distance -= step;
            switch (currTank.Direction) {
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
        }, 10);
        
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