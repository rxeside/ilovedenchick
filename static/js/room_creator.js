const createBtn = document.getElementById('create');
const deleteBtn = document.getElementById('delete');
const joinBtn = document.getElementById('join');
const key = document.getElementById('num');

createBtn.onclick = function() {
    createNewRoom()
}

deleteBtn.onclick = function() {
    if (key.value !== "") {
        deleteCurrRoom();
    }
}

joinBtn.onclick = function() {
    joinToRoom();
}

let s = 1;

function createNewRoom() {
    let newData = {
        Id: s
    };

    const requestOption  = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(newData)
    };

    fetch('api/create_new_room', requestOption);
    s++;
}

function deleteCurrRoom() {
    let number = parseInt(key.value)

    let roomID = {
        ID: number
    };
    
    const requestOption  = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(roomID)
    };

    fetch('api/delete_room', requestOption);
}

function joinToRoom() {
    window.location.href = "/room/" + key.value
}