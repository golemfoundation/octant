import {
  Address,
  Allocation,
  AllocationRecord,
  EpochInfo,
  Reward,
  UserBudget,
  UserDonation,
  EpochUqs,
  SimulatedReward
} from "./models"

export interface Context {
  allocations: Allocation[];
  budgets: Map<Address, bigint>;
  epochInfo: EpochInfo;
  rewards: Reward[];
  uqs: Map<Address, Double>;
  isSimulated: boolean;
}

function transformToAllocations(allocationRecords: AllocationRecord[]): Allocation[] {
  const allocations: Map<Address, Allocation> = new Map()

  for (const record of allocationRecords) {
    const prev = allocations.get(record.user) ?? { donations: [], user: record.user }
    prev.donations.push({ amount: record.amount, project: record.project })
    allocations.set(record.user, prev)
  }

  return Array.from(allocations.values())
}

export function buildContext(userBudgets: UserBudget[], allocations: AllocationRecord[], rewards: Reward[], epochInfo: EpochInfo, epochUqs: EpochUqs[], isSimulated: boolean): Context {

  const positiveUserBudgets = userBudgets.filter(positiveUserBudget => positiveUserBudget.amount !== BigInt(0));

  return {
    allocations: transformToAllocations(allocations),
    budgets: new Map(positiveUserBudgets.map(value => [value.user, value.amount] as const)),
    epochInfo,
    rewards,
    epochUqs: new Map(epochUqs.map(value => [value.userAddress, value.uniquenessQuotient] as const)),
    isSimulated
  }
}

export function allocationsByUser(context: Context): Map<Address, UserDonation[]> {
  return new Map(context.allocations.map((alloc) => [alloc.user, alloc.donations] as const))
}

export function individualDonationsSummedByProjects(context: Context): Map<Address, bigint> {
  const individualDonations: Map<Address, bigint> = new Map()
  const donations: UserDonation[] = context.allocations.flatMap((alloc) => alloc.donations)
  for (const donation of donations) {
    const prev = individualDonations.get(donation.project) ?? BigInt(0)
    individualDonations.set(donation.project, prev + donation.amount)
  }

  return individualDonations
}

export function individualDonationsAggregatedByProjectsWithUQs(context: Context): Map<Address, UserDonation[]> {
  const individualDonations: Map<Address, UserDonation[]> = new Map()
  const uqs = context.epochUqs;

  const donationsWithUsers = context.allocations.flatMap((alloc) => alloc.donations.map((donation) => ({
    ...donation,
    user: alloc.user,
  }))
  );

  for (const donation of donationsWithUsers) {
    const prev = individualDonations.get(donation.project) ?? [];
    individualDonations.set(donation.project, [
      ...prev,
      {
        amount: donation.amount,
        project: donation.project,
        uq: uqs.get(donation.user) ?? null,
      },
    ]);
  }
  return individualDonations;
}

function _getSimulatedRewardsByProject(rewards: SimulatedReward[]): Map<Address, SimulatedReward> {
  return new Map(rewards
    .filter(r => r.matched !== BigInt(0))
    .map((r) => [r.address, r] as const)
  );
}

function _getRewardsByProject(rewards: Reward[]): Map<Address, Reward> {
  return new Map(rewards
    .filter(r => r.matched !== BigInt(0))
    .map((r) => [r.project, r] as const)
  );
}

export function rewardsByProject(context: Context): Map<Address, IReward> {
  if (context.isSimulated) {
    return _getSimulatedRewardsByProject(context.rewards.projectsRewards);
  }
  return _getRewardsByProject(context.rewards);
}
