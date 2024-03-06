def create_epoch_event(
    start=1000, end=2000, duration=1000, decision_window=500, **kwargs
):
    return {
        "fromTs": start,
        "toTs": end,
        "duration": duration,
        "decisionWindow": decision_window,
        **kwargs,
    }


EPOCH_EVENTS = {
    1: create_epoch_event(
        start=1000,
        end=2000,
        epoch=1,
    ),
    2: create_epoch_event(
        start=2000,
        end=3000,
        epoch=2,
    ),
    3: create_epoch_event(
        start=3000,
        end=4000,
        epoch=3,
    ),
}
