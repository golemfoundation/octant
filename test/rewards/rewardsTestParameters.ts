export interface TestScenario {
  aliceAllocation: string;
  aliceDeposit: string;
  aliceIR: string;
  bobAllocation: string;
  bobDeposit: string;
  bobIR: string;
  charlieAllocation: string;
  charlieDeposit: string;
  charlieIR: string;
  gfRewards: string;
  individualRewards: string;
  matchedRewards: string;
  proposal1rewards: string;
  proposal2rewards: string;
  proposal3rewards: string;
  totalDeposit: string;
  totalRewards: string;
}

export const testScenarios: TestScenario[] = [
  {
    aliceAllocation: '0.00301',
    aliceDeposit: '8600',
    aliceIR: '0.00346',
    bobAllocation: '0.00342',
    bobDeposit: '10000',
    bobIR: '0.00402',
    charlieAllocation: '0.00546',
    charlieDeposit: '33900',
    charlieIR: '0.01364',
    gfRewards: '0',
    individualRewards: '0.02112',
    matchedRewards: '2.89461',
    proposal1rewards: '0.73579',
    proposal2rewards: '0.83601',
    proposal3rewards: '1.33469',
    totalDeposit: '52500',
    totalRewards: '2.91573',
  },
  {
    aliceAllocation: '0.95597',
    aliceDeposit: '15837386',
    aliceIR: '6.37312',
    bobAllocation: '0.12243',
    bobDeposit: '1448732',
    bobIR: '0.58299',
    charlieAllocation: '1.01376',
    charlieDeposit: '6298070',
    charlieIR: '2.53441',
    gfRewards: '0',
    individualRewards: '9.49051',
    matchedRewards: '52.30817',
    proposal1rewards: '24.85712',
    proposal2rewards: '3.18342',
    proposal3rewards: '26.35978',
    totalDeposit: '23584188',
    totalRewards: '61.79868',
  },
  {
    aliceAllocation: '5.07643',
    aliceDeposit: '38227386',
    aliceIR: '15.38308',
    bobAllocation: '163.55144',
    bobDeposit: '478151623',
    bobIR: '192.41299',
    charlieAllocation: '11.77886',
    charlieDeposit: '37051562',
    charlieIR: '14.90991',
    gfRewards: '5.07643',
    individualRewards: '222.70599',
    matchedRewards: '76.65853',
    proposal1rewards: '0',
    proposal2rewards: '235.05997',
    proposal3rewards: '16.92885',
    totalDeposit: '553430571',
    totalRewards: '299.36452',
  },
];
