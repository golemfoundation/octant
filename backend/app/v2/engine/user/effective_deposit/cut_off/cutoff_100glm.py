from app.v2.engine.user.effective_deposit.cut_off import CutOffPayload, CutOff

MIN_VALUE_CUT_OFF = 100 * 10**18


class CutOff100GLM(CutOff):
    def apply_cutoff(self, payload: CutOffPayload) -> int:
        return (
            payload.effective_amount
            if payload.effective_amount >= MIN_VALUE_CUT_OFF
            else 0
        )
