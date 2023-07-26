const l_Name = document.getElementById('level_Name'); 
    l_side = document.getElementById('level_side'); 
    l_field = document.getElementById('level_field');
    cell_menu = document.getElementById('cell_menu');
    message = document.getElementById('message');

let selectedType = null;
let Obj_on_level = [];

//музыка
const audioButton = new Audio('../static/audio/button.mp3');
audioButton.volume = 0.8;
const audioFon = new Audio('../static/audio/fon.mp3');
audioFon.volume = 0.6;
audioFon.loop = true;

const level = {
    name: "",
    side: "",
    author: "User"
};

//При изменении поля name, wight или height мы меняем значения level
l_Name.onchange = function() {
    level.name = l_Name.value;
}

l_side.onchange = function() {
    level.side = l_side.value;
}

//Функция обновление поля
function updateField()
{
    audioButton.play();
    audioFon.play();
    if ((level.side != null))
    {
        //Задаём нашему полю столбцы и строки
        l_field.style.gridTemplateColumns = "repeat(" + level.side + ", 1fr)";
        l_field.style.gridTemplateRows = "repeat(" + level.side + ", 1fr)";
        //Создание элементов поля
        for (let i = 0; i < level.side ** 2; i++)
        {
            const newElement = document.createElement('img');
            newElement.id = i;
            newElement.name = "None";
            newElement.onclick = function() {
                let id = this.id;
                NewSelect(id);
            }
            newElement.src = "../static/image/grey.png";
            newElement.classList.add('field__cell');
            l_field.insertBefore(newElement, l_field.children[i]);
        }

        openMenu();
    }
}

function NewSelect(id) 
{
    changeIcon(id);
    editcell(id);
}

let CurrentCell = {
    name: null,
    isDestructible: null,
    canTpass: null,
    can_B_pass: null,
    imgURL: null,
    x: null,
    y: null
}

function cleaerCurrentCell()
{
    for (key in CurrentCell)
    {
        CurrentCell[key] = null
    }
}

function addNewCell(id)
{
    let NewCell = {
        name: null,
        isDestructible: null,
        canTpass: null,
        canBpass: null,
        imgURL: null,
        x: null,
        y: null
    };

    for (key in CurrentCell)
    {
        NewCell[key] = CurrentCell[key];
    }

    Obj_on_level[id] = NewCell;
}

function removeCell(id)
{
    Obj_on_level[id] = undefined;
}

function openMenu()
{
    cell_menu.style.visibility = "visible";
}

function closeMenu()
{
    cell_menu.style.visibility = "hidden";
}


function selectType(type)
{
    if (selectedType !== null)
    {
        document.getElementById(selectedType).classList.remove("is_active");
    }
    selectedType = type;
    
    document.getElementById(selectedType).classList.add("is_active");
}

function changeIcon(id)
{
    const cell = document.getElementById(id)
    
    switch (selectedType) {
        case 'None':
            cell.src = "../static/image/grey.png";
            break;
        case 'Brick':
            cell.src = "../static/image/brick.png";
            break;
        case 'Steel':
            cell.src = "../static/image/steel.png";
            break;
        case 'Forest':
            cell.src = "../static/image/forest.png";
            break;
        case 'Water':
            cell.src = "../static/image/water.png";
            break;
        case 'Base':
            cell.src = "../static/image/base1.png";
            break;
        case 'Tank':
            cell.src = "../static/image/tank_mini.png";
            break;
    }
}

function editcell(id)
{
    if (selectedType !== "None")
    {
        CurrentCell.name = selectedType;
        CurrentCell.x = id % level.side;
        CurrentCell.y = Math.floor(id/level.side);
    
        switch (selectedType) {
            case 'Brick':
                CurrentCell.isDestructible = 1;
                CurrentCell.canTpass = 0;
                CurrentCell.canBpass = 0;
                CurrentCell.imgURL = "../static/image/brick.png";
                break;
            case 'Steel':
                CurrentCell.isDestructible = 0;
                CurrentCell.canTpass = 0;
                CurrentCell.canBpass = 0;
                CurrentCell.imgURL = "../static/image/steel.png";
                break;
            case 'Forest':
                CurrentCell.isDestructible = 0;
                CurrentCell.canTpass = 1;
                CurrentCell.canBpass = 1;
                CurrentCell.imgURL = "../static/image/forest.png";
                break;
            case 'Water':
                CurrentCell.isDestructible = 0;
                CurrentCell.canTpass = 0;
                CurrentCell.canBpass = 1;
                CurrentCell.imgURL = "../static/image/water.png";
                break;
            case 'Base':
                CurrentCell.isDestructible = 1;
                CurrentCell.canTpass = 0;
                CurrentCell.canBpass = 0;
                CurrentCell.imgURL = "../static/image/base1.png";
                break;
            case 'Tank':
                CurrentCell.isDestructible = 0;
                CurrentCell.canTpass = 1;
                CurrentCell.canBpass = 1;
                CurrentCell.imgURL = "../static/image/tank_mini.png";
                break;
        }
        addNewCell(id);
    }
    else
    {
        removeCell(id);
    }

    console.log(Obj_on_level);
}

const XHRLevel = new XMLHttpRequest;

function sendLeveldata()
{
    audioButton.play();
    for(key in level)
    {
        if (level[key] === "")
        {
            dataError();
            return;
        } 
    }

    let leveldata = JSON.stringify(level);

    XHRLevel.open("POST", "/api/save_level");
    XHRLevel.send(leveldata);
}

XHRLevel.onload = function() {
    if(XHRLevel.status != 200)
    {
        dataError();
    }
    else
    {
        sendObjdata();
    }
}

function sendObjdata() 
{
    let is_success = true

    for (let i = 0; i < level.side ** 2; i++)
    {
        if (Obj_on_level[i] !== undefined)
        {
            const XHRObj = new XMLHttpRequest;
            XHRObj.open("POST", "/api/save_obj");
    
            objdata = JSON.stringify(Obj_on_level[i]);
    
            XHRObj.send(objdata);

            XHRObj.onreadystatechange = function() {
                if (XHRObj.readyState === XMLHttpRequest.DONE && XHRObj.status === 200)
                {
                    console.log(i, "- отправлен успешно");
                }
            }

            XHRObj.onerror = function() {
                console.error("Ошибка при: ", i)
                is_success = false;
            }
        }
    }

    if (is_success)
    {
        success();
    }
    else
    {
        dataError();
    }
}

function success()
{
    message.classList.add('success');
    message.textContent = "Success";
}

function dataError()
{
    message.classList.add('error');
    message.textContent = "Error";
}

function deletMap() {
    audioButton.play();
}

function exit() {
    audioButton.play();
    setTimeout(() => { window.location.href = "/main";}, 200);
}