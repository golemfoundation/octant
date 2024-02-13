/* eslint-disable  max-classes-per-file */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export type Address = string;

export interface Deserializable<T> {
  from(input: any): T;
}


export interface UserBudget {
  budget: bigint;
  user: Address;
}

export interface UserDonation {
  amount: bigint;
  proposal: Address;
}

export interface Allocation {
  donations: UserDonation[];
  user: Address;
}

export interface Reward {
  allocated: bigint,
  matched: bigint,
  proposal: Address
}

export interface EpochInfo {
  // operationalCost: bigint
  // leftover: bigint
  individualRewards: bigint
  matchedRewards: bigint
  patronsRewards: bigint
  stakingProceeds: bigint
  totalEffectiveDeposit: bigint
  totalRewards: bigint
  totalWithdrawals: bigint
}
  
export class UserBudgetImpl implements Deserializable<UserBudget> {
  user: Address;

  budget: bigint;

  from(input: any) {
    this.user = input.user;
    this.budget = BigInt(input.budget)

    return this
  }
}


export class UserDonationImpl implements Deserializable<UserDonation> {
  proposal: Address;

  amount: bigint;

  from(input: any) {
    this.proposal = input.proposal;
    this.amount = BigInt(input.amount ?? 0)

    return this
  }
}

export class AllocationImpl implements Deserializable<Allocation> {
  user: Address;

  donations: UserDonation[]; 

  from(input: any) {
    this.user = input.donor
    this.donations = Object.entries(input)
    .filter(([k, _v]) => k !== "donor")
    .filter(([_k, v]) => v !== null)
    .map(([proposal, amount]) => new UserDonationImpl().from({amount, proposal}))

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
  stakingProceeds: bigint
  
  totalEffectiveDeposit: bigint
  
  totalRewards: bigint
  
  individualRewards: bigint
  
  totalWithdrawals: bigint
  
  patronsRewards: bigint
  
  matchedRewards: bigint
  

  from(input: any) {
    this.stakingProceeds = BigInt(input.staking_proceeds)   
    this.totalEffectiveDeposit = BigInt(input.total_effective_deposit)   
    this.totalRewards = BigInt(input.total_rewards)   
    this.individualRewards = BigInt(input.individual_rewards)   
    this.totalWithdrawals = BigInt(input.total_withdrawals)   
    this.patronsRewards = BigInt(input.patrons_budget)   
    this.matchedRewards = BigInt(input.matched_rewards)   

    return this
  }
}

