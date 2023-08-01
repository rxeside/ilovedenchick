const btns = document.getElementsByName("room");
let selectedRoom;

window.onload = function() {
    btns.forEach(btn => {
        btn.onclick = function() {
            selectRoom(btn.id)
        }
    });
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
    window.location.href = "/room/" + selectedRoom;
};