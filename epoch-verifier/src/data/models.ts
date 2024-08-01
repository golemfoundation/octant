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
    project: string;
  }[];
}

export interface ApiRewards {
  rewards: {
    address: string;
    value: string; // wei;
  }[];
}

export interface ApiEpochUqs {
  uqsInfo: {
    userAddress: string;
    uniquenessQuotient: string;
  }[];
}


export interface UserBudget {
  amount: bigint;
  user: Address;
}

export interface UserDonation {
  amount: bigint;
  project: Address;
  uq: number | null;
}

export interface AllocationRecord {
  amount: bigint;
  project: Address;
  user: Address;
}

export interface Allocation {
  donations: UserDonation[];
  user: Address;
}

interface IReward {
  matched: bigint;
}

export interface Reward extends IReward {
  allocated: bigint;
  project: Address;
}

export interface SimulatedReward extends IReward {
  amount: bigint; // allocated + matched
  address: Address;
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

export interface EpochUqs {
  userAddress: string;
  uniquenessQuotient: number;
}

export interface FinalizedSimulation {
  patronsRewards: bigint;
  matchedRewards: bigint;
  projectRewards: SimulatedReward[];
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

  project: Address;

  amount: bigint;

  from(input: any) {
    this.user = input.donor
    this.project = input.project;
    this.amount = BigInt(input.amount ?? 0)

    return this
  }
}

export class RewardImpl implements Deserializable<Reward> {
  allocated: bigint;

  matched: bigint;

  project: Address;

  from(input: any) {
    this.project = input.address
    this.allocated = BigInt(input.allocated)
    this.matched = BigInt(input.matched)

    return this
  }
}

export class SimulatedRewardImpl implements Deserializable<SimulatedReward> {
  amount: bigint;
  matched: bigint;
  address: Address;

  from(input: any) {
    this.address = input.address;
    this.amount = BigInt(input.amount);
    this.matched = BigInt(input.matched);

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
    this.totalWithdrawals = input.totalWithdrawals !== null ? BigInt(input.totalWithdrawals) : BigInt(0)
    this.operationalCost = BigInt(input.operationalCost)
    this.leftover = BigInt(input.leftover)
    this.ppf = BigInt(input.ppf)
    this.communityFund = BigInt(input.communityFund)

    return this
  }
}

export class EpochUqsImpl implements Deserializable<EpochUqs>{
  userAddress: string;
  uniquenessQuotient: number;

  from(input: any) {
    this.userAddress = input.userAddress;
    this.uniquenessQuotient = parseFloat(input.uniquenessQuotient);
    return this;
  }
}

export class FinalizedSimulationImpl implements Deserializable<FinalizedSimulation>{
  patronsRewards: bigint;
  matchedRewards: bigint;
  projectsRewards: SimulatedReward[];

  from(input: FinalizedSimulation) {
    this.patronsRewards = BigInt(input.patronsRewards);
    this.matchedRewards = BigInt(input.matchedRewards);
    this.projectsRewards = input.projectsRewards.map((reward: SimulatedReward) => {
      const simulatedReward = new SimulatedRewardImpl();
      return simulatedReward.from(reward);
    });

    return this;
  }
}

