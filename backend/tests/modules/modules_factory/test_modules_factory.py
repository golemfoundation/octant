from app.modules.dto import SignatureOpType
from app.modules.history.service.full import FullHistory
from app.modules.modules_factory.current import CurrentServices
from app.modules.modules_factory.finalized import FinalizedServices
from app.modules.modules_factory.finalizing import FinalizingServices
from app.modules.modules_factory.future import FutureServices
from app.modules.modules_factory.pending import PendingServices
from app.modules.modules_factory.pre_pending import PrePendingServices
from app.modules.multisig_signatures.service.offchain import OffchainMultisigSignatures
from app.modules.octant_rewards.general.service.calculated import (
    CalculatedOctantRewards,
)
from app.modules.octant_rewards.general.service.finalized import FinalizedOctantRewards
from app.modules.octant_rewards.general.service.pending import PendingOctantRewards
from app.modules.octant_rewards.matched.pending import PendingOctantMatchedRewards
from app.modules.projects.rewards.service.estimated import EstimatedProjectRewards
from app.modules.projects.rewards.service.finalizing import FinalizingProjectRewards
from app.modules.projects.rewards.service.saved import SavedProjectRewards
from app.modules.snapshots.finalized.service.finalizing import FinalizingSnapshots
from app.modules.snapshots.finalized.service.simulated import (
    SimulatedFinalizedSnapshots,
)
from app.modules.snapshots.pending.service.pre_pending import PrePendingSnapshots
from app.modules.staking.proceeds.service.aggregated import AggregatedStakingProceeds
from app.modules.staking.proceeds.service.contract_balance import (
    ContractBalanceStakingProceeds,
)
from app.modules.staking.proceeds.service.estimated import EstimatedStakingProceeds
from app.modules.uq.service.preliminary import PreliminaryUQ
from app.modules.user.allocations.nonce.service.saved import SavedUserAllocationsNonce
from app.modules.user.allocations.service.pending import (
    PendingUserAllocations,
    PendingUserAllocationsVerifier,
)
from app.modules.user.allocations.service.saved import SavedUserAllocations
from app.modules.user.antisybil.service.passport import GitcoinPassportAntisybil
from app.modules.user.budgets.service.saved import SavedUserBudgets
from app.modules.user.deposits.service.calculated import CalculatedUserDeposits
from app.modules.user.deposits.service.contract_balance import (
    ContractBalanceUserDeposits,
)
from app.modules.user.deposits.service.saved import SavedUserDeposits
from app.modules.user.events_generator.service.db_and_graph import (
    DbAndGraphEventsGenerator,
)
from app.modules.user.patron_mode.service.events_based import EventsBasedUserPatronMode
from app.modules.user.rewards.service.calculated import CalculatedUserRewards
from app.modules.user.rewards.service.saved import SavedUserRewards
from app.modules.user.tos.service.initial import InitialUserTos, InitialUserTosVerifier
from app.modules.withdrawals.service.finalized import FinalizedWithdrawals
from app.modules.withdrawals.service.pending import PendingWithdrawals
from app.shared.blockchain_types import ChainTypes
from app.modules.user.budgets.service.upcoming import UpcomingUserBudgets
from app.modules.snapshots.pending.service.simulated import SimulatedPendingSnapshots
from tests.helpers.constants import UQ_THRESHOLD_MAINNET


def test_future_services_factory():
    result = FutureServices.create()

    assert result.octant_rewards_service == CalculatedOctantRewards(
        staking_proceeds=EstimatedStakingProceeds(),
        effective_deposits=ContractBalanceUserDeposits(),
    )


def test_current_services_factory():
    result = CurrentServices.create(ChainTypes.MAINNET)

    user_deposits = CalculatedUserDeposits(events_generator=DbAndGraphEventsGenerator())
    user_allocations = SavedUserAllocations()
    user_withdrawals = FinalizedWithdrawals()
    tos_verifier = InitialUserTosVerifier()
    user_tos = InitialUserTos(verifier=tos_verifier)
    patron_donations = EventsBasedUserPatronMode()
    octant_rewards = CalculatedOctantRewards(
        staking_proceeds=EstimatedStakingProceeds(),
        effective_deposits=user_deposits,
    )
    history = FullHistory(
        user_deposits=user_deposits,
        user_allocations=user_allocations,
        user_withdrawals=user_withdrawals,
        patron_donations=patron_donations,
    )
    multisig_signatures = OffchainMultisigSignatures(
        verifiers={SignatureOpType.TOS: tos_verifier}, is_mainnet=True
    )
    user_budgets = UpcomingUserBudgets(
        simulated_pending_snapshot_service=SimulatedPendingSnapshots(
            effective_deposits=user_deposits, octant_rewards=octant_rewards
        )
    )
    assert result.user_deposits_service == user_deposits
    assert result.octant_rewards_service == octant_rewards
    assert result.history_service == history
    assert result.user_tos_service == user_tos
    assert result.multisig_signatures_service == multisig_signatures
    assert result.user_budgets_service == user_budgets


def test_pre_pending_services_factory_when_mainnet():
    result = PrePendingServices.create(ChainTypes.MAINNET)

    user_deposits = CalculatedUserDeposits(events_generator=DbAndGraphEventsGenerator())
    octant_rewards = CalculatedOctantRewards(
        staking_proceeds=AggregatedStakingProceeds(),
        effective_deposits=user_deposits,
    )
    project_rewards_service = SavedProjectRewards()
    assert result.user_deposits_service == user_deposits
    assert result.octant_rewards_service == octant_rewards
    assert result.pending_snapshots_service == PrePendingSnapshots(
        effective_deposits=user_deposits, octant_rewards=octant_rewards
    )
    assert result.project_rewards_service == project_rewards_service


