import { getPieChartData } from './utils';

const testCases = [
  {
    inputData: [
      {
        label: 'A',
        value: 100,
        valueLabel: '100 ETH',
      },
      {
        label: 'B',
        value: 150,
        valueLabel: '150 ETH',
      },
      {
        label: 'C',
        value: 25,
        valueLabel: '25 ETH',
      },
      {
        label: 'D',
        value: 50,
        valueLabel: '50 ETH',
      },
    ],
    outputData: [
      {
        angle: 1.9332877868244882,
        angle0: 0,
        color: '#177967',
        id: 0,
        label: 'A',
        percentageValue: 31,
        radius: 72,
        radius0: 72,
        value: 100,
        valueLabel: '100 ETH',
      },
      {
        angle: 4.8332194670612205,
        angle0: 1.9332877868244882,
        color: '#17B239',
        id: 1,
        label: 'B',
        percentageValue: 46,
        radius: 72,
        radius0: 72,
        value: 150,
        valueLabel: '150 ETH',
      },
      {
        angle: 5.316541413767343,
        angle0: 4.8332194670612205,
        color: '#FF9601',
        id: 2,
        label: 'C',
        percentageValue: 8,
        radius: 72,
        radius0: 72,
        value: 25,
        valueLabel: '25 ETH',
      },
      {
        angle: 6.283185307179586,
        angle0: 5.316541413767343,
        color: '#2D9B87',
        id: 3,
        label: 'D',
        percentageValue: 15,
        radius: 72,
        radius0: 72,
        value: 50,
        valueLabel: '50 ETH',
      },
    ],
    radius: 72,
  },
  {
    inputData: [
      {
        label: 'A',
        value: 10,
        valueLabel: '10 ETH',
      },
      {
        label: 'B',
        value: 15,
        valueLabel: '15 ETH',
      },
      {
        label: 'C',
        value: 12,
        valueLabel: '12 ETH',
      },
      {
        label: 'D',
        value: 33,
        valueLabel: '33 ETH',
      },
    ],
    outputData: [
      {
        angle: 0.8975979010256552,
        angle0: 0,
        color: '#177967',
        id: 0,
        label: 'A',
        percentageValue: 14,
        radius: 50,
        radius0: 50,
        value: 10,
        valueLabel: '10 ETH',
      },
      {
        angle: 2.2439947525641375,
        angle0: 0.8975979010256552,
        color: '#17B239',
        id: 1,
        label: 'B',
        percentageValue: 21,
        radius: 50,
        radius0: 50,
        value: 15,
        valueLabel: '15 ETH',
      },
      {
        angle: 3.3211122337949237,
        angle0: 2.2439947525641375,
        color: '#FF9601',
        id: 2,
        label: 'C',
        percentageValue: 17,
        radius: 50,
        radius0: 50,
        value: 12,
        valueLabel: '12 ETH',
      },
      {
        angle: 6.283185307179585,
        angle0: 3.3211122337949237,
        color: '#2D9B87',
        id: 3,
        label: 'D',
        percentageValue: 47,
        radius: 50,
        radius0: 50,
        value: 33,
        valueLabel: '33 ETH',
      },
    ],
    radius: 50,
  },
];

describe('getPieChartData', () => {
  for (const { radius, inputData, outputData } of testCases) {
    it('returns correct data', () => {
      expect(getPieChartData(inputData, radius)).toStrictEqual(outputData);
    });
  }
});
