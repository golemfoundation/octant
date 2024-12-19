from dataclasses import dataclass

from dataclasses_json import dataclass_json, LetterCase


@dataclass_json(letter_case=LetterCase.CAMEL)
@dataclass
class FakeEpochEventDetails:
    epoch: int = 1
    from_ts: int = 1000
    to_ts: int = 2000
    duration: int = 1000
    decision_window: int = 500