def test_pre_pending_services_factory_when_not_mainnet():
    result = PrePendingServices.create(ChainTypes.LOCAL)

    user_deposits = CalculatedUserDeposits(events_generator=DbAndGraphEventsGenerator())
    octant_rewards = CalculatedOctantRewards(
        staking_proceeds=ContractBalanceStakingProceeds(),
        effective_deposits=user_deposits,
    )
    project_rewards_service = SavedProjectRewards()

    assert result.user_deposits_service == user_deposits
    assert result.octant_rewards_service == octant_rewards
    assert result.pending_snapshots_service == PrePendingSnapshots(
        effective_deposits=user_deposits, octant_rewards=octant_rewards
    )
    assert result.project_rewards_service == project_rewards_service


def test_pending_services_factory():
    result = PendingServices.create(ChainTypes.MAINNET)

    events_based_patron_mode = EventsBasedUserPatronMode()
    saved_user_budgets = SavedUserBudgets()
    user_nonce = SavedUserAllocationsNonce()
    uniqueness_quotients = PreliminaryUQ(
        antisybil=GitcoinPassportAntisybil(),
        budgets=saved_user_budgets,
        uq_threshold=UQ_THRESHOLD_MAINNET,
    )
    allocations_verifier = PendingUserAllocationsVerifier(
        user_nonce=user_nonce,
        user_budgets=saved_user_budgets,
        patrons_mode=events_based_patron_mode,
    )
    octant_matched_rewards = PendingOctantMatchedRewards(
        patrons_mode=events_based_patron_mode
    )
    user_allocations = PendingUserAllocations(
        octant_rewards=octant_matched_rewards,
        verifier=allocations_verifier,
        uniqueness_quotients=uniqueness_quotients,
    )
    user_rewards = CalculatedUserRewards(
        user_budgets=saved_user_budgets,
        patrons_mode=events_based_patron_mode,
        allocations=user_allocations,
    )
    project_rewards = FinalizingProjectRewards()
    octant_rewards = PendingOctantRewards(
        patrons_mode=events_based_patron_mode,
        user_rewards=user_rewards,
        project_rewards=project_rewards,
        octant_matched_rewards=octant_matched_rewards,
    )

    finalized_snapshots_service = SimulatedFinalizedSnapshots(
        octant_rewards=octant_rewards,
        user_rewards=user_rewards,
        patrons_mode=events_based_patron_mode,
        project_rewards=project_rewards,
    )
    withdrawals_service = PendingWithdrawals(user_rewards=user_rewards)
    project_rewards = EstimatedProjectRewards(octant_rewards=octant_rewards)
    multisig_signatures = OffchainMultisigSignatures(
        verifiers={SignatureOpType.ALLOCATION: allocations_verifier}, is_mainnet=True
    )

    assert result.user_deposits_service == SavedUserDeposits()
    assert result.octant_rewards_service == octant_rewards
    assert result.user_allocations_service == user_allocations
    assert result.user_patron_mode_service == events_based_patron_mode
    assert result.user_rewards_service == user_rewards
    assert result.finalized_snapshots_service == finalized_snapshots_service
    assert result.withdrawals_service == withdrawals_service
    assert result.project_rewards_service == project_rewards
    assert result.multisig_signatures_service == multisig_signatures


def test_finalizing_services_factory():
    result = FinalizingServices.create()

    events_based_patron_mode = EventsBasedUserPatronMode()
    saved_user_allocations = SavedUserAllocations()
    user_rewards = CalculatedUserRewards(
        user_budgets=SavedUserBudgets(),
        patrons_mode=events_based_patron_mode,
        allocations=saved_user_allocations,
    )
    project_rewards = FinalizingProjectRewards()
    octant_matched_rewards = PendingOctantMatchedRewards(
        patrons_mode=events_based_patron_mode
    )
    octant_rewards = PendingOctantRewards(
        patrons_mode=events_based_patron_mode,
        project_rewards=project_rewards,
        user_rewards=user_rewards,
        octant_matched_rewards=octant_matched_rewards,
    )
    finalized_snapshots_service = FinalizingSnapshots(
        octant_rewards=octant_rewards,
        user_rewards=user_rewards,
        patrons_mode=events_based_patron_mode,
        project_rewards=project_rewards,
    )
    withdrawals_service = PendingWithdrawals(user_rewards=user_rewards)
    project_rewards_service = SavedProjectRewards()

    assert result.user_deposits_service == SavedUserDeposits()
    assert result.octant_rewards_service == octant_rewards
    assert result.user_allocations_service == saved_user_allocations
    assert result.user_patron_mode_service == events_based_patron_mode
    assert result.user_rewards_service == user_rewards
    assert result.finalized_snapshots_service == finalized_snapshots_service
    assert result.withdrawals_service == withdrawals_service
    assert result.project_rewards_service == project_rewards_service


def test_finalized_services_factory():
    result = FinalizedServices.create()

    events_based_patron_mode = EventsBasedUserPatronMode()
    saved_user_allocations = SavedUserAllocations()
    user_rewards = SavedUserRewards(
        user_budgets=SavedUserBudgets(),
        patrons_mode=events_based_patron_mode,
        allocations=saved_user_allocations,
    )
    withdrawals_service = FinalizedWithdrawals()
    project_rewards_service = SavedProjectRewards()

    assert result.user_deposits_service == SavedUserDeposits()
    assert result.octant_rewards_service == FinalizedOctantRewards()
    assert result.user_allocations_service == saved_user_allocations
    assert result.user_patron_mode_service == events_based_patron_mode
    assert result.user_rewards_service == user_rewards
    assert result.withdrawals_service == withdrawals_service
    assert result.project_rewards_service == project_rewards_service
