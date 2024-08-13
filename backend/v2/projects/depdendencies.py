from web3 import AsyncWeb3
from .contracts import Projects, PROJECTS_ABI


# TODO: cache
def get_projects(w3: AsyncWeb3, projects_contract_address: str) -> Projects:

    # projects.init_web3(w3, app.config["PROJECTS_CONTRACT_ADDRESS"])
    return Projects(w3, PROJECTS_ABI, projects_contract_address)
