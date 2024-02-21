class SmartContract:
    def __init__(self, w3=None, contact=None, abi=None):
        self.abi = abi
        self.w3 = w3
        self.contract = contact

    def init_web3(self, w3, address: str):
        self.w3 = w3
        self.contract = w3.eth.contract(address=address, abi=self.abi)
