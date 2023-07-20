// $(document).ready(function(){
//     $("*").load("/main_menu");
// });

//Создание звуков
const audioButton = new Audio('../static/audio/button.mp3');
audioButton.volume = 0.8;
const audioFon = new Audio('../static/audio/fon.mp3');
audioFon.volume = 0.6;
audioFon.loop = true;

function clikButtonEditor() {
    audioButton.play();
    setTimeout(() => { window.location.href = "/create_level";}, 200);
}

function clikButtonSinglePlayer() {
    audioButton.play();
}

function clikButtonEditorMultyPlayer() {
    audioButton.play();
    // audioFon.play();
}

document.addEventListener("mousemove", function(){
    audioFon.play();
});