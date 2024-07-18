import { sqrt, assertAll, assertEq, multiplyFloatByBigInt, SCALE_FACTOR } from "./utils";

import { Context, allocationsByUser, individualDonationsSummedByProjects, individualDonationsAggregatedByProjectsWithUQs, rewardsByProject } from "../data/context";
import { Address, Reward } from "../data/models";
import { VerificationResult } from "../runner";

const PROPOSALS_NO = 30;


function _groupAllocationsByProjects(aggregatedDonations: Map<Address, UserDonation[]>): [Map<Address, bigint>, bigint] {
  const result = new Map<Address, bigint>();
  let totalPlainQF = BigInt(0);

  aggregatedDonations.forEach((values, project) => {
    const sumOfSqrt = values.reduce((sum, value) => sum + sqrt(multiplyFloatByBigInt(value.uq, value.amount)), BigInt(0));
    const resultValue = sumOfSqrt ** BigInt(2);

    totalPlainQF += resultValue;

    result.set(project, resultValue);
  });

  return [result, totalPlainQF];
}

function _calculateMatchingFund(groupedAllocations: Map<Address, bigint>, totalAllocated: bigint, totalMatchedFunding: bigint): Map<Address, bigint> {
  const result = new Map<Address, bigint>();
  groupedAllocations.forEach((value, address) => {
    const matched = (value * totalMatchedFunding * BigInt(SCALE_FACTOR)) / totalAllocated / SCALE_FACTOR;
    result.set(address, matched);
  });

  return result;
}

function _applyCappedDistribution(aggregatedMatchedFunding: Map<Address, bigint>, totalMatchedFunding: bigint): [Map<Address, bigint>, bigint] {
  const cappedMatchedFunding = (totalMatchedFunding * 20n) / 100n; // FUNDING_CAP_PERCENT = 0.2
  const cappedAggregatedMF = new Map<Address, bigint>();
  let leftover = BigInt(0);

  aggregatedMatchedFunding.forEach((value, address) => {
    if (value > cappedMatchedFunding) {
      cappedAggregatedMF.set(address, cappedMatchedFunding);
      leftover += value - cappedMatchedFunding;
    } else {
      cappedAggregatedMF.set(address, value);
    }
  });

  return [cappedAggregatedMF, leftover];
}

function _computeMatchingFundQFAndCapAndUQ(aggregatedDonations: Map<Address, UserDonation[]>, totalMatchedFunding: bigint): [Map<Address, bigint>, bigint] {
  const [groupedAllocations, totalPlainQF] = _groupAllocationsByProjects(aggregatedDonations);

  console.log("[INFO] Computed plainQF with donations:", groupedAllocations, ",", aggregatedDonations);

  const aggregatedMatchedFunding = _calculateMatchingFund(groupedAllocations, totalPlainQF, totalMatchedFunding);

  console.log("[INFO] Computed matchedFunding without cap:", aggregatedMatchedFunding);

  const [cappedAggregatedMF, leftover] = _applyCappedDistribution(aggregatedMatchedFunding, totalMatchedFunding);

  console.log("[INFO] Computed matchedFunding with a cap:", cappedAggregatedMF);

  return [cappedAggregatedMF, leftover];
}

function _getUserAllocationsForProjects(context: Context): Map<Address, bigint> {
  const individualDonations = individualDonationsSummedByProjects(context);
  return individualDonations;
}

export function verifyUserDonationsVsRewards(context: Context): VerificationResult {
  const projectsAllocations = Array.from(_getUserAllocationsForProjects(context).entries());
  const rewards = rewardsByProject(context);
  return assertAll(projectsAllocations, ([proposal, allocated]) =>  assertEq(allocated, rewards.get(proposal)!.allocated, BigInt(100), true));
  return assertEq(10, 10, BigInt(100), true);
}

export function verifyRewardsVsUserDonations(context: Context): VerificationResult {
  const projectsAllocations = _getUserAllocationsForProjects(context);
  const rewards = Array.from(rewardsByProject(context).entries());
  return assertAll(rewards, ([project, reward]: [Address, Reward]) =>  assertEq(reward.allocated, projectsAllocations.get(project)!, BigInt(100), true));
  return assertEq(10, 10, BigInt(100), true);

}

export function verifyMatchedFunds(context: Context): VerificationResult {
  const rewards = rewardsByProject(context)
  const totalMatchedFunding = context.epochInfo.matchedRewards;
  const aggregatedDonations = individualDonationsAggregatedByProjectsWithUQs(context)
  const [aggregatedCappedMatchedFunding, leftover] = _computeMatchingFundQFAndCapAndUQ(aggregatedDonations, totalMatchedFunding);

  return assertAll(aggregatedCappedMatchedFunding, ([project, matched]) => {
    return assertEq(matched, rewards.get(project)!.matched, BigInt(100), true)
  });
}

export function verifyMatchingFundFromEpochInfo(context: Context): VerificationResult {
  const verifyMatchedRewards = [context.epochInfo.totalRewards - context.epochInfo.ppf - context.epochInfo.individualRewards + context.epochInfo.patronsRewards, context.epochInfo.matchedRewards];

  return assertAll([verifyMatchedRewards], ([value, expected]) => assertEq(value, expected));
}

export function verifyAllEpochRewards(context: Context): VerificationResult {
  const allBudgets = context.epochInfo.individualRewards + context.epochInfo.ppf - context.epochInfo.patronsRewards + context.epochInfo.matchedRewards + context.epochInfo.communityFund + context.epochInfo.operationalCost;
  return assertEq(allBudgets, context.epochInfo.stakingProceeds, BigInt(100));
}

export function verifyTotalWithdrawals(context: Context): VerificationResult {
  const allocs = allocationsByUser(context)

  const claimed = Array.from(allocs.entries())
    .map(([user, donations]) => [user, donations.reduce((acc, donation) => acc + donation.amount, BigInt(0))] as const)
    .map(([user, donationsSum]) => context.budgets.get(user)! - donationsSum)
    .reduce((acc, user_claimed) => acc + user_claimed, BigInt(0))

  const rewards = context.rewards
    .filter((reward) => reward.matched !== BigInt(0))
    .reduce((acc, reward) => acc + reward.allocated + reward.matched, BigInt(0))

  return assertEq(claimed + rewards, context.epochInfo.totalWithdrawals)
}
