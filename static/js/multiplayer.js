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
    let brick = [];
    let tanks = [];
    let bullets = [];
    let level;
    let size;
    let step = 0.4;
    let bulletStep = 0.4;
    let ratio;

    const sizeOnServer = 100;
    const room = document.getElementById('room');
    const tanksize = 0.9;
    const tankstep = 50;
    const bulletstep = 2.5;
    const bulletwidth = 0.25;
    const bulletlen = 0.3;

    const keypressed = {
        Up: false,
        Down: false,
        Left: false,
        Right: false
    }

    const lives = document.getElementById('lives')

    // Создание и отображение кирпичей на поле
    // const socket = new WebSocket("wss://" + document.location.hostname +":/ws/" + room.textContent);
    const socket = new WebSocket("ws://" + document.location.hostname +":3000/ws/" + room.textContent);

    socket.onopen = function() {
        console.log("Connected");
    }

    socket.onmessage = function(event) {
        level = JSON.parse(event.data);

        ratio = boardSide / (level.Side * sizeOnServer)
        size = boardSide / level.Side;

        step = size / tankstep;
        bulletStep = step * bulletstep;

        getObjects();
    };

    function getObjects() {
        socket.onmessage = function(event) {
            brick = JSON.parse(event.data);
            console.log(brick);

            createObjects(brick)
            
            answersFromServer();
        };
    }

    function answersFromServer() {
        socket.onmessage = function(event) {
            let newState = JSON.parse(event.data);
            if (newState.Message === "Reset") {
                deleteObjects();
                createObjects(newState.Objects);
                return
            } else if (newState.Message === "Bullets") {
                updateBullets(newState.Bullets);
            } else if (newState.Message === "Objects") { 
                destroyObjects(newState.Objects)
            } else {
                updateTanks(newState);
            }
        }; 
    }

    function createObjects(objects) {
        if (objects != null) {
            for (let i = 0; i < objects.length; i++) {
                objects[i].Pos_X = objects[i].Pos_X*ratio + "px";
                objects[i].Pos_Y = objects[i].Pos_Y*ratio + "px";
                if (objects[i].Name !== "Tank") {
                    createNewElt(objects[i]);
                }
            };
        }
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

        // updateLives();
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
                if (!newstate[key].Destroy) {
                    createNewBullet(newstate[key], key);
                    bullets[key] = newstate[key];
                    bullets[key].Start_X = bullets[key].Start_X * ratio;
                    bullets[key].Start_Y = bullets[key].Start_Y * ratio;
                    bullets[key].End_X = bullets[key].End_X * ratio;
                    bullets[key].End_Y = bullets[key].End_Y * ratio;
                    bulletLive(bullets[key], key);
                }
            } else if(bullets[key] !== undefined) {
                bullets[key].End_X = newstate[key].End_X * ratio;
                bullets[key].End_Y = newstate[key].End_Y * ratio;
                bullets[key].Destroy = newstate[key].Destroy
            }
        }

        for (key in bullets) {
            if (newstate[key] === undefined) {
               removeBullet(key) 
            }
        }
    }

    function bulletLive(currBullet, bulletId) {
        const bulletElt = document.getElementById("bullet" + bulletId);
        let bulletTimerID = setInterval(function() {

            if(bulletElt !== null) {
                if (currBullet.Destroy) {
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
                            removeBullet(bulletId);
                        }
                        break;
                    case "2":
                        if (currBullet.End_Y - parseFloat(bulletElt.style.top) > bulletStep) {
                            bulletElt.style.top = parseFloat(bulletElt.style.top) + bulletStep + "px"; 
                        } else {
                            bulletElt.style.top = currBullet.End_Y + "px";
                            removeBullet(bulletId);
                        }
                        break;
                    case "3":
                        if (parseFloat(bulletElt.style.left) - currBullet.End_X > bulletStep) {
                            bulletElt.style.left = parseFloat(bulletElt.style.left) - bulletStep + "px"; 
                        } else {
                            bulletElt.style.left = currBullet.End_X + "px";
                            removeBullet(bulletId);
                        }
                        break;
                    case "4":
                        if (currBullet.End_X - parseFloat(bulletElt.style.left) > bulletStep) {
                            bulletElt.style.left = parseFloat(bulletElt.style.left) + bulletStep + "px"; 
                        } else {
                            bulletElt.style.left = currBullet.End_X + "px";
                            removeBullet(bulletId);
                        }
                        break;
                }
            }
        }, 5)
    }

    function removeBullet(bulletId) {
        const bullet = document.getElementById("bullet" + bulletId);
        if (bullet !== null) {
            bullet.remove();
        }
        if (bullets[bulletId] !== undefined) {
            if (bullets[bulletId].Destroy) {
                bullets[bulletId] = undefined;
            }
        }
    }

    function createNewTank(element) {
        const newTank = document.createElement("img");
        newTank.id = "tank" + element.ID;
        newTank.className = "tank";
        newTank.src = "../static/image/top.png";
        newTank.style.top = element.Y + "px";
        newTank.style.left = element.X + "px";

        newTank.style.width = size * tanksize + "px";
        newTank.style.height = size * tanksize + "px";

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
                newBullet.style.width = size * bulletwidth + "px";
                newBullet.style.height = size * bulletlen + "px";
                break;
            case "2":
                newBullet.src = "../static/image/ShellDown.png";
                newBullet.style.width = size * bulletwidth + "px";
                newBullet.style.height = size * bulletlen + "px";
                break;
            case "3":
                newBullet.src = "../static/image/ShellLeft.png";
                newBullet.style.width = size * bulletlen + "px";
                newBullet.style.height = size * bulletwidth + "px";
                break;
            case "4":
                newBullet.src = "../static/image/ShellRight.png";
                newBullet.style.width = size * bulletlen + "px";
                newBullet.style.height = size * bulletwidth + "px";
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
        obj.style.width = size + "px";
        obj.style.height = size + "px";
        
        gameBoard.appendChild(obj);
    }

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
                    keypressed.Up = true;
                    sendDir();
                }
                break;
            case "ArrowDown":
                if ((direction !== 2) || (!is_move)) {
                    if (is_move) {
                        stopMove();
                    }
                    direction = 2;
                    keypressed.Down = true;
                    sendDir();
                }
                break;
            case "ArrowLeft":
                if ((direction !== 3) || (!is_move)) {
                    if (is_move) {
                        stopMove();
                    }
                    direction = 3;
                    keypressed.Left = true;
                    sendDir();
                }
                break;
            case "ArrowRight":
                if ((direction !== 4) || (!is_move)) {
                    if (is_move) {
                        stopMove();
                    }
                    direction = 4;
                    keypressed.Right = true;
                    sendDir();
                }
                break;
            case "z": 
                socket.send("Fire");
                break;
        }
    });

    document.addEventListener("keyup", function(event) {
        if (is_move) {
            switch (event.key) {
                case "ArrowUp":
                    keypressed.Up = false;
                    if (direction == 1) {
                        stopMove();
                        checkPressed();
                    }
                    break;
                case "ArrowDown":
                    keypressed.Down = false;
                    if (direction == 2) {
                        stopMove();
                        checkPressed();
                    }
                    break;
                case "ArrowLeft":
                    keypressed.Left = false;
                    if (direction == 3) {
                        stopMove();
                        checkPressed();
                    }
                    break;
                case "ArrowRight":
                    keypressed.Right = false;
                    if (direction == 4) {
                        stopMove();
                        checkPressed();
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

    function checkPressed() {
        if (keypressed.Up) {
            direction = 1;
            sendDir();
        } else if (keypressed.Down) {
            direction = 2;
            sendDir();
        } else if (keypressed.Left) {
            direction = 3;
            sendDir();
        } else if (keypressed.Right) {
            direction = 4;
            sendDir();
        }
    }

    function moveByDistance(currTank) {
        let tankElement = document.getElementById("tank" + currTank.ID);

        let moveTimerID = setInterval(function(){
            if (currTank.Distance <= step) {
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

    function deleteObjects() {
        for (key in brick) {
            const element = document.getElementById(brick[key].ID);
            if (element !== null) {
                element.remove();
            }
        }
    
        brick = null
    }

    // function updateLives() {
    //     let i = 0;
    //     while (lives.children[i] !== undefined) {
    //         let tankLive = lives.children[i];
    //         let find = false;

    //         tanks.forEach(tank => {
    //             if ("live" + tank.ID === tankLive.id) {
    //                 console.log(tank.Live);
    //                 tankLive.children[1].textContent = tank.Live;
    //                 find = true;
    //             }
    //         });

    //         if (!find) {
    //             tankLive.remove();
    //         }

    //         i++;
    //     }

    //     tanks.forEach(tank => {
    //         let tankLive = document.getElementById("live" + tank.ID);

    //         if (tankLive === null) {
    //             const newElt = document.createElement("div");
    //             const tankName = document.createElement("p");
    //             const liveNum = document.createElement("p");

    //             tankName.textContent = "Tank# " + tank.ID;
    //             liveNum.textContent = tank.Live;

    //             newElt.appendChild(tankName);
    //             newElt.appendChild(liveNum);

    //             newElt.id = "live" + tank.ID;

    //             lives.appendChild(newElt);
    //         }
    //     });
    // }
});