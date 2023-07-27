const btns = document.getElementsByName("room");
console.log(btns);

window.onload = function() {
    btns.forEach(btn => {
        console.log(btn);
        btn.onclick = function() {
            selectRoom(btn.id)
        }
    });
}

function selectRoom(key) {
    
}

function joinToRoom(key) {
    window.location.href = "/room/" + key
};