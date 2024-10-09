class ReasonsForRemoving:
    TRANSFER_NOT_COVERED_BY_LOCKS = "Locks do not cover received transfers."
    ORG_TRANSFERS_NOT_COVERED_BY_LOCKS = (
        "Locks do not cover accumulated transfers for an organization."
    )
    UNLOCKS_EXCEED_LOCKS = "A part of locked GLMs has been unlocked."
