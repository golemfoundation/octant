from app import database
from app.core.common import AccountFunds
from app.extensions import db
from app.core.allocations import Allocation


def test_get_all_by_epoch_group_by_user_address(app, user_accounts, proposal_accounts):
    epoch = 1
    user1 = database.user.add_user(user_accounts[0].address)
    user2 = database.user.add_user(user_accounts[1].address)
    db.session.commit()

    user1_allocations = [
        Allocation(proposal_accounts[0].address, 10 * 10**18),
        Allocation(proposal_accounts[0].address, 5 * 10**18),
        Allocation(proposal_accounts[2].address, 300 * 10**18),
    ]

    user2_allocations = [
        Allocation(proposal_accounts[1].address, 1050 * 10**18),
        Allocation(proposal_accounts[3].address, 500 * 10**18),
    ]

    database.allocations.add_all(epoch, user1.id, user1_allocations)
    database.allocations.add_all(epoch, user2.id, user2_allocations)
    db.session.commit()

    result = database.allocations.get_alloc_sum_by_epoch_and_user_address(epoch)

    assert len(result) == 2
    assert result[0].address == user2.address
    assert result[0].amount == 1550 * 10**18
    assert result[1].address == user1.address
    assert result[1].amount == 315 * 10**18
