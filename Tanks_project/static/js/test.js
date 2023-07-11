const socket = new WebSocket("ws://localhost:3000/ws");

socket.addEventListener("open", () => {
    console.log("Соединение установлено");
});

socket.addEventListener("close", () => {
    console.log("Соединение закрыто");
});

socket.addEventListener("error", (error) => {
    console.error("Произошла ошибка", error);
});

let test = {
    "Id": null,
    "Name": null,
    "Index": null,
    "IsDestructible": null,
    "CanSkip": null,
    "Path": null
}

socket.onmessage = function(event) {
    const message = JSON.parse(event.data)  
    console.log(message);
    let test = message[1];
    console.log(test);
};