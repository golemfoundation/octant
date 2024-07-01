from enum import auto, Enum

from app.exceptions import InvalidEpoch
from app.extensions import epochs
from app.infrastructure import database


class EpochState(Enum):
    FINALIZED = auto()
    FINALIZING = auto()
    PENDING = auto()
    PRE_PENDING = auto()
    CURRENT = auto()
    SIMULATED = auto()
    FUTURE = auto()

    def __gt__(self, other):
        if self.__class__ is other.__class__:
            return self.value > other.value
        return NotImplemented


def get_epoch_state(epoch_num: int) -> EpochState:
    validate_epoch_num(epoch_num)
    current_epoch_num = epochs.get_current_epoch()
    pending_epoch = epochs.get_pending_epoch()
    pending_snapshot = database.pending_epoch_snapshot.get_by_epoch(epoch_num)
    finalized_snapshot = database.finalized_epoch_snapshot.get_by_epoch(epoch_num)

    if epoch_num > current_epoch_num:
        return EpochState.FUTURE
    if epoch_num == current_epoch_num:
        return EpochState.CURRENT
    if epoch_num == pending_epoch:
        if pending_snapshot is None:
            return EpochState.PRE_PENDING
        else:
            return EpochState.PENDING
    if pending_snapshot is None:
        raise InvalidEpoch()
    if finalized_snapshot is None:
        return EpochState.FINALIZING
    else:
        return EpochState.FINALIZED


def get_epoch_number(epoch_state: EpochState) -> int:
    epoch_num = None
    if epoch_state == EpochState.FUTURE:
        epoch_num = epochs.get_current_epoch() + 1
    if epoch_state == EpochState.CURRENT:
        epoch_num = epochs.get_current_epoch()
    if epoch_state == EpochState.SIMULATED:
        epoch_num = epochs.get_current_epoch()
    if epoch_state == EpochState.PRE_PENDING or epoch_state == EpochState.PENDING:
        epoch_num = epochs.get_pending_epoch()
    if epoch_state == EpochState.FINALIZING or epoch_state == EpochState.FINALIZED:
        epoch_num = epochs.get_finalized_epoch()
    validate_epoch_num(epoch_num)
    validate_epoch_state(epoch_num, epoch_state)

    return epoch_num


def validate_epoch_num(epoch_num: int):
    if not epoch_num:
        raise InvalidEpoch()


def validate_epoch_state(epoch_num: int, epoch_state: EpochState):
    has_pending_snapshot = _has_pending_epoch_snapshot(epoch_num)
    has_finalized_snapshot = _has_finalized_epoch_snapshot(epoch_num)

    if epoch_state == EpochState.PRE_PENDING:
        if has_pending_snapshot:
            raise InvalidEpoch()

    if epoch_state == EpochState.PENDING:
        if not has_pending_snapshot:
            raise InvalidEpoch()

    if epoch_state == EpochState.FINALIZING:
        if has_finalized_snapshot or not has_pending_snapshot:
            raise InvalidEpoch()

    if epoch_state == EpochState.FINALIZED:
        if not (has_pending_snapshot and has_finalized_snapshot):
            raise InvalidEpoch()


def _has_pending_epoch_snapshot(epoch_num: int):
    return database.pending_epoch_snapshot.get_by_epoch(epoch_num) is not None


def _has_finalized_epoch_snapshot(epoch_num: int):
    return database.finalized_epoch_snapshot.get_by_epoch(epoch_num) is not None
