const btns = document.getElementsByName("room");
let selectedRoom = -1;

const audioButton = new Audio('../static/audio/button.mp3');
audioButton.volume = 0.8;

window.onload = function() {
    btns.forEach(btn => {
        btn.onclick = function() {
            selectRoom(btn.id)
        }
    });

    if (btns.length >= 10) {
        const button = document.getElementById("create_new");

        button.remove();
    }
}

function selectRoom(key) {
    const button = document.getElementById(key);
    const size = button.getAttribute("size");
    key = Number(key);
    selectedRoom = key;

    const requestOption = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(key)
    };

    fetch('/api/getobjfromroom', requestOption)
        .then(Response => Response.json())
        .then(data => {
            const elements = document.querySelectorAll('.field__cell');
            elements.forEach(element => {
                element.remove();
            });

            console.log(data);

            let objects = [];

            data.forEach(element => {
                objects[element.Pos_X + size * element.Pos_Y] = element.ImgURL;
            })
            console.log(objects);

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
}

function joinToRoom() {
    if (selectedRoom == -1)  {
        return
    }
    audioButton.play();
    setTimeout(() => { window.location.href = "/room/" + selectedRoom;}, 200);
};

function createNewRoom() {
    audioButton.play();
    setTimeout(() => { window.location.href = "/create_room";}, 200);
}

function exit() {
    audioButton.play();
    setTimeout(() => { window.location.href = "/main";}, 200);
}