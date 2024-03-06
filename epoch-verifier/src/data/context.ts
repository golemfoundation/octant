import { Address, Allocation, EpochInfo, Reward, UserBudget, UserDonation } from "./models"

export interface Context {
  allocations: Allocation[]
  budgets: Map<Address, bigint> 
  epochInfo: EpochInfo
  rewards: Reward[]
}

export function buildContext(budgets: UserBudget[], allocations: Allocation[], rewards: Reward[], epochInfo: EpochInfo): Context{

  const filteredBudgets = budgets.filter((ub) => ub.budget !== BigInt(0))
  const filteredAllocs = allocations.filter(alloc => alloc.donations.length !== 0)

  const context = {
    allocations: filteredAllocs,
    budgets: new Map(filteredBudgets.map((value) => [value.user, value.budget] as const)),
    epochInfo,
    rewards
  } as Context 

  return context
}

export function allocationsByUser(context: Context): Map<Address, UserDonation[]>{
  return new Map(context.allocations.map((alloc) => [alloc.user, alloc.donations] as const))
}

export function individualDonationsByProposals(context: Context): Map<Address, bigint>{
  const individualDonations: Map<Address, bigint> = new Map()
  const donations: UserDonation[] = context.allocations.flatMap((alloc) => alloc.donations)

  for(const donation of donations){
    const prev = individualDonations.get(donation.proposal) ?? BigInt(0)
    individualDonations.set(donation.proposal, prev + donation.amount)
  }

  return individualDonations
}

export function rewardsByProject(context: Context): Map<Address, Reward> {
  return new Map(context.rewards.map((r) => [r.proposal, r] as const))
}