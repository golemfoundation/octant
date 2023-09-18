from app import create_app, socketio
import eventlet

app = create_app()

if __name__ == "__main__":
    eventlet.wsgi.server(eventlet.listen(("0.0.0.0", 5000)), app)
