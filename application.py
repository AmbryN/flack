import os
import datetime
import time

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = []
messages = []

@app.template_filter('format_date')
def _jinja2_filter_datetime(timestamp):
    format_date = datetime.datetime.fromtimestamp(timestamp / 1000)
    return format_date.strftime("%d/%m/%Y - %H:%M:%S")

@app.route("/")
def index():
    return render_template("index.html", messages=messages)

# When a user joins the chat
@socketio.on('connected')
def connection(data):
    username = data["username"]
    emit("announce connection", {'username': username}, broadcast=True)

# When a message is sent by a user
@socketio.on('send message')
def message(data):   
    message_data = {'message': data["message"], 'username': data["username"], "timestamp": data['timestamp']}
    messages.append(message_data)
    emit("get message", message_data, broadcast=True)

