# Hexagon Oracle Watcher


## Setup

### Compile and copy contracts artifacts from project directory
```bash
yarn && yarn compile
```

### Install dependencies
```bash
python3 -m venv venv
. ./venv/bin/activate
pip3 install -r requirements.txt
```

## Test
```bash
pytest --ignore=test_integration.py
python3 test_integration.py
```

## Run - local

### Run hardhat node
```bash
cd ..
yarn start-node
```

### Run api mock server
```bash
python3 api_mock/mock.py
```

### Start oracle watcher
```bash
python3 app.py
```

## Run - docker
```bash
cd ..
docker build -t oracle -f oracle/Dockerfile .
docker run oracle
```
