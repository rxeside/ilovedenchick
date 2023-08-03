//музыка
const audioButton = new Audio('../static/audio/button.mp3');
audioButton.volume = 0.8;
let currLevel;

const btns = document.getElementsByName("level");

window.onload = function() {
    btns.forEach(btn => {
        btn.onclick = function() {
            let id = Number(btn.id); 
            sendData(id);
        }
    });
}

function back() {
    audioButton.play();
}

function play() {
    audioButton.play();
}

function sendData(buttonId) {
    const button = document.getElementById(buttonId);
    const size = button.getAttribute("size");
    const name = button.getAttribute("levelname");
    const requestOption = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(buttonId)
    };

    const levelName = document.getElementById("level_name");
    levelName.textContent = name;

    currLevel = buttonId;

    fetch('api/getlevelobj', requestOption)
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
};

function back() {
    audioButton.play();
    setTimeout(() => { window.location.href = "/main";}, 200);
}

function play() {
    audioButton.play();
    setTimeout(() => { window.location.href = "/level/" + currLevel;}, 200);
}