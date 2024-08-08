import {
  Address,
  Allocation,
  AllocationRecord,
  EpochInfo,
  Reward,
  UserBudget,
  UserDonation
} from "./models"

export interface Context {
  allocations: Allocation[]
  budgets: Map<Address, bigint>
  epochInfo: EpochInfo
  rewards: Reward[]
}

function transformToAllocations(allocationRecords: AllocationRecord[]): Allocation[] {
  const allocations: Map<Address, Allocation> = new Map()

  for (const record of allocationRecords) {
    const prev = allocations.get(record.user) ?? { donations: [], user: record.user }
    prev.donations.push({ amount: record.amount, proposal: record.proposal })
    allocations.set(record.user, prev)
  }

  return Array.from(allocations.values())
}

export function buildContext(userBudgets: UserBudget[], allocations: AllocationRecord[], rewards: Reward[], epochInfo: EpochInfo): Context {

  const positiveUserBudgets = userBudgets.filter(positiveUserBudget => positiveUserBudget.amount !== BigInt(0));

  return {
    allocations: transformToAllocations(allocations),
    budgets: new Map(positiveUserBudgets.map(value => [value.user, value.amount] as const)),
    epochInfo,
    rewards
  }
}

export function allocationsByUser(context: Context): Map<Address, UserDonation[]> {
  return new Map(context.allocations.map((alloc) => [alloc.user, alloc.donations] as const))
}

export function individualDonationsByProjects(context: Context): Map<Address, bigint> {
  const individualDonations: Map<Address, bigint> = new Map()
  const donations: UserDonation[] = context.allocations.flatMap((alloc) => alloc.donations)

  for (const donation of donations) {
    const prev = individualDonations.get(donation.proposal) ?? BigInt(0)
    individualDonations.set(donation.proposal, prev + donation.amount)
  }

  return individualDonations
}

export function rewardsByProject(context: Context): Map<Address, Reward> {
  return new Map(context.rewards
    .filter(r => r.matched !== BigInt(0))
    .map((r) => [r.proposal, r] as const)
  );
}
