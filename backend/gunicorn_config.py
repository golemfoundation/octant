bind = "0.0.0.0:5000"
# Due to the limited load balancing algorithm used by gunicorn, it is not
# possible to use more than one worker process when using this web server.
# Thanks, gunicorn
workers = 1
accesslog = None
errorlog = "-"  # stderr
capture_output = True
loglevel = "info"
timeout = 0
worker_class = "gthread"
threads = 64
