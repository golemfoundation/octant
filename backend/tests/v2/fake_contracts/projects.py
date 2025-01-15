from tests.v2.fake_contracts.helpers import FakeProjectsContractDetails


class FakeProjectsContract:
    def __init__(self, projects_details_for_contract: FakeProjectsContractDetails):
        self.projects_details_for_contract = projects_details_for_contract

    async def get_project_addresses(self, epoch_number: int) -> list[str]:
        filtered_projects_details = list(
            filter(
                lambda project_details: project_details.epoch_number == epoch_number,
                self.projects_details_for_contract.projects_details,
            )
        )
        return list(
            map(
                lambda project_details: project_details.address,
                filtered_projects_details,
            )
        )

    async def get_project_cid(self) -> str:
        return self.projects_details_for_contract.projects_cid
