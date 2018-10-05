import os
import datetime
import time

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = []
id = 0

@app.template_filter('format_date')
def _jinja2_filter_datetime(timestamp):
    format_date = datetime.datetime.fromtimestamp(timestamp / 1000)
    return format_date.strftime("%d/%m/%Y - %H:%M:%S")

@app.route("/")
def index():
    return render_template("index.html", channels=channels)

# When a message is sent by a user
@socketio.on('send message')
def message(data):   
    message_data = {'message': data["message"], 'username': data["username"], "timestamp": data['timestamp']}
    channels[int(data['channel'])]["messages"].append(message_data)
    emit("get message", {"channel": int(data['channel']), "message": message_data}, broadcast=True)

# When a new channel is created
@socketio.on('create channel')
def create(data):
    global id
    channel = {"id": id, "name": data["name"], "messages": []}
    channels.append(channel)
    emit("new channel", channels[id], broadcast=True)
    id = id+1

# When a user selects a channel
@socketio.on('channel open')
def channel_open(data):
    emit("opened channel", channels[int(data["id"])]["messages"])
