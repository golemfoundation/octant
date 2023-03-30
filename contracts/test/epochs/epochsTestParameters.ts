interface ChangeProps {
  changeNextEpochProps: { decisionWindow: number; epochDuration: number };
}

interface Check {
  expectedCurrentEpochEnd: number;
  expectedDecisionWindowOpen: boolean;
  expectedEpoch: number;
  timestamp: number;
}

type Step = ChangeProps | Check;

interface TestScenario {
  desc: String;
  steps: Step[];
}

export function isChangePropsStep(step: Step): step is ChangeProps {
  return 'changeNextEpochProps' in step;
}

export const testScenarios: TestScenario[] = [
  {
    desc: 'epochDuration and decisionWindow increased in first epoch: Epoch changes in ts: 5000, 25000, 45000, Decision window closes in: 2000, 10000, 30000',
    steps: [
      { changeNextEpochProps: { decisionWindow: 5000, epochDuration: 20000 } },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 1900,
      },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 2100,
      },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 4900,
      },
      {
        expectedCurrentEpochEnd: 25000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 2,
        timestamp: 5100,
      },
      {
        expectedCurrentEpochEnd: 25000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 2,
        timestamp: 7100,
      },
      {
        expectedCurrentEpochEnd: 25000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 2,
        timestamp: 9900,
      },
      {
        expectedCurrentEpochEnd: 25000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 2,
        timestamp: 10100,
      },
      {
        expectedCurrentEpochEnd: 25000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 2,
        timestamp: 24900,
      },
      {
        expectedCurrentEpochEnd: 45000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 3,
        timestamp: 25100,
      },
      {
        expectedCurrentEpochEnd: 45000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 3,
        timestamp: 30100,
      },
      {
        expectedCurrentEpochEnd: 45000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 3,
        timestamp: 44900,
      },
      {
        expectedCurrentEpochEnd: 65000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 4,
        timestamp: 45100,
      },
      {
        expectedCurrentEpochEnd: 65000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 4,
        timestamp: 50100,
      },
    ],
  },
  {
    desc: 'epochDuration and decisionWindow decreased in first epoch: Epoch changes in ts: 5000, 8000, 11000, Decision window closes in: 2000, 6000, 12000',
    steps: [
      { changeNextEpochProps: { decisionWindow: 1000, epochDuration: 3000 } },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 1900,
      },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 2100,
      },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 4900,
      },
      {
        expectedCurrentEpochEnd: 8000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 2,
        timestamp: 5100,
      },
      {
        expectedCurrentEpochEnd: 8000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 2,
        timestamp: 5900,
      },
      {
        expectedCurrentEpochEnd: 8000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 2,
        timestamp: 6100,
      },
      {
        expectedCurrentEpochEnd: 8000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 2,
        timestamp: 7900,
      },
      {
        expectedCurrentEpochEnd: 11000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 3,
        timestamp: 8100,
      },
      {
        expectedCurrentEpochEnd: 11000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 3,
        timestamp: 8900,
      },
      {
        expectedCurrentEpochEnd: 11000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 3,
        timestamp: 9100,
      },
      {
        expectedCurrentEpochEnd: 11000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 3,
        timestamp: 10900,
      },
      {
        expectedCurrentEpochEnd: 14000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 4,
        timestamp: 11100,
      },
      {
        expectedCurrentEpochEnd: 14000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 4,
        timestamp: 12100,
      },
    ],
  },
  {
    desc: 'props changed twice in first epoch: Epoch changes in ts: 5000, 25000, 45000, Decision window closes in: 2000, 10000, 30000',
    steps: [
      { changeNextEpochProps: { decisionWindow: 6000, epochDuration: 12000 } },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 1900,
      },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 2100,
      },
      { changeNextEpochProps: { decisionWindow: 5000, epochDuration: 20000 } },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 4900,
      },
      {
        expectedCurrentEpochEnd: 25000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 2,
        timestamp: 5100,
      },
      {
        expectedCurrentEpochEnd: 25000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 2,
        timestamp: 7100,
      },
      {
        expectedCurrentEpochEnd: 25000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 2,
        timestamp: 9900,
      },
      {
        expectedCurrentEpochEnd: 25000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 2,
        timestamp: 10100,
      },
      {
        expectedCurrentEpochEnd: 25000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 2,
        timestamp: 24900,
      },
      {
        expectedCurrentEpochEnd: 45000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 3,
        timestamp: 25100,
      },
      {
        expectedCurrentEpochEnd: 45000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 3,
        timestamp: 30100,
      },
      {
        expectedCurrentEpochEnd: 45000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 3,
        timestamp: 44900,
      },
      {
        expectedCurrentEpochEnd: 65000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 4,
        timestamp: 45100,
      },
      {
        expectedCurrentEpochEnd: 65000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 4,
        timestamp: 50100,
      },
    ],
  },
  {
    desc: 'props changed twice in first epoch: Epoch changes in ts: 5000, 17000, 29000, Decision window closes in: 2000, 11000, 23000',
    steps: [
      { changeNextEpochProps: { decisionWindow: 5000, epochDuration: 20000 } },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 1900,
      },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 2100,
      },
      { changeNextEpochProps: { decisionWindow: 6000, epochDuration: 12000 } },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 4900,
      },
      {
        expectedCurrentEpochEnd: 17000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 2,
        timestamp: 5100,
      },
      {
        expectedCurrentEpochEnd: 17000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 2,
        timestamp: 7100,
      },
      {
        expectedCurrentEpochEnd: 17000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 2,
        timestamp: 10900,
      },
      {
        expectedCurrentEpochEnd: 17000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 2,
        timestamp: 11100,
      },
      {
        expectedCurrentEpochEnd: 17000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 2,
        timestamp: 16900,
      },
      {
        expectedCurrentEpochEnd: 29000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 3,
        timestamp: 17100,
      },
      {
        expectedCurrentEpochEnd: 29000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 3,
        timestamp: 22900,
      },
      {
        expectedCurrentEpochEnd: 29000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 3,
        timestamp: 23100,
      },
      {
        expectedCurrentEpochEnd: 29000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 3,
        timestamp: 28900,
      },
      {
        expectedCurrentEpochEnd: 41000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 4,
        timestamp: 29100,
      },
      {
        expectedCurrentEpochEnd: 41000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 4,
        timestamp: 35100,
      },
    ],
  },
  {
    desc: 'epochDuration and decisionWindow increased in second epoch: Epoch changes in ts: 5000, 10000, 20000, Decision window closes in: 2000, 7000, 15000',
    steps: [
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 1900,
      },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 2100,
      },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 4900,
      },
      {
        expectedCurrentEpochEnd: 10000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 2,
        timestamp: 5100,
      },
      { changeNextEpochProps: { decisionWindow: 5000, epochDuration: 10000 } },
      {
        expectedCurrentEpochEnd: 10000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 2,
        timestamp: 6900,
      },
      {
        expectedCurrentEpochEnd: 10000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 2,
        timestamp: 7100,
      },
      {
        expectedCurrentEpochEnd: 10000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 2,
        timestamp: 9900,
      },
      {
        expectedCurrentEpochEnd: 20000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 3,
        timestamp: 10100,
      },
      {
        expectedCurrentEpochEnd: 20000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 3,
        timestamp: 14900,
      },
      {
        expectedCurrentEpochEnd: 20000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 3,
        timestamp: 15100,
      },
      {
        expectedCurrentEpochEnd: 20000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 3,
        timestamp: 19900,
      },
      {
        expectedCurrentEpochEnd: 30000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 4,
        timestamp: 20100,
      },
      {
        expectedCurrentEpochEnd: 30000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 4,
        timestamp: 25100,
      },
    ],
  },
  {
    desc: 'epochDuration and decisionWindow decreased in second epoch: Epoch changes in ts: 5000, 10000, 13000, Decision window closes in: 2000, 7000, 11000',
    steps: [
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 1900,
      },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 2100,
      },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 4900,
      },
      {
        expectedCurrentEpochEnd: 10000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 2,
        timestamp: 5100,
      },
      { changeNextEpochProps: { decisionWindow: 1000, epochDuration: 3000 } },
      {
        expectedCurrentEpochEnd: 10000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 2,
        timestamp: 6900,
      },
      {
        expectedCurrentEpochEnd: 10000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 2,
        timestamp: 7100,
      },
      {
        expectedCurrentEpochEnd: 10000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 2,
        timestamp: 9900,
      },
      {
        expectedCurrentEpochEnd: 13000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 3,
        timestamp: 10100,
      },
      {
        expectedCurrentEpochEnd: 13000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 3,
        timestamp: 10900,
      },
      {
        expectedCurrentEpochEnd: 13000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 3,
        timestamp: 11100,
      },
      {
        expectedCurrentEpochEnd: 13000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 3,
        timestamp: 12900,
      },
      {
        expectedCurrentEpochEnd: 16000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 4,
        timestamp: 13100,
      },
      {
        expectedCurrentEpochEnd: 16000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 4,
        timestamp: 14100,
      },
    ],
  },
  {
    desc: 'props changed in first and second epoch: Epoch changes in ts: 5000, 15000, 18000, Decision window closes in: 2000, 10000, 16000',
    steps: [
      { changeNextEpochProps: { decisionWindow: 5000, epochDuration: 10000 } },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 1900,
      },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 2100,
      },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 4900,
      },
      {
        expectedCurrentEpochEnd: 15000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 2,
        timestamp: 5100,
      },
      { changeNextEpochProps: { decisionWindow: 1000, epochDuration: 3000 } },
      {
        expectedCurrentEpochEnd: 15000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 2,
        timestamp: 9900,
      },
      {
        expectedCurrentEpochEnd: 15000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 2,
        timestamp: 10100,
      },
      {
        expectedCurrentEpochEnd: 15000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 2,
        timestamp: 14900,
      },
      {
        expectedCurrentEpochEnd: 18000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 3,
        timestamp: 15100,
      },
      {
        expectedCurrentEpochEnd: 18000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 3,
        timestamp: 15900,
      },
      {
        expectedCurrentEpochEnd: 18000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 3,
        timestamp: 16100,
      },
      {
        expectedCurrentEpochEnd: 18000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 3,
        timestamp: 17900,
      },
      {
        expectedCurrentEpochEnd: 21000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 4,
        timestamp: 18100,
      },
      {
        expectedCurrentEpochEnd: 21000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 4,
        timestamp: 19100,
      },
    ],
  },
  {
    desc: 'props changed in first and third epoch: Epoch changes in ts: 5000, 8000, 11000, 21000, Decision window closes in: 2000, 6000, 9000, 17000',
    steps: [
      { changeNextEpochProps: { decisionWindow: 1000, epochDuration: 3000 } },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 1900,
      },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 2100,
      },
      {
        expectedCurrentEpochEnd: 5000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 1,
        timestamp: 4900,
      },
      {
        expectedCurrentEpochEnd: 8000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 2,
        timestamp: 5100,
      },
      {
        expectedCurrentEpochEnd: 8000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 2,
        timestamp: 5900,
      },
      {
        expectedCurrentEpochEnd: 8000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 2,
        timestamp: 6100,
      },
      {
        expectedCurrentEpochEnd: 8000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 2,
        timestamp: 7900,
      },
      {
        expectedCurrentEpochEnd: 11000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 3,
        timestamp: 8100,
      },
      { changeNextEpochProps: { decisionWindow: 6000, epochDuration: 10000 } },
      {
        expectedCurrentEpochEnd: 11000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 3,
        timestamp: 8900,
      },
      {
        expectedCurrentEpochEnd: 11000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 3,
        timestamp: 9100,
      },
      {
        expectedCurrentEpochEnd: 11000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 3,
        timestamp: 10900,
      },
      {
        expectedCurrentEpochEnd: 21000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 4,
        timestamp: 11100,
      },
      {
        expectedCurrentEpochEnd: 21000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 4,
        timestamp: 16900,
      },
      {
        expectedCurrentEpochEnd: 21000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 4,
        timestamp: 17100,
      },
      {
        expectedCurrentEpochEnd: 21000,
        expectedDecisionWindowOpen: false,
        expectedEpoch: 4,
        timestamp: 20900,
      },
      {
        expectedCurrentEpochEnd: 31000,
        expectedDecisionWindowOpen: true,
        expectedEpoch: 5,
        timestamp: 21100,
      },
    ],
  },
];
