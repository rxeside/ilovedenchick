document.addEventListener("DOMContentLoaded", function() {
    // Создание игрового поля
    let gameBoard = document.getElementById("game-board");
    console.log(innerHeight);
    gameBoard.style.height = innerHeight * 0.8 + "px";
    gameBoard.style.width = gameBoard.style.height;
    let boardWidth = gameBoard.clientWidth;
    let boardHeight = gameBoard.clientHeight;
    let marginLeft = gameBoard.getBoundingClientRect().left // !!!!!!!!! сделать лоя топа !!!!!!!!!!!!!!!!

    // Создание и отображение кирпичей на поле
    const socket = new WebSocket("ws://localhost:3000/ws");
    let brick;

    socket.onmessage = function(event) {
        brick = JSON.parse(event.data);
        for (let i = 0; i < brick.length; i++) {
            brick[i].Pos_X = marginLeft + brick[i].Pos_X * 40 + "px";
            brick[i].Pos_Y = brick[i].Pos_Y * 40 + "px";
            console.log(i);
            createNewElt(brick[i], i);
        };

        console.log(brick);
        console.log(marginLeft);
    };

    function createNewElt(element, i) {
        let obj = document.createElement("img");
        obj.id =  i;
        obj.classList.add('brick');
        obj.src = element.ImgURL;

        obj.style.top = element.Pos_Y;
        obj.style.left = element.Pos_X; 

        gameBoard.appendChild(obj);
    }

    //Создание снаряда
    var shell = document.createElement("img");
    shell.className = "shell";
    shell.src = "../static/image/ShellTop.png";
    shell.direction = 1;
    shell.directionNew = 1;
    shell.update = 0;
    shell.height = 14;
    shell.width = 12;

    //Создание взрыва
    var explosion = document.createElement("img");
    explosion.className = "explosion";
    explosion.src = '../static/image/explosion1.png'
    
    // Создание танка
    var tank = document.createElement("img");
    tank.className = "tank";
    tank.style.top = (boardHeight / 2 - 40) + "px";
    tank.style.left = (boardWidth / 2 - 40) + marginLeft + "px";
    tank.src = '../static/image/top.png';
    
    // Добавление танка на игровое поле
    gameBoard.appendChild(tank);
    
    // Обработка клавиш для управления танком
    
    var status = 0;
    let keyPressed = 0;
    document.addEventListener('keydown', (event) => {
        if (!keyPressed) {
            //console.log("start");
            keyPressed = setInterval(function() {
                //console.log("funcON");
                var key = event.key;
                
                
                if ((key === "ArrowUp")) {
                    let can_move = true;
                   
                    brick.forEach(element => { if (element != undefined) {
                        if (((((parseInt(tank.style.top) + 40) > parseInt(element.Pos_Y)) && (parseInt(tank.style.top) < (parseInt(element.Pos_Y) + 41))) && (((parseInt(tank.style.left) + 40) > parseInt(element.Pos_X)) && (parseInt(tank.style.left) < (parseInt(element.Pos_X) + 40))) || ((parseInt(tank.style.top) <= 0))))
                        {  
                            if (element.CanTPass === 0)
                               can_move = false;
                            
                        } 
                    }});
                    
                    shell.directionNew = 1;
                    if (status === 0) {
                        status = 1;
                        tank.src = '../static/image/top.png';
                    } else if (status === 1) {
                        status = 0;
                        tank.src = '../static/image/top1.png';
                    }
        
                    if (can_move) {
                        tank.style.top = (parseInt(tank.style.top) - 1) + "px";
                    } 
                   
                } else if ((key === "ArrowDown")) {
                    let can_move = true;
        
                    brick.forEach(element => { if (element != undefined) {
                        if (((((parseInt(tank.style.top) + 41) > parseInt(element.Pos_Y)) && (parseInt(tank.style.top) < (parseInt(element.Pos_Y) + 40))) && (((parseInt(tank.style.left) + 40) > parseInt(element.Pos_X)) && (parseInt(tank.style.left) < (parseInt(element.Pos_X) + 40))) || ((parseInt(tank.style.top) + 40 == boardHeight))))
                        {  
                            if (element.CanTPass === 0)
                                can_move = false;
                        } 
                    }});
        
                    shell.directionNew = 2;
                    if (status === 0) {
                        status = 1;
                        tank.src = '../static/image/down.png';
                    } else if (status === 1) {
                        status = 0;
                        tank.src = '../static/image/down1.png';
                    }
        
                    if (can_move) {
                        tank.style.top = (parseInt(tank.style.top) + 1) + "px";
                    }           
        
                } else if ((key === "ArrowLeft")) {
                    let can_move = true;
        
                    brick.forEach(element => { if (element != undefined) {
                        if ((((parseInt(tank.style.top) + 40) > parseInt(element.Pos_Y)) && (parseInt(tank.style.top) < (parseInt(element.Pos_Y) + 40))) && (((parseInt(tank.style.left) + 40) > parseInt(element.Pos_X)) && (parseInt(tank.style.left) < (parseInt(element.Pos_X) + 41))) || ((parseInt(tank.style.left) <= marginLeft)))
                        {  
                            if (element.CanTPass === 0)
                                can_move = false;
                        } 
                    }});
        
                    shell.directionNew = 3;
                    if (status === 0) {
                        status = 1;
                        tank.src = '../static/image/left.png';
                    } else if (status === 1) {
                        status = 0;
                        tank.src = '../static/image/left1.png';
                    }
        
                    if (can_move) {
                        tank.style.left = (parseInt(tank.style.left) - 1) + "px";
                    }
                } else if ((key === "ArrowRight")) {
                    let can_move = true;
        
                    brick.forEach(element => { if (element != undefined) {
                        if (((((parseInt(tank.style.top) + 40) > parseInt(element.Pos_Y)) && (parseInt(tank.style.top) < (parseInt(element.Pos_Y) + 40))) && (((parseInt(tank.style.left) + 41) > parseInt(element.Pos_X)) && (parseInt(tank.style.left) < (parseInt(element.Pos_X) + 40))) || ((parseInt(tank.style.left) + 40  >= boardWidth + marginLeft))))
                        {   
                            if (element.CanTPass === 0)
                                can_move = false;
                        } 
                    }});
        
                    shell.directionNew = 4;
                    if (status === 0) {
                        status = 1;
                        tank.src = '../static/image/right.png';
                    } else if (status === 1) {
                        status = 0;
                        tank.src = '../static/image/right1.png';
                    }
        
                    if (can_move) { 
                        tank.style.left = (parseInt(tank.style.left) + 1) + "px";
                    }
                }
            }, 7);
        }
    })

    document.addEventListener('keyup', (event) => {
        if (keyPressed) {
            var key = event.key;
            if (key == "ArrowUp" || key === "ArrowDown" || key == "ArrowRight" || key == "ArrowLeft") {
                //console.log("STOP");
                clearInterval(keyPressed);
                keyPressed = 0;
            }
        }
    })
    // document.addEventListener("keydown", function(event) {
        
    //     let x = 0;
    //     var key = event.key;

    //     if ((key === "ArrowUp")) {
    //         let can_move = true;

    //         brick.forEach(element => { if (element != undefined) {
    //             if (((((parseInt(tank.style.top) + 40) > parseInt(element.Pos_Y)) && (parseInt(tank.style.top) < (parseInt(element.Pos_Y) + 44))) && (((parseInt(tank.style.left) + 40) > parseInt(element.Pos_X)) && (parseInt(tank.style.left) < (parseInt(element.Pos_X) + 40))) || ((parseInt(tank.style.top) <= 0))))
    //             {  
    //                 if (element.CanTPass === 0)
    //                    can_move = false;
                    
    //             } 
    //         }});
            
    //         shell.directionNew = 1;
    //         if (status === 0) {
    //             status = 1;
    //             tank.src = '../static/image/top.png';
    //         } else if (status === 1) {
    //             status = 0;
    //             tank.src = '../static/image/top1.png';
    //         }

    //         if (can_move) {
    //             tank.style.top = (parseInt(tank.style.top) - 4) + "px";
    //         } 
           
    //     } else if ((key === "ArrowDown")) {
    //         let can_move = true;

    //         brick.forEach(element => { if (element != undefined) {
    //             if (((((parseInt(tank.style.top) + 44) > parseInt(element.Pos_Y)) && (parseInt(tank.style.top) < (parseInt(element.Pos_Y) + 40))) && (((parseInt(tank.style.left) + 40) > parseInt(element.Pos_X)) && (parseInt(tank.style.left) < (parseInt(element.Pos_X) + 40))) || ((parseInt(tank.style.top) + 40 == boardHeight))))
    //             {  
    //                 if (element.CanTPass === 0)
    //                     can_move = false;
    //             } 
    //         }});

    //         shell.directionNew = 2;
    //         if (status === 0) {
    //             status = 1;
    //             tank.src = '../static/image/down.png';
    //         } else if (status === 1) {
    //             status = 0;
    //             tank.src = '../static/image/down1.png';
    //         }

    //         if (can_move) {
    //             tank.style.top = (parseInt(tank.style.top) + 4) + "px";
    //         }           

    //     } else if ((key === "ArrowLeft")) {
    //         let can_move = true;

    //         brick.forEach(element => { if (element != undefined) {
    //             if ((((parseInt(tank.style.top) + 40) > parseInt(element.Pos_Y)) && (parseInt(tank.style.top) < (parseInt(element.Pos_Y) + 40))) && (((parseInt(tank.style.left) + 40) > parseInt(element.Pos_X)) && (parseInt(tank.style.left) < (parseInt(element.Pos_X) + 44))) || ((parseInt(tank.style.left) == 0)))
    //             {  
    //                 if (element.CanTPass === 0)
    //                     can_move = false;
    //             } 
    //         }});

    //         shell.directionNew = 3;
    //         if (status === 0) {
    //             status = 1;
    //             tank.src = '../static/image/left.png';
    //         } else if (status === 1) {
    //             status = 0;
    //             tank.src = '../static/image/left1.png';
    //         }

    //         if (can_move) {
    //             tank.style.left = (parseInt(tank.style.left) - 4) + "px";
    //         }
    //     } else if ((key === "ArrowRight")) {
    //         let can_move = true;

    //         brick.forEach(element => { if (element != undefined) {
    //             if (((((parseInt(tank.style.top) + 40) > parseInt(element.Pos_Y)) && (parseInt(tank.style.top) < (parseInt(element.Pos_Y) + 40))) && (((parseInt(tank.style.left) + 44) > parseInt(element.Pos_X)) && (parseInt(tank.style.left) < (parseInt(element.Pos_X) + 40))) || ((parseInt(tank.style.left) + 40  == boardWidth))))
    //             {   
    //                 if (element.CanTPass === 0)
    //                     can_move = false;
    //             } 
    //         }});

    //         shell.directionNew = 4;
    //         if (status === 0) {
    //             status = 1;
    //             tank.src = '../static/image/right.png';
    //         } else if (status === 1) {
    //             status = 0;
    //             tank.src = '../static/image/right1.png';
    //         }

    //         if (can_move) { 
    //             tank.style.left = (parseInt(tank.style.left) + 4) + "px";
    //         }
    //     }
    // });

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
        if ((parseInt(shell.style.top) < 0) || ((parseInt(shell.style.top) + 16) >= boardHeight) || (parseInt(shell.style.left) < marginLeft) || (parseInt(shell.style.left) >= boardWidth + marginLeft - 16)) {
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
        var shot = event.code;
        if ((shot == "KeyZ" || shot == "Enter") && (shell.update == 0)){
            shell.direction = shell.directionNew;
            if (shell.direction == 1) {
                shell.src = "../static/image/ShellTop.png";
                shell.style.top = (parseInt(tank.style.top) - 6) + "px";
                shell.style.left = (parseInt(tank.style.left) + 14) + "px";
            }
            if (shell.direction == 2) {
                shell.src = "../static/image/ShellDown.png";
                shell.style.top = (parseInt(tank.style.top) + 34) + "px";
                shell.style.left = (parseInt(tank.style.left) + 14) + "px";
            }
            if (shell.direction == 3) {
                shell.src = "../static/image/ShellLeft.png";
                shell.style.top = (parseInt(tank.style.top) + 13) + "px";
                shell.style.left = (parseInt(tank.style.left) - 5) + "px";
            }
            if (shell.direction == 4) {
                shell.src = "../static/image/ShellRight.png";
                shell.style.top = (parseInt(tank.style.top) + 13) + "px";
                shell.style.left = (parseInt(tank.style.left) + 34) + "px";
            }
            play();
        } 
    });

});