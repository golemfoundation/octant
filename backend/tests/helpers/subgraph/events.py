from datetime import datetime


def generate_epoch_events(
    start=None, duration=1000, decision_window=500, first_epoch=1, epoches=5, **kwargs
):
    epoch_start = start if start is not None else datetime.utcnow()

    events = []

    for epoch_no in range(first_epoch, first_epoch + epoches):
        epoch_end = start + duration
        event = create_epoch_event(
            start=epoch_start,
            end=epoch_end,
            duration=duration,
            decision_window=decision_window,
            epoch=epoch_no,
            **kwargs
        )
        events.append(event)
        epoch_start = epoch_end

    return events


def create_epoch_event( 
    start=1000, end=2000, duration=1000, decision_window=500, epoch=1, **kwargs
):

    str_keys = ["decisionWindow", "duration", "fromTs", "toTs"]
    int_keys = ["epoch"]

    event =  {
        "epoch": epoch,
        "fromTs": start,
        "toTs": end,
        "duration": duration,
        "decisionWindow": decision_window,
        **kwargs,
    }

    return _convert_values(event, str_keys, int_keys)


def _convert_values(event_dict, str_keys, int_keys =  None):
    inf_keys = int_keys if int_keys is not None else []  

    event = [ (k, str(v)) for k, v in event_dict.items() if k in str_keys ]
    event += [ (k, int(v)) for k, v in event_dict.items() if k in int_keys ]

    return dict(event)
    
