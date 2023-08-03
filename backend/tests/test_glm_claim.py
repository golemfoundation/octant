import pytest

from app import database, db, exceptions
from app.controllers.glm_claim import claim, check


def test_users_can_check_eligibility(app, user_accounts):
    account1 = user_accounts[0]

    with pytest.raises(exceptions.NotEligibleToClaimGLM):
        check(account1.address)

    database.claims.add_claim(account1.address)
    db.session.commit()

    assert check(account1.address)

    account1_signature = "0xe15f64350e7cda9145144f7540775cf875cf19c323ccb17b79846eb6d6da98aa47299965cdfc16a81a378ef7bfd89752104188a2cbadb62ff447424be617854c1b"
    claim(account1_signature)

    with pytest.raises(exceptions.GlmClaimed):
        check(account1.address)


@pytest.mark.skip(reason="https://linear.app/golemfoundation/issue/OCT-612/use-testconfig-in-tests")
def test_users_can_claim_glms(app, user_accounts):
    account1 = user_accounts[0]
    account2 = user_accounts[1]
    database.claims.add_claim(account1.address)
    database.claims.add_claim(account2.address)
    db.session.commit()
    account1_signature = "0xe15f64350e7cda9145144f7540775cf875cf19c323ccb17b79846eb6d6da98aa47299965cdfc16a81a378ef7bfd89752104188a2cbadb62ff447424be617854c1b"
    account2_signature = "0xbc0da5deb63cc8c1c4eb62a3fd48d84cc967955f01caa8e90f8a4bb5ea787ab2539001f4f9067a38974e55c6995bbd7522614d4171bac8e0e07566f1976a3c3e1b"

    claim(account1_signature)
    claim(account2_signature)

    user1_after_claim = database.claims.get_by_address(account1.address)
    assert user1_after_claim.claim_nonce == 9
    assert user1_after_claim.claimed is True

    user2_after_claim = database.claims.get_by_address(account2.address)
    assert user2_after_claim.claim_nonce == 10
    assert user2_after_claim.claimed is True


@pytest.mark.skip(reason="https://linear.app/golemfoundation/issue/OCT-612/use-testconfig-in-tests")
def test_user_cannot_claim_twice(app, user_accounts):
    account1 = user_accounts[0]
    database.claims.add_claim(account1.address)
    db.session.commit()
    account1_signature = "0xe15f64350e7cda9145144f7540775cf875cf19c323ccb17b79846eb6d6da98aa47299965cdfc16a81a378ef7bfd89752104188a2cbadb62ff447424be617854c1b"

    claim(account1_signature)

    # Call claim second time, expect GlmWithdrawn exception
    with pytest.raises(exceptions.GlmClaimed):
        claim(account1_signature)

    user1_after_claim = database.claims.get_by_address(account1.address)
    assert user1_after_claim.claim_nonce == 9
    assert user1_after_claim.claimed is True


def test_not_eligible_user_cannot_claim(app, user_accounts):
    account1_signature = "0xe15f64350e7cda9145144f7540775cf875cf19c323ccb17b79846eb6d6da98aa47299965cdfc16a81a378ef7bfd89752104188a2cbadb62ff447424be617854c1b"

    # User is not present in db, expect NotEligibleToClaimGLM exception
    with pytest.raises(exceptions.NotEligibleToClaimGLM):
        claim(account1_signature)
