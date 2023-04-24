from app import socketio


@socketio.on('connect')
def handle_connect():
    print('Client connected')


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


@socketio.on('custom_event')
def handle_custom_event(data):
    print('Received custom event:', data)
    socketio.emit('custom_event_response', {'message': 'Server received the custom event'})
