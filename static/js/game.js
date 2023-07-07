document.addEventListener("DOMContentLoaded", function() {
    // Создание игрового поля
    var gameBoard = document.getElementById("game-board");
    var boardWidth = gameBoard.clientWidth;
    var boardHeight = gameBoard.clientHeight;

    // Создание и отображение кирпичей на поле
    const socket = new WebSocket("ws://localhost:3000/ws");
    let brick;

    socket.onmessage = function(event) {
        brick = JSON.parse(event.data);
        brick.forEach(element => {
            element.Pos_X = element.Pos_X * 40 + "px";
            element.Pos_Y = element.Pos_Y * 40 + "px";
            createNewElt(element);
        });
    };

    function createNewElt(element) {
        let obj = document.createElement("img");
        obj.classList.add('brick');
        obj.src = element.ImgURL;

        obj.style.top = element.Pos_Y;
        obj.style.left = element.Pos_X;

        gameBoard.appendChild(obj);
    }

    // var bricks = [
    //     { type: null, top: 80, left: 160 },
    //     { type: null, top: 240, left: 120 },
    //     { type: null, top: 400, left: 240 },
    //     { type: null, top: 560, left: 560 },
    //     { type: null, top: 300, left: 300 },
    // ];
    
    // for (var i = 0; i < bricks.length; i++) {
    //     var brick = document.createElement("div");
    //     brick.className = "brick";
    //     brick.style.top = bricks[i].top + "px";
    //     brick.style.left = bricks[i].left + "px";
    //     gameBoard.appendChild(brick);
    // }

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
    tank.style.left = (boardWidth / 2 - 40) + "px";
    tank.src = '../static/image/top.png';
    
    // Добавление танка на игровое поле
    gameBoard.appendChild(tank);
    
    // Обработка клавиш для управления танком
    
    var status = 0; 
    document.addEventListener("keydown", function(event) {
        let x = 0;
        var key = event.key;
        if ((key === "ArrowUp")) {
            let can_move = true;

            brick.forEach(element => {
                if (((((parseInt(tank.style.top) + 40) > parseInt(element.Pos_Y)) && (parseInt(tank.style.top) < (parseInt(element.Pos_Y) + 44))) && (((parseInt(tank.style.left) + 40) > parseInt(element.Pos_X)) && (parseInt(tank.style.left) < (parseInt(element.Pos_X) + 40))) || ((parseInt(tank.style.top) <= 0))))
                {  
                    can_move = false;
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
                tank.style.top = (parseInt(tank.style.top) - 4) + "px";
            } 
            // }    
           // arr[x-1][y]
           
        } else if ((key === "ArrowDown")) {
            let can_move = true;

            brick.forEach(element => {
                if (((((parseInt(tank.style.top) + 44) > parseInt(element.Pos_Y)) && (parseInt(tank.style.top) < (parseInt(element.Pos_Y) + 40))) && (((parseInt(tank.style.left) + 40) > parseInt(element.Pos_X)) && (parseInt(tank.style.left) < (parseInt(element.Pos_X) + 40))) || ((parseInt(tank.style.top) + 40 == boardHeight))))
                {  
                    can_move = false;
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
                tank.style.top = (parseInt(tank.style.top) + 4) + "px";
            }           

        } else if ((key === "ArrowLeft")) {
            let can_move = true;

            brick.forEach(element => {
                if ((((parseInt(tank.style.top) + 40) > parseInt(element.Pos_Y)) && (parseInt(tank.style.top) < (parseInt(element.Pos_Y) + 40))) && (((parseInt(tank.style.left) + 40) > parseInt(element.Pos_X)) && (parseInt(tank.style.left) < (parseInt(element.Pos_X) + 44))) || ((parseInt(tank.style.left) == 0)))
                {  
                    can_move = false;
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
                tank.style.left = (parseInt(tank.style.left) - 4) + "px";
            }
        } else if ((key === "ArrowRight")) {
            let can_move = true;

            brick.forEach(element => {
                if (((((parseInt(tank.style.top) + 40) > parseInt(element.Pos_Y)) && (parseInt(tank.style.top) < (parseInt(element.Pos_Y) + 40))) && (((parseInt(tank.style.left) + 44) > parseInt(element.Pos_X)) && (parseInt(tank.style.left) < (parseInt(element.Pos_X) + 40))) || ((parseInt(tank.style.left) + 40  == boardWidth))))
                {  
                    can_move = false;
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
                tank.style.left = (parseInt(tank.style.left) + 4) + "px";
            }
        }
    });

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
        if ((parseInt(shell.style.top) < 0) || ((parseInt(shell.style.top) + 16) >= boardHeight) || (parseInt(shell.style.left) < 0) || (parseInt(shell.style.left) >= boardWidth - 16)) {
            explosionShall();
        }
        for (var i = 0; i < brick.length; i++) {
            element = brick[i];
            //brick.style.left = brick[i].left + "px";
            if ((((parseInt(shell.style.top) + shell.height) > parseInt(element.Pos_Y)) && (parseInt(shell.style.top) < (parseInt(element.Pos_Y) + 40))) && (((parseInt(shell.style.left) + shell.width) > parseInt(element.Pos_X)) && (parseInt(shell.style.left) < (parseInt(element.Pos_X) + 40)))) {
                explosionShall();
            }
        }
        if (shell.update == 1) {
            requestAnimationFrame(play);
        }
    }

    // управление снарядом
    document.addEventListener("keydown", function(event) {
        var shot = event.code;
        if ((shot == 'KeyZ') && (shell.update == 0)){
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