from typing import Optional
from app.contracts.proposals import proposals
from app.contracts.epochs import epochs


def get_number_of_proposals(epoch: Optional[int]) -> int:
    epoch = epochs.get_current_epoch() if epoch is None else epoch
    return len(proposals.get_proposal_addresses(epoch))
