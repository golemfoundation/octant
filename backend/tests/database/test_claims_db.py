from app import db
from app.infrastructure import database


def test_get_claims_by_glm_withdrawn_and_nonce_get(app, user_accounts):
    user1 = database.claims.add_claim(user_accounts[0].address)
    user1.claimed = True
    user1.claim_nonce = 1

    user2 = database.claims.add_claim(user_accounts[1].address)
    user2.claimed = True
    user2.claim_nonce = 2

    database.claims.add_claim(user_accounts[2].address)

    db.session.commit()

    claims = database.claims.get_by_claimed_true_and_nonce_gte()
    assert len(claims) == 2
    assert claims[0].address == user1.address
    assert claims[1].address == user2.address

    claims = database.claims.get_by_claimed_true_and_nonce_gte(1)
    assert len(claims) == 2
    assert claims[0].address == user1.address
    assert claims[1].address == user2.address

    claims = database.claims.get_by_claimed_true_and_nonce_gte(2)
    assert len(claims) == 1
    assert claims[0].address == user2.address

    claims = database.claims.get_by_claimed_true_and_nonce_gte(3)
    assert len(claims) == 0
