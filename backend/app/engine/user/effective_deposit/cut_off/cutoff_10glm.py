from app.engine.user.effective_deposit.cut_off import CutOffPayload, CutOff

WEIGHTED_AVERAGE_CUT_OFF = 10 * 10**18
WEIGHTED_AVERAGE_MIN_LOCKED_VALUE = 100 * 10**18


class CutOff10GLM(CutOff):
    def apply_cutoff(self, payload: CutOffPayload) -> int:
        if payload.locked_amount < WEIGHTED_AVERAGE_MIN_LOCKED_VALUE:
            return 0

        return (
            payload.effective_amount
            if payload.effective_amount >= WEIGHTED_AVERAGE_CUT_OFF
            else 0
        )
