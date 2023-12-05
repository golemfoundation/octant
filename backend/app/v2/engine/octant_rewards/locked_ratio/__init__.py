from dataclasses import dataclass


@dataclass
class LockedRatioPayload:
    total_effective_deposit: int = None
