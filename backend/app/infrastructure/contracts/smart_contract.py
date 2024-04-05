class SmartContract:
    def __init__(self, w3=None, contract=None, abi=None):
        self.abi = abi
        self.w3 = w3
        self.contract = contract

    def init_web3(self, w3, address: str):
        self.w3 = w3
        self.contract = w3.eth.contract(address=address, abi=self.abi)
