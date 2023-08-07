//музыка
const audioButton = new Audio('../static/audio/button.mp3');
audioButton.volume = 0.8;

function back() {
    audioButton.play();
}

function play() {
    audioButton.play();
}

function sendData(buttonId) {
    const button = document.getElementById(buttonId);
    const size = button.getAttribute("size");
    const requestOption = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(buttonId)//JSON.stringify(newData)
    };

    fetch('api/getlevelobj', requestOption)
        .then(Response => Response.json())
        .then(data => {
            const elements = document.querySelectorAll('.field__cell');
            elements.forEach(element => {
                element.remove();
            });

            l_field = document.getElementById('level_field');
            l_field.style.gridTemplateColumns = "repeat(" + size + ", 1fr)";
            l_field.style.gridTemplateRows = "repeat(" + size + ", 1fr)";
            function Position(name, pos_x, pos_y) {
                this.name = name;
                this.pos_x = pos_x;
                this.pos_y = pos_y;
            }
            let sells = [];
            data.forEach(element => {
                sells.push(new Position(element['Name'], element['Pos_X'], element['Pos_Y'])); // выводим значение свойства Name каждого элемента массива
              });
            console.log(sells);
            let names = [];
            let positions = [];
            sells.forEach(element => {
                names.push(element['name']);
            });
            sells.forEach(element => {
                positions.push(element['pos_x'] + size * (element['pos_y']))
            })

            let map = [];
            for (let i = 0; i < size ** 2; i++){
                if (positions.indexOf(i) != -1){
                    map[i] = names[positions.indexOf(i)];
                }
                else {
                    map[i] = "Grey"
                }
            }
            console.log(map);
            for (let i = 0; i < size ** 2; i++) {
                const newElement = document.createElement('img');
                newElement.id = i;
                newElement.name = "None";
                newElement.onclick = function() {
                    let id = this.id;
                    NewSelect(id);
                }
                switch (map[i]) {
                    case 'Grey':
                        newElement.src = "../static/image/greyP.png";
                        break;
                    case 'Brick':
                        newElement.src = "../static/image/brick.png";
                        break;
                    case 'Steel':
                        newElement.src = "../static/image/steel.png";
                        break;
                    case 'Forest':
                        newElement.src = "../static/image/forest.png";
                        break;
                    case 'Water':
                        newElement.src = "../static/image/water.png";
                        break;
                }
                newElement.classList.add('field__cell');
                l_field.insertBefore(newElement, l_field.children[i]);
            }

        })
        .catch(error => console.error(error));
        
};

function back() {
    audioButton.play();
    setTimeout(() => { window.location.href = "/main";}, 200);
}

function play() {
    audioButton.play();
    setTimeout(() => { window.location.href = "/level/9";}, 200);
}

// function loadMusic() {
//     var audioPlayer document.getElementById("audioPlay");
//     var xhr = new XMLHttpRequest();
//     xhr.onreadystatechange = function() {
//         if (xhr.readyState === 4 && xhr.status === 200) {
//             audioPlayer.src = xhr.responseText;
//             audioPlayer.play();
//         }
//     };
//     xhr.open("GET", "../static/audio/fon.mp3", true);
//     xhr.send();
// }

// window.onload = function() {
//     loadMusic();
// }