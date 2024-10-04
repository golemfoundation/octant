from dataclasses import dataclass
from datetime import datetime


@dataclass
class AntisybilStatusDTO:
    score: float
    expires_at: datetime
    is_on_timeout_list: bool
