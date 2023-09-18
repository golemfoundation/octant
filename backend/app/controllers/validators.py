from dataclasses import dataclass
from app.infrastructure.external_api.beacon_chain.validator import (
    get_validators_by_address,
    get_detailed_validators_by_indices,
)


@dataclass(frozen=True)
class ValidatorsInfo:
    validators_amount: int
    indices: str


def get_validators_info_by_address(validator_address: str) -> ValidatorsInfo:
    validators: list = get_validators_by_address(validator_address)
    indices: list = [validator["validatorindex"] for validator in validators]
    return ValidatorsInfo(len(validators), ",".join(map(str, indices)))


def get_active_validators_effective_balance(indices: str) -> int:
    detailed_validators: list = get_detailed_validators_by_indices(indices)
    effective_balance_sum: int = 0
    for detailed_validator in detailed_validators:
        if detailed_validator["status"] == "active_online":
            effective_balance_sum += detailed_validator["effectivebalance"]
    return effective_balance_sum
