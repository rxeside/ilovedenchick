const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 2, 2, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 2, 0, 2, 1],
    [1, 0, 1, 0, 1, 0, 2, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];
  
  const tank = {
      x: 1,
      y: 1
  };
  
  // Функция для отображения карты
  function renderMap(x) {
      const mapElement = document.getElementById('map');
      mapElement.innerHTML = '';
  
      for (let i = 0; i < map.length; i++) {
          const row = document.createElement('div');
          row.className = 'row';
  
          for (let j = 0; j < map[i].length; j++) {
              const cell = document.createElement('div');
              cell.className = 'cell';
              cell.id = j + (i * 10);
  
              if (map[i][j] === 1) {
                  cell.classList.add('wall');
              } else if (map[i][j] === 2) {
                  cell.classList.add('metal');
              } else if (tank.x === j && tank.y === i && x == "up") {
                  cell.classList.add('utank');
              } else if (tank.x === j && tank.y === i && x == "down") {
                  cell.classList.add('dtank');
              } else if (tank.x === j && tank.y === i && x == "left") {
                  cell.classList.add('ltank');
              } else if (tank.x === j && tank.y === i) {
                  cell.classList.add('rtank');
              }
  
              row.appendChild(cell);
              
          }
  
          mapElement.appendChild(row);
      }
  }
  
  // Функция для обработки нажатия клавиш
  function handleKeyPress(event) {
      const key = event.key;
  
      if (key === 'ArrowUp') {
          moveTank(0, -1);

      } else if (key === 'ArrowDown') {
          moveTank(0, 1);
          
      } else if (key === 'ArrowLeft') {
          moveTank(-1, 0);
          
      } else if (key === 'ArrowRight') {
          moveTank(1, 0);
          
      }
  }
  
  // Функция для перемещения танка
  function moveTank(dx, dy) {
      let x;
      if (dx == 0 && dy == -1) {
          x = "up";
      } else if (dx == 0 && dy == 1) {
          x = "down";
      } else if (dx == -1 && dy == 0) {
          x = "left";
      } else if (dx == 1 && dy == 0) {
          x = "right";
      }
      const newX = tank.x + dx;
      const newY = tank.y + dy;
  
      if (map[newY][newX] !== 1 && map[newY][newX] !== 2) {
          tank.x = newX;
          tank.y = newY;
      }
  
      renderMap(x);
  }
  
  // Привязка обработчика события нажатия клавиш
  document.addEventListener('keydown', handleKeyPress);
  
  // Вызов функции для отображения карты
  renderMap();