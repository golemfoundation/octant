import json
from os import path

from flask import Flask

app = Flask(__name__)


@app.route("/alchemy/rpc", methods=['POST'])
def alchemy_rpc():
    with open(f"{path.dirname(__file__)}/ethGetBalance.json", 'r') as response:
        return json.load(response)


@app.route("/execution/block/<block_number>")
def get_beacon_block_info(block_number):
    with open(f"{path.dirname(__file__)}/blockInfo.json", 'r') as response:
        return json.load(response)


@app.route("/validator/<validator_ids>/balancehistory")
def get_balance_history(validator_ids):
    with open(f"{path.dirname(__file__)}/balanceHistory.json", 'r') as response:
        return json.load(response)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8888, debug=True)
