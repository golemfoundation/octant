import pytest

from app.extensions import db
from app.infrastructure import database
from app.modules.dto import (
    AllocationDTO,
    UserAllocationRequestPayload,
    UserAllocationPayload,
)
from app.modules.projects.rewards.service.saved import SavedProjectRewards
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_get_allocation_threshold(mock_users_db):
    context = get_context(3)
    user1, user2, _ = mock_users_db
    projects = context.projects_details.projects
    allocation = [
        AllocationDTO(projects[0], 100),
        AllocationDTO(projects[1], 200),
        AllocationDTO(projects[2], 300),
    ]
    payload = UserAllocationRequestPayload(
        payload=UserAllocationPayload(allocation, 0), signature="0xdeadbeef"
    )
    database.allocations.store_allocation_request(user1.address, 3, payload)
    database.allocations.store_allocation_request(user2.address, 3, payload)
    db.session.commit()

    service = SavedProjectRewards()
    result = service.get_allocation_threshold(context)

    assert result == 120
