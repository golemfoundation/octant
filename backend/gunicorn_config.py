bind = "0.0.0.0:5000"
workers = 1
accesslog = "-"  # stdout
errorlog = "-"  # stderr
capture_output = True
loglevel = "info"
timeout = 0
worker_class = "geventwebsocket.gunicorn.workers.GeventWebSocketWorker"
