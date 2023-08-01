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
    let email = login.email.value
    let pass = login.pass.value

    if (!emailIsValid(email)) {
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

    fetch('api/login', requestOption)
        .then((res) => {
            if (res.status == 200) {
                console.log("Всё отлично");
            } else {
                console.log("Что то не то");
            }
        });
}

register.onsubmit = function() {
    event.preventDefault();
    let email = register.email.value;
    let pass = register.pass.value;
    let nickname = register.nickname.value

    if (!emailIsValid(email)) {
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

    fetch('api/register', requestOption)
        .then((res) => {
            if (res.status == 200) {
                console.log("Всё отлично");
            } else {
                console.log("Что то не то");
            }
        });
}

function emailIsValid(email) {
    const pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    return pattern.test(email)
}