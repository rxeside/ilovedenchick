document.addEventListener("DOMContentLoaded", function() {
    // Создание игрового поля
    var gameBoard = document.getElementById("game-board");
    var boardWidth = gameBoard.clientWidth;
    var boardHeight = gameBoard.clientHeight;

    // Создание и отображение кирпичей на поле
    var bricks = [
        { top: 80, left: 160 },
        { top: 240, left: 120 },
        { top: 400, left: 240 },
        { top: 560, left: 560 },
    ];
    
    for (var i = 0; i < bricks.length; i++) {
        var brick = document.createElement("div");
        brick.className = "brick";
        brick.style.top = bricks[i].top + "px";
        brick.style.left = bricks[i].left + "px";
        gameBoard.appendChild(brick);
    }

    //Создание снаряда
    var shell = document.createElement("img");
    shell.className = "shell";
    shell.src = "img/ShellTop.png";
    shell.direction = 1;
    shell.directionNew = 1;
    shell.update = 0;
    shell.height = 14;
    shell.width = 12;

    //Создание взрыва
    var explosion = document.createElement("img");
    explosion.className = "explosion";
    explosion.src = 'img/explosion1.png'
    
    // Создание танка
    var tank = document.createElement("img");
    tank.className = "tank";
    tank.style.top = (boardHeight / 2 - 40) + "px";
    tank.style.left = (boardWidth / 2 - 40) + "px";
    tank.src = 'img/top.png';
    
    // Добавление танка на игровое поле
    gameBoard.appendChild(tank);
    
    // Обработка клавиш для управления танком
    var status = 0; 
    document.addEventListener("keydown", function(event) {
        var key = event.key;
        if ((key === "ArrowUp")) {
            if ((((parseInt(tank.style.top) + 40) > parseInt(brick.style.top)) && (parseInt(tank.style.top) < (parseInt(brick.style.top) + 40))) && (((parseInt(tank.style.left) + 40) > parseInt(brick.style.left)) && (parseInt(tank.style.left) < (parseInt(brick.style.left) + 40)))) 
            {
               }  else {                                   
                    tank.style.top = (parseInt(tank.style.top) - 4) + "px";
                    shell.directionNew = 1;
                    if (status === 0) {
                        status = 1;
                        tank.src = 'img/top.png';
                    } else if (status === 1) {
                        status = 0;
                        tank.src = 'img/top1.png';
                    }
        }
           // arr[x-1][y]
           
        } else if ((key === "ArrowDown")) {
            if ((((parseInt(tank.style.top) + 40) > parseInt(brick.style.top)) && (parseInt(tank.style.top) < (parseInt(brick.style.top) + 40))) && (((parseInt(tank.style.left) + 40) > parseInt(brick.style.left)) && (parseInt(tank.style.left) < (parseInt(brick.style.left) + 40)))) 
            {
                console.log("2");
               }  else {   
            tank.style.top = (parseInt(tank.style.top) + 4) + "px";
            shell.directionNew = 2;
            if (status === 0) {
                status = 1;
                tank.src = 'img/down.png';
            } else if (status === 1) {
                status = 0;
                tank.src = 'img/down1.png';
            }
        }   // arr[x+1][y]

        } else if ((key === "ArrowLeft")) {
            if ((((parseInt(tank.style.top) + 40) > parseInt(brick.style.top)) && (parseInt(tank.style.top) < (parseInt(brick.style.top) + 40))) && (((parseInt(tank.style.left) + 40) > parseInt(brick.style.left)) && (parseInt(tank.style.left) < (parseInt(brick.style.left) + 40)))) 
            {
               }  else {   
            tank.style.left = (parseInt(tank.style.left) - 4) + "px";
            shell.directionNew = 3;
            if (status === 0) {
                status = 1;
                tank.src = 'img/left.png';
            } else if (status === 1) {
                status = 0;
                tank.src = 'img/left1.png';
            }
        } // arr[x][y-1]

        } else if ((key === "ArrowRight")) {
            if ((((parseInt(tank.style.top) + 40) > parseInt(brick.style.top)) && (parseInt(tank.style.top) < (parseInt(brick.style.top) + 40))) && (((parseInt(tank.style.left) + 40) > parseInt(brick.style.left)) && (parseInt(tank.style.left) < (parseInt(brick.style.left) + 40)))) 
            {
               }  else {  
            tank.style.left = (parseInt(tank.style.left) + 4) + "px";
            shell.directionNew = 4;
            if (status === 0) {
                status = 1;
                tank.src = 'img/right.png';
            } else if (status === 1) {
                status = 0;
                tank.src = 'img/right1.png';
            }
        } // arr[x][y+1]

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
        explosion.src = 'img/explosion1.png';
        gameBoard.appendChild(explosion);
        setTimeout(() => { explosion.src = 'img/explosion2.png'; explosion.style.top = (parseInt(explosion.style.top) - 2) + "px"; explosion.style.left = (parseInt(explosion.style.left) - 2) + "px"; }, 80 );
        setTimeout(() => { explosion.src = 'img/explosion3.png'; explosion.style.top = (parseInt(explosion.style.top) - 1) + "px"; explosion.style.left = (parseInt(explosion.style.left) - 1) + "px"; }, 160 );
        setTimeout(() => { gameBoard.removeChild(explosion); }, 240 );

    }

    function play() {
        gameBoard.appendChild(shell);
        updateShall();
        shell.update = 1;
        if ((parseInt(shell.style.top) < 0) || ((parseInt(shell.style.top) + 16) >= boardHeight) || (parseInt(shell.style.left) < 0) || (parseInt(shell.style.left) >= boardWidth - 16)) {
            explosionShall();
        }
        for (var i = 0; i < bricks.length; i++) {
            brick.style.top = bricks[i].top + "px";
            brick.style.left = bricks[i].left + "px";
            if ((((parseInt(shell.style.top) + shell.height) > parseInt(brick.style.top)) && (parseInt(shell.style.top) < (parseInt(brick.style.top) + 40))) && (((parseInt(shell.style.left) + shell.width) > parseInt(brick.style.left)) && (parseInt(shell.style.left) < (parseInt(brick.style.left) + 40)))) {
                explosionShall();
                console.log("1");
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
                shell.src = "img/ShellTop.png";
                shell.style.top = (parseInt(tank.style.top) - 6) + "px";
                shell.style.left = (parseInt(tank.style.left) + 14) + "px";
            }
            if (shell.direction == 2) {
                shell.src = "img/ShellDown.png";
                shell.style.top = (parseInt(tank.style.top) + 34) + "px";
                shell.style.left = (parseInt(tank.style.left) + 14) + "px";
            }
            if (shell.direction == 3) {
                shell.src = "img/ShellLeft.png";
                shell.style.top = (parseInt(tank.style.top) + 13) + "px";
                shell.style.left = (parseInt(tank.style.left) - 5) + "px";
            }
            if (shell.direction == 4) {
                shell.src = "img/ShellRight.png";
                shell.style.top = (parseInt(tank.style.top) + 13) + "px";
                shell.style.left = (parseInt(tank.style.left) + 34) + "px";
            }
            play();
        } 
    });

});