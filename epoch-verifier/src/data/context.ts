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

export function buildContext(budgets: UserBudget[], allocations: AllocationRecord[], rewards: Reward[], epochInfo: EpochInfo): Context {

  const filteredBudgets = budgets.filter((ub) => ub.amount !== BigInt(0))

  const context = {
    allocations: transformToAllocations(allocations),
    budgets: new Map(filteredBudgets.map((value) => [value.user, value.amount] as const)),
    epochInfo,
    rewards
  } as Context

  return context
}

export function allocationsByUser(context: Context): Map<Address, UserDonation[]> {
  return new Map(context.allocations.map((alloc) => [alloc.user, alloc.donations] as const))
}

export function individualDonationsByProposals(context: Context): Map<Address, bigint> {
  const individualDonations: Map<Address, bigint> = new Map()
  const donations: UserDonation[] = context.allocations.flatMap((alloc) => alloc.donations)

  for (const donation of donations) {
    const prev = individualDonations.get(donation.proposal) ?? BigInt(0)
    individualDonations.set(donation.proposal, prev + donation.amount)
  }

  return individualDonations
}

export function rewardsByProject(context: Context): Map<Address, Reward> {
  return new Map(context.rewards.map((r) => [r.proposal, r] as const))
}

function transformToAllocations(allocationRecords: AllocationRecord[]): Allocation[] {
  const allocations: Map<Address, Allocation> = new Map()

  for (const record of allocationRecords) {
    const prev = allocations.get(record.user) ?? { user: record.user, donations: [] }
    prev.donations.push({ amount: record.amount, proposal: record.proposal })
    allocations.set(record.user, prev)
  }

  return Array.from(allocations.values())
}
