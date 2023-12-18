def create_deposit_event(
    typename="Locked",
    deposit_before=0,
    amount=100000000000000000000,
    **kwargs,
):
    return {
        "__typename": typename,
        "depositBefore": deposit_before,
        "amount": amount,
        **kwargs,
    }
