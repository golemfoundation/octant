import { assertAll, assertEq } from "./utils";

import { Context } from "../data/context";
import { VerificationResult } from "../runner";

export function compareUserBudgetsVsTheirAllocations(context: Context): VerificationResult {

  const sums = context.allocations.map((user_alloc) =>
    [
      user_alloc.user,
      user_alloc.donations.reduce((acc, donation) => acc + donation.amount, BigInt(0))
    ] as const
  )

  return assertAll(sums, ([user, sum]) =>
    sum <= (context.budgets.get(user) ?? BigInt(0))
  )

}

export function verifyBudgetsAreEqualToIndividualRewardsPlusHalfPpf(context: Context): VerificationResult {
  const budgets = Array.from(context.budgets.entries()).reduce((acc, [_user, budget]) => acc + budget, BigInt(0))
  const expectedBudgets = context.epochInfo.individualRewards + context.epochInfo.ppf / BigInt(2)
  return assertEq(budgets, expectedBudgets, BigInt(500), true)
}
