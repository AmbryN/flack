// Get back the display name if it was already set, if not prompt the user
if (!localStorage.username) {
    let username = prompt("Choose your display name: ", "User");
    localStorage.username = username;
} 

document.addEventListener('DOMContentLoaded', () => {
    // Update the DOM with the name
    updateDisplayName(localStorage.username);  

    // Connect to web socket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Emit a connect event when a user joins the channel
    socket.on('connect', () => {
        socket.emit('connected', {'username': localStorage.username});
    });

    // Add an event listener for the enter key
    textInput = document.getElementById('text') 
    text.addEventListener('keyup', (event) => {
        if (event.keyCode == 13) {
            const message = text.value;
            if (message != '') {
                sendMessage(message);
            }
        }
    });

    // Update the DOM when a new user joined the chat
    socket.on('announce connection', data => {
        message = document.createElement('li');
        message.textContent = `${data.username} joined the chat`;
        message.style.fontStyle = "italic";
        message.style.listStyleType = "none";
        document.getElementById('messages').appendChild(message);
    })

    // Update the DOM when a user sent a message
    socket.on('get message', data => {
        message = document.createElement('li');
        datetime = new Date(data.timestamp);
        day = datetime.getDate();
        month = datetime.getMonth();
        year = datetime.getFullYear();
        hours = datetime.getHours();
        minutes = datetime.getMinutes();
        seconds = datetime.getSeconds();
        message.textContent = `${data.username} (${day}/${month}/${year} - ${hours}:${minutes}:${seconds}): ${data.message}`;
        document.getElementById('messages').appendChild(message);
        updateScroll()
    })

    // Update the DOM
    function updateDisplayName (name) {
        document.getElementById("display_name").textContent = name;
    }

    // Emit an event when a user sends a message
    function sendMessage (message) {
        socket.emit("send message", {'message': message, 'username': localStorage.username, 'timestamp': Date.now()});
        text.value = "";
    }

    // Updates the scrolling of the chat when there a too much messages
    function updateScroll(){
        var element = document.getElementById("messages");
        element.scrollTop = element.scrollHeight;
    }
});

