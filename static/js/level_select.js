function sendData(buttonId) {
    const requestOption = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(buttonId)//JSON.stringify(newData)
    };

    fetch('api/getlevelobj', requestOption)
        .then(Response => Response.json())
        .then(data => console.log(data))
        .catch(error => console.error(error));
};