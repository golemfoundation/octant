export const UserNames = ['Alice', 'Bob', 'Charlie'] as const;
export type UserName = (typeof UserNames)[number];

interface Step {
  forwardEpochs?: number;
  userAllocation?: { name: UserName; value: number };
}

interface Check {
  epoch: number;
  expectedTotal?: number;
  userExpect?: { name: UserName; value: number };
}

interface TestScenario {
  checks: Check[];
  desc: String;
  steps: Step[];
}

export const testScenarios: TestScenario[] = [
  {
    checks: [{ epoch: 2, userExpect: { name: 'Alice', value: 1000 } }],
    desc: 'check ED in a long period between deposit and withdrawal',
    steps: [
      { forwardEpochs: 10, userAllocation: { name: 'Alice', value: 1000 } },
      { userAllocation: { name: 'Alice', value: -1000 } },
    ],
  },
  {
    checks: [{ epoch: 5, userExpect: { name: 'Alice', value: 1000 } }],
    desc: 'Check ED in a very long period between deposit and withdrawal',
    steps: [
      { forwardEpochs: 100, userAllocation: { name: 'Alice', value: 1000 } },
      { userAllocation: { name: 'Alice', value: -1000 } },
    ],
  },
  {
    checks: [{ epoch: 2, userExpect: { name: 'Alice', value: 0 } }],
    desc: 'ED sits at zero after user removed all funds',
    steps: [
      { forwardEpochs: 1, userAllocation: { name: 'Alice', value: 1000 } },
      { forwardEpochs: 2, userAllocation: { name: 'Alice', value: -1000 } },
    ],
  },
  {
    checks: [{ epoch: 1, userExpect: { name: 'Alice', value: 0 } }],
    desc: 'Uninitialized deposit means that ED is at zero',
    steps: [],
  },
  {
    checks: [{ epoch: 1, userExpect: { name: 'Alice', value: 0 } }],
    desc: 'Before first deposit ED is at zero',
    steps: [{ forwardEpochs: 20 }, { userAllocation: { name: 'Alice', value: 1000 } }],
  },
  {
    checks: [
      { epoch: 2, userExpect: { name: 'Alice', value: 1000 } },
      { epoch: 4, userExpect: { name: 'Alice', value: 1100 } },
    ],
    desc: 'ED is at lowest value during the epoch; in fresh epoch ED is at deposit level',
    steps: [
      { forwardEpochs: 1, userAllocation: { name: 'Alice', value: 1000 } },
      { forwardEpochs: 3, userAllocation: { name: 'Alice', value: 100 } },
    ],
  },
  {
    checks: [{ epoch: 2, userExpect: { name: 'Alice', value: 1000 } }],
    desc: 'After a deposit, ED stays at deposit level even if no further events occur',
    steps: [{ forwardEpochs: 5, userAllocation: { name: 'Alice', value: 1000 } }],
  },
  {
    checks: [
      { epoch: 2, userExpect: { name: 'Alice', value: 1000 } },
      { epoch: 5, userExpect: { name: 'Alice', value: 1000 } },
      { epoch: 6, userExpect: { name: 'Alice', value: 700 } },
    ],
    desc: 'Multiple withdrawals reduce ED',
    steps: [
      { forwardEpochs: 5, userAllocation: { name: 'Alice', value: 1000 } },
      { userAllocation: { name: 'Alice', value: -100 } },
      { userAllocation: { name: 'Alice', value: -100 } },
      { userAllocation: { name: 'Alice', value: -100 } },
      { forwardEpochs: 5 },
    ],
  },
  {
    checks: [
      { epoch: 1, userExpect: { name: 'Alice', value: 0 } },
      { epoch: 3, userExpect: { name: 'Alice', value: 150 } },
      { epoch: 4, userExpect: { name: 'Alice', value: 0 } },
    ],
    desc: 'ED is at lowest value during the epoch, 100 GLM capped',
    steps: [
      { forwardEpochs: 1, userAllocation: { name: 'Alice', value: 50 } },
      { forwardEpochs: 2, userAllocation: { name: 'Alice', value: 100 } },
      { forwardEpochs: 2, userAllocation: { name: 'Alice', value: -99 } },
    ],
  },
  {
    checks: [{ epoch: 2, userExpect: { name: 'Alice', value: 200 } }],
    desc: 'ED is at lowest value during the epoch, no capping',
    steps: [
      { forwardEpochs: 1, userAllocation: { name: 'Alice', value: 1000 } },
      { userAllocation: { name: 'Alice', value: -500 } },
      { userAllocation: { name: 'Alice', value: -300 } },
    ],
  },
  {
    checks: [{ epoch: 2, expectedTotal: 2000 }],
    desc: 'TED takes multiple user EDs into account',
    steps: [
      { userAllocation: { name: 'Alice', value: 1000 } },
      { userAllocation: { name: 'Bob', value: 1000 } },
      { forwardEpochs: 1 },
    ],
  },
  {
    checks: [{ epoch: 2, expectedTotal: 2000 }],
    desc: 'TED cutoff: multiple sources with cutoff on individual source level',
    steps: [
      { userAllocation: { name: 'Alice', value: 1000 } },
      { userAllocation: { name: 'Bob', value: 1000 } },
      { userAllocation: { name: 'Charlie', value: 50 } },
      { forwardEpochs: 1 },
    ],
  },
  {
    checks: [
      { epoch: 2, userExpect: { name: 'Alice', value: 0 } },
      { epoch: 3, userExpect: { name: 'Alice', value: 120 } },
      { epoch: 5, userExpect: { name: 'Alice', value: 0 } },
    ],
    desc: 'ED: withdrawal does not affect past epochs',
    steps: [
      { forwardEpochs: 1, userAllocation: { name: 'Alice', value: 60 } },
      { forwardEpochs: 2, userAllocation: { name: 'Alice', value: 60 } },
      { forwardEpochs: 2, userAllocation: { name: 'Alice', value: -100 } },
    ],
  },
  {
    checks: [
      { epoch: 2, expectedTotal: 0 },
      { epoch: 3, expectedTotal: 120 },
      { epoch: 5, expectedTotal: 0 },
    ],
    desc: 'TED cutoff: cutoff boundary is crossed correctly',
    steps: [
      { forwardEpochs: 1, userAllocation: { name: 'Alice', value: 60 } },
      { forwardEpochs: 2, userAllocation: { name: 'Alice', value: 60 } },
      { forwardEpochs: 2, userAllocation: { name: 'Alice', value: -100 } },
    ],
  },
];
