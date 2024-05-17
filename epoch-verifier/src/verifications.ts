import { Runner, Verification } from "./runner";
import { verifyBudgetsAreEqualToIndividualRewardsPlusHalfPpf, compareUserBudgetsVsTheirAllocations } from "./verifications/budgets";
import {
  verifyMatchedFunds,
  verifyProjectsBelowThreshold,
  verifyTotalWithdrawals,
  verifyRewardsVsUserDonations,
  verifyUserDonationsVsRewards,
  verifyMatchingFundFromEpochInfo,
  verifyAllEpochRewards
} from "./verifications/donations";

export function registerVerifications(runner: Runner): void {

  const verifications: Verification[] = [
    {name: "User budgets vs allocations sums", verify: compareUserBudgetsVsTheirAllocations},
    {name: "User budgets vs half PPF", verify: verifyBudgetsAreEqualToIndividualRewardsPlusHalfPpf},
    {name: "Projects below threshold", verify: verifyProjectsBelowThreshold},
    {name: "Users allocated vs rewards allocated", verify: verifyUserDonationsVsRewards},
    {name: "Users rewards allocated vs allocated", verify: verifyRewardsVsUserDonations},
    {name: "Matched funds from allocations vs matched from rewards", verify: verifyMatchedFunds},
    {name: "Total withdrawals vs budgets, allocations, patrons and unclaimed", verify: verifyTotalWithdrawals},
    {name: "Matched funds from epoch info", verify: verifyMatchingFundFromEpochInfo},
    {name: "Total amounts from epoch info", verify: verifyAllEpochRewards},
  ]

  verifications.forEach((v) => runner.register(v))
}
