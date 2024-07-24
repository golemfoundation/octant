/* eslint-disable  max-classes-per-file */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export type Address = string;

export interface Deserializable<T> {
  from(input: any): T;
}

export interface ApiRewardsBudgets {
  budgets: {
    address: string;
    amount: string; // wei;
  }[];
}

export interface ApiAllocations {
  allocations: {
    amount: string; // wei
    donor: string;
    proposal: string;
  }[];
}

export interface ApiRewards {
  rewards: {
    address: string;
    value: string; // wei;
  }[];
}


export interface UserBudget {
  amount: bigint;
  user: Address;
}

export interface UserDonation {
  amount: bigint;
  proposal: Address;
}

export interface AllocationRecord {
  amount: bigint;
  proposal: Address;
  user: Address;
}

export interface Allocation {
  donations: UserDonation[];
  user: Address;
}

export interface Reward {
  allocated: bigint;
  matched: bigint;
  proposal: Address;
}

export interface EpochInfo {
  communityFund: bigint;
  individualRewards: bigint;
  leftover: bigint;
  matchedRewards: bigint;
  operationalCost: bigint;
  patronsRewards: bigint;
  ppf: bigint;
  stakingProceeds: bigint;
  totalEffectiveDeposit: bigint;
  totalRewards: bigint;
  totalWithdrawals: bigint;
}

export class UserBudgetImpl implements Deserializable<UserBudget> {
  user: Address;

  amount: bigint;

  from(input: any) {
    this.user = input.address;
    this.amount = BigInt(input.amount)

    return this
  }
}

export class AllocationImpl implements Deserializable<AllocationRecord> {
  user: Address;

  proposal: Address;

  amount: bigint;

  from(input: any) {
    this.user = input.donor
    this.proposal = input.proposal;
    this.amount = BigInt(input.amount ?? 0)

    return this
  }
}

export class RewardImpl implements Deserializable<Reward> {
  allocated: bigint;

  matched: bigint;

  proposal: Address;

  from(input: any) {
    this.proposal = input.address
    this.allocated = BigInt(input.allocated)
    this.matched = BigInt(input.matched)

    return this
  }
}

export class EpochInfoImpl implements Deserializable<EpochInfo> {
  individualRewards: bigint;

  matchedRewards: bigint;

  patronsRewards: bigint;

  stakingProceeds: bigint;

  totalEffectiveDeposit: bigint;

  totalRewards: bigint;

  totalWithdrawals: bigint;

  operationalCost: bigint;

  leftover: bigint;

  ppf: bigint;

  communityFund: bigint;


  from(input: any) {
    this.individualRewards = BigInt(input.vanillaIndividualRewards)
    this.matchedRewards = BigInt(input.matchedRewards)
    this.patronsRewards = BigInt(input.patronsRewards)
    this.stakingProceeds = BigInt(input.stakingProceeds)
    this.totalEffectiveDeposit = BigInt(input.totalEffectiveDeposit)
    this.totalRewards = BigInt(input.totalRewards)
    this.totalWithdrawals = BigInt(input.totalWithdrawals)
    this.operationalCost = BigInt(input.operationalCost)
    this.leftover = BigInt(input.leftover)
    this.ppf = BigInt(input.ppf)
    this.communityFund = BigInt(input.communityFund)

    return this
  }
}

