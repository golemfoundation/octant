import { Runner, Verification } from "./runner";
import { budgetsAreEqualToIndividualRewards, compareUserBudgetsVsTheirAllocations } from "./verifications/budgets";
import { verifyMatchedFunds, verifyProjectsBelowThreshold, verifyTotalWithdrawals, verifyRewardsVsUserDonations, verifyUserDonationsVsRewards, verifyMatchingFundFromEpochInfo } from "./verifications/donations";

export function register_verifications(runner: Runner){

  const verifications: Verification[] = [
    {name: "User budgets vs allocations sums", verify: compareUserBudgetsVsTheirAllocations},
    {name: "User budgets vs all individual rewards", verify: budgetsAreEqualToIndividualRewards},
    {name: "Projects below threshold", verify: verifyProjectsBelowThreshold},
    {name: "Users allocated vs rewards allocated", verify: verifyUserDonationsVsRewards},
    {name: "Users rewards allocated vs allocated", verify: verifyRewardsVsUserDonations},
    {name: "Matched funds from allocations vs matched from rewards", verify: verifyMatchedFunds},
    {name: "Total withdrawals vs budgets, allocations, patrons and unclaimed", verify: verifyTotalWithdrawals},
    {name: "Total amounts from epoch info", verify: verifyMatchingFundFromEpochInfo},
  ]

  verifications.forEach((v) => runner.register(v))
}
