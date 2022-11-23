FROM python:3.9.15-slim

COPY artifacts artifacts
RUN mkdir /app
ADD oracle/ /app
WORKDIR /app
RUN pip install -r requirements.txt
ENV PYTHONPATH "${PYTHONPATH}:/app/app.py"

ENTRYPOINT ["python3", "app.py"]
