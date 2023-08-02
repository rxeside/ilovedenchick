const createBtn = document.getElementById('create');
const nameFeild = document.getElementById('name');
const numOfPlayers = document.getElementById('num_of_players');

const min = 2;
const max = 6;

let LevelID;
let RoomName;
let maxNum;

nameFeild.onchange = function() {
    RoomName = nameFeild.value;
}

createBtn.onclick = function() {
    createNewRoom();
}

numOfPlayers.onchange = function() {
    if (numOfPlayers.value < min) {
        numOfPlayers.value = min;
    } else if (numOfPlayers.value > max) {
        numOfPlayers.value = max;
    }

    maxNum = Number(numOfPlayers.value)
}

document.onload = function() {
    numOfPlayers.value = 2;
}

function sendData(buttonId) {
    const button = document.getElementById(buttonId);
    const size = button.getAttribute("size");
    const requestOption = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(buttonId)
    };

    LevelID = buttonId;

    fetch('api/getlevelobj', requestOption)
        .then(Response => Response.json())
        .then(data => {
            const elements = document.querySelectorAll('.field__cell');
            elements.forEach(element => {
                element.remove();
            });

            let objects = [];

            data.forEach(element => {
                objects[element.Pos_X + size * element.Pos_Y] = element.ImgURL;
            })

            const l_field = document.getElementById('level_field');
            l_field.style.gridTemplateColumns = "repeat(" + size + ", 1fr)";
            l_field.style.gridTemplateRows = "repeat(" + size + ", 1fr)";

            for (let i = 0; i < size ** 2; i++) {
                const newElement = document.createElement('img');
                newElement.className = "field__cell";

                if (objects[i] === undefined) {
                    newElement.src = "../static/image/grey.png";
                } else {
                    newElement.src = objects[i];
                }

                l_field.appendChild(newElement);
            }
        })
        .catch(error => console.error(error));
};

function createNewRoom() {
    let newData = {
        Id: LevelID,
        Name: RoomName,
        Max: maxNum
    };

    const requestOption  = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(newData)
    };

    fetch('/api/create_new_room', requestOption)
        .then(res => {
            if (res.status == 200) {
                console.log("Всё отлично");
                window.location.href = "/select_room"
            } else {
                console.log("Что то не то");
            }
        });
}

function exit() {
    window.location.href = "/select_room"
}