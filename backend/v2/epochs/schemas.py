from pydantic import BaseModel


class CurrentEpochResponseV1(BaseModel):
    current_epoch: int


class IndexedEpochResponseV1(BaseModel):
    current_epoch: int
    indexed_epoch: int


class EpochStatsResponseV1(BaseModel):
    staking_proceeds: str
    total_effective_deposit: str
    total_rewards: str
    vanilla_individual_rewards: str
    operational_cost: str
    total_withdrawals: str | None
    patrons_rewards: str | None
    matched_rewards: str | None
    leftover: str | None
    ppf: str | None
    community_fund: str | None
    donated_to_projects: str | None


class EpochRewardsRateResponseV1(BaseModel):
    rewards_rate: float
