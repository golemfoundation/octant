import { assertAll, assertEq } from "./utils";

import { Context, allocationsByUser, individualDonationsByProposals, rewardsByProject } from "../data/context";
import { Address, Reward } from "../data/models";
import { VerificationResult } from "../runner";

const PROPOSALS_NO = 30

function getThreshold(individualAllocations: Map<Address, bigint>): bigint {
  const allocationsSum = Array.from(individualAllocations.entries()).reduce((acc, [_, val]) => acc + val, BigInt(0))
  return allocationsSum / BigInt(PROPOSALS_NO)
}

function getUserAllocationsForProjectsAboveThreshold(context: Context): Map<Address, bigint> {
  const individualDonations = individualDonationsByProposals(context)
  const threshold = getThreshold(individualDonations)
  const projectsAboveThreshold = Array.from(individualDonations.entries()).filter(([_, v]) => v > threshold)
  return new Map(projectsAboveThreshold)
}

export function verifyProjectsBelowThreshold(context: Context): VerificationResult {

  const individualDonations = individualDonationsByProposals(context)
  const threshold = getThreshold(individualDonations)

  const projectsBelowThreshold = Array.from(individualDonations.entries()).filter(([_, v]) => v <= threshold).map(([p, _]) => p)
  const rewards = rewardsByProject(context)

  return assertAll(projectsBelowThreshold, (project) => !rewards.has(project))
}

export function verifyUserDonationsVsRewards(context: Context): VerificationResult {
  const projectsAboveThreshold = Array.from(getUserAllocationsForProjectsAboveThreshold(context).entries())
  const rewards = rewardsByProject(context)

  return assertAll(projectsAboveThreshold, ([proposal, allocated]) => assertEq(allocated, rewards.get(proposal)!.allocated, BigInt(100), true))
}

export function verifyRewardsVsUserDonations(context: Context): VerificationResult {
  const projectsAboveThreshold = getUserAllocationsForProjectsAboveThreshold(context)
  const rewards = Array.from(rewardsByProject(context).entries())

  return assertAll(rewards, ([proposal, reward]: [Address, Reward]) => assertEq(reward.allocated, projectsAboveThreshold.get(proposal)!, BigInt(100), true))

}

export function verifyMatchedFunds(context: Context): VerificationResult {
  const projectsAboveThreshold = Array.from(getUserAllocationsForProjectsAboveThreshold(context).entries())
  const rewards = rewardsByProject(context)

  const totalAllocations = projectsAboveThreshold.reduce((acc, [_, v]) => acc + v, BigInt(0))
  const matchingFund = context.epochInfo.matchedRewards

  return assertAll(projectsAboveThreshold, ([proposal, allocated]) => {
    const matched = matchingFund * allocated / totalAllocations
    return assertEq(matched, rewards.get(proposal)!.matched, BigInt(100), true)
  })

}

export function verifyMatchingFundFromEpochInfo(context: Context): VerificationResult {
  const verifyMatchedRewards = [context.epochInfo.totalRewards - context.epochInfo.ppf - context.epochInfo.individualRewards + context.epochInfo.patronsRewards, context.epochInfo.matchedRewards]

  return assertAll([verifyMatchedRewards], ([value, expected]) => assertEq(value, expected))
}

export function verifyAllEpochRewards(context: Context): VerificationResult {
  const allBudgets = context.epochInfo.individualRewards + context.epochInfo.ppf - context.epochInfo.patronsRewards + context.epochInfo.matchedRewards + context.epochInfo.communityFund + context.epochInfo.operationalCost
  return assertEq(allBudgets, context.epochInfo.stakingProceeds, BigInt(100))
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
