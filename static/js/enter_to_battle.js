let login = document.getElementById("login");
let register = document.getElementById("register");

function changeForm(type) {
    if ((type == "login") && (login.classList.contains("hide"))) {
        login.classList.remove("hide");
        register.classList.add("hide");
    } else if ((type == "register") && (register.classList.contains("hide"))){
        login.classList.add("hide");
        register.classList.remove("hide");
    }

    return
}

login.onsubmit = function() {
    event.preventDefault();
    let email = login.email.value;
    let pass = login.pass.value;
    
    if (!emailIsValid(email)) {
        dataError("emailNotValidate");
        return
    }

    if ((pass.length < 3) || (pass.length > 20)) {
        dataError("passLen");
        return
    }

    const data = {
        Nickname: "",
        Email: email,
        Pass: pass
    }

    const requestOption = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    };

    fetch('/api/login', requestOption)
        .then(res => {
            if (res.status == 200) {
                console.log("Всё отлично");
                window.location.href = "/main"
            } else {
                dataError("none")
                console.log("Что то не то");
            }
        });
}

register.onsubmit = function() {
    event.preventDefault();
    let email = register.email.value;
    let pass = register.pass.value;
    let nickname = register.nickname.value

    if ((nickname.length < 2) || (nickname.length > 20)) {
        dataError("nickLen");
        return
    }

    if (!emailIsValid(email)) {
        dataError("emailNotValidate");
        return
    }

    if ((pass.length < 3) || (pass.length > 20)) {
        dataError("passLen");
        return
    }

    const data = {
        Nickname: nickname,
        Email: email,
        Pass: pass
    }

    const requestOption = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    };

    fetch('/api/register', requestOption)
        .then(res => {
            if (res.status == 200) {
                console.log("Всё отлично");
                changeForm("login")
            } else {
                dataError("server")
                console.log("Что то не то");
            }
        });
}

function emailIsValid(email) {
    const pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    return pattern.test(email)
}

function dataError(type) {
    let message = "Error";

    switch (type) {
        case "passLen":
            message = "Пароль должен быть не меньше 3 символов и не больше 20"
            break;
    
        case "emailNotValidate":
            message = "Невалидный email";
            break;
        case "server":
            message = "Ошибка с сервером"
            break;
        case "nickLen":
            message = "Имя должно быть не меньше 2 символов и не больше 20";
            break;
        case "none":
            message = "Неправильный логин или пароль"
            break;
    }

    alert(message);
}