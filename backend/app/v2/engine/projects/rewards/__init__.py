from dataclasses import dataclass
from typing import List, Tuple


@dataclass
class ProjectRewardsPayload:
    matched_rewards: int = None
    allocated_by_addr: List[Tuple[str, int]] = None
    threshold: int = None


