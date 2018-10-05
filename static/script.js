// Check localStorage for a username, if not set then prompt the user
if (!localStorage.username) {
    let username = prompt("Choose your display name: ", "User");
    localStorage.username = username;
} 

// Check localStorage for a selected channel, if not set it to -1
if (!localStorage.selectedChannel) {
    localStorage.selectedChannel = -1
}

document.addEventListener('DOMContentLoaded', () => {
    // Connect to web socket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // List of channel names
    var channels = [];

    // Update the DOM with the name
    updateDisplayName(localStorage.username); 

    // Add an event listener for the enter key
    textInput = document.getElementById('text') 
    text.addEventListener('keyup', (event) => {
        if (event.keyCode == 13) {
            const message = text.value;
            if (message != '' && localStorage.selectedChannel != -1) {
                sendMessage(message);
            }
        }
    });

    // Add event listeners for every channel
    document.querySelectorAll(".channel").forEach(channel => {
        channel.addEventListener('click', () => {
            getMessagesFromChannel(channel.getAttribute('data-id'));
        });
        // Add the name of the channel to the names list
        channels.push(channel.textContent);
    });

    // Add an event listener for the create channel button
    channelBtn = document.getElementById('create-channel')
    channelBtn.addEventListener('click', () => {
        let channel = ""
        channel = prompt("Channel name ?", "");
        if (channel != ""){
            if (channels.indexOf(channel) == -1) {
                socket.emit('create channel', {"name": channel});
            } else {
                alert("Channel already exists");
            }
        } else {
            alert("Must provide a channel name");
        }
    });
    
    // Get message from the channel the user was last seen in
    if (localStorage.selectedChannel != -1 && channels[localStorage.selectedChannel] != undefined) {
        getMessagesFromChannel(localStorage.selectedChannel);
    } else {
        localStorage.selectedChannel = -1;
    }

    // Update the DOM when a user sent a message
    socket.on('get message', data => {
        if (data["channel"] == localStorage.selectedChannel) {
            createMessage(data["message"]);
            updateScroll();
        }
    });

    // Update the DOM when a new channel is created
    socket.on('new channel', data => {
        channel = document.createElement('li');
        channel.textContent = data["name"]
        channel.classList.add("channel")
        channel.setAttribute("data-id", data["id"])
        channel.addEventListener('click', () => {
            getMessagesFromChannel(data["id"]);
        })
        document.getElementById('list-channels').appendChild(channel);
        // Add the name of the channel to the names list
        channels.push(data['name']);
    });
    
    // When the user opened a channel
    socket.on('opened channel', data => {
        clearMessages();
        data.forEach(message => {
            createMessage(message)
        });
    });

    // When the user opened a channel
    socket.on('no channel', () => {
        localStorage.selectedChannel = -1;
    });
    
    // Used to create the DOM element representing a message
    function createMessage (data) {
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
    };

    // Update the DOM with the display name of the user
    function updateDisplayName (name) {
        document.getElementById("display_name").textContent = name;
    };

    // Emit an event when a user sends a message
    function sendMessage (message) {
        socket.emit("send message", {"channel": localStorage.selectedChannel, 'message': message, 'username': localStorage.username, 'timestamp': Date.now()});
        text.value = "";
    };

    // Empty the DOM of its messages
    function clearMessages () {
        document.getElementById('messages').innerHTML = ""
    };

    // Used to get all the message from a selected channelId
    function getMessagesFromChannel (channelId) {
        if (localStorage.selectedChannel != -1) {
            document.querySelectorAll(".channel")[localStorage.selectedChannel].style = "white";
        }
        localStorage.selectedChannel = channelId;
        document.querySelectorAll(".channel")[channelId].style.color = "red";
        socket.emit('channel open', {"id": channelId});
    }; 

    // Updates the scrolling of the chat when there a too much messages
    function updateScroll(){
        var element = document.getElementById("messages");
        element.scrollTop = element.scrollHeight;
    };
});

