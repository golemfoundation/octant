import getMetricsChartDataGroupedByDate from './getMetricsChartDataGroupedByDate';

const testCases = [
  {
    dataType: 'lockeds',
    inputData: [
      {
        amount: '100000000000000000000',
        timestamp: 1691520096,
        user: '0xe5e11cc5fb894ef5a9d7da768cfb17066b9d35d7',
      },
      {
        amount: '250000000000000000000',
        timestamp: 1692078408,
        user: '0x49d4b4cb01971736e1b3996121d4ddea7733fb3f',
      },
      {
        amount: '2000000000000000000000',
        timestamp: 1691167452,
        user: '0xfc9527820a76b515a2c66c22e0575501dedd8281',
      },
      {
        amount: '100000000000000000000',
        timestamp: 1691520072,
        user: '0xe5e11cc5fb894ef5a9d7da768cfb17066b9d35d7',
      },
      {
        amount: '12000000000000000000',
        timestamp: 1693885908,
        user: '0x2b50777bf5657cee8d11b41a906a77387b34be84',
      },
      {
        amount: '100000000000000000000',
        timestamp: 1691518800,
        user: '0xe5e11cc5fb894ef5a9d7da768cfb17066b9d35d7',
      },
      {
        amount: '111000000000000000000',
        timestamp: 1691513784,
        user: '0xfc9527820a76b515a2c66c22e0575501dedd8281',
      },
      {
        amount: '30000000000000000000',
        timestamp: 1694063148,
        user: '0x2b50777bf5657cee8d11b41a906a77387b34be84',
      },
      {
        amount: '1000000000000000000000',
        timestamp: 1691414352,
        user: '0xa0facbd53826095f65cbe48f43ddba293d8fd19b',
      },
      {
        amount: '400000000000000000000',
        timestamp: 1693885272,
        user: '0x2b50777bf5657cee8d11b41a906a77387b34be84',
      },
      {
        amount: '3000000000000000000000',
        timestamp: 1691414196,
        user: '0xa0facbd53826095f65cbe48f43ddba293d8fd19b',
      },
      {
        amount: '4000000000000000000000',
        timestamp: 1691411496,
        user: '0xa0facbd53826095f65cbe48f43ddba293d8fd19b',
      },
      {
        amount: '2000000000000000000000',
        timestamp: 1691413836,
        user: '0xa0facbd53826095f65cbe48f43ddba293d8fd19b',
      },
      {
        amount: '666000000000000000000',
        timestamp: 1691416956,
        user: '0xfc9527820a76b515a2c66c22e0575501dedd8281',
      },
      {
        amount: '5000000000000000000',
        timestamp: 1694064276,
        user: '0x2b50777bf5657cee8d11b41a906a77387b34be84',
      },
      {
        amount: '3000000000000000000000',
        timestamp: 1691517348,
        user: '0xe5e11cc5fb894ef5a9d7da768cfb17066b9d35d7',
      },
      {
        amount: '111000000000000000000',
        timestamp: 1691513256,
        user: '0xfc9527820a76b515a2c66c22e0575501dedd8281',
      },
      {
        amount: '100000000000000000000000000',
        timestamp: 1691334144,
        user: '0xfc9527820a76b515a2c66c22e0575501dedd8281',
      },
      {
        amount: '100000000000000000000',
        timestamp: 1691520060,
        user: '0xe5e11cc5fb894ef5a9d7da768cfb17066b9d35d7',
      },
      {
        amount: '100000000000000000000000000',
        timestamp: 1691421540,
        user: '0xfc9527820a76b515a2c66c22e0575501dedd8281',
      },
      {
        amount: '222000000000000000000',
        timestamp: 1691514468,
        user: '0xfc9527820a76b515a2c66c22e0575501dedd8281',
      },
      {
        amount: '555000000000000000000',
        timestamp: 1692353928,
        user: '0xfc9527820a76b515a2c66c22e0575501dedd8281',
      },
      {
        amount: '1000000000000000000000',
        timestamp: 1695213252,
        user: '0x26fa7fc3d3801d039ca313e759a55088e19efd1b',
      },
      {
        amount: '123000000000000000000',
        timestamp: 1692622800,
        user: '0xfc9527820a76b515a2c66c22e0575501dedd8281',
      },
      {
        amount: '2000000000000000000000',
        timestamp: 1692158796,
        user: '0xa25207bb8f8ec2423e2ddf2686a0cd2048352f3e',
      },
      {
        amount: '3000000000000000000000',
        timestamp: 1691517276,
        user: '0xe5e11cc5fb894ef5a9d7da768cfb17066b9d35d7',
      },
      {
        amount: '1000000000000000000000',
        timestamp: 1695205176,
        user: '0x26fa7fc3d3801d039ca313e759a55088e19efd1b',
      },
      {
        amount: '100000000000000000000',
        timestamp: 1693947888,
        user: '0x1078daa844cdf1edb51e5189c8b113b80a6a6957',
      },
    ],
    outputData: [
      { dateTime: 1691107200000, users: ['0xfc9527820a76b515a2c66c22e0575501dedd8281'] },
      { dateTime: 1691280000000, users: ['0xfc9527820a76b515a2c66c22e0575501dedd8281'] },
      {
        dateTime: 1691366400000,
        users: [
          '0xfc9527820a76b515a2c66c22e0575501dedd8281',
          '0xa0facbd53826095f65cbe48f43ddba293d8fd19b',
        ],
      },
      {
        dateTime: 1691452800000,
        users: [
          '0xfc9527820a76b515a2c66c22e0575501dedd8281',
          '0xa0facbd53826095f65cbe48f43ddba293d8fd19b',
          '0xe5e11cc5fb894ef5a9d7da768cfb17066b9d35d7',
        ],
      },
      {
        dateTime: 1692057600000,
        users: [
          '0xfc9527820a76b515a2c66c22e0575501dedd8281',
          '0xa0facbd53826095f65cbe48f43ddba293d8fd19b',
          '0xe5e11cc5fb894ef5a9d7da768cfb17066b9d35d7',
          '0x49d4b4cb01971736e1b3996121d4ddea7733fb3f',
        ],
      },
      {
        dateTime: 1692144000000,
        users: [
          '0xfc9527820a76b515a2c66c22e0575501dedd8281',
          '0xa0facbd53826095f65cbe48f43ddba293d8fd19b',
          '0xe5e11cc5fb894ef5a9d7da768cfb17066b9d35d7',
          '0x49d4b4cb01971736e1b3996121d4ddea7733fb3f',
          '0xa25207bb8f8ec2423e2ddf2686a0cd2048352f3e',
        ],
      },
      {
        dateTime: 1692316800000,
        users: [
          '0xfc9527820a76b515a2c66c22e0575501dedd8281',
          '0xa0facbd53826095f65cbe48f43ddba293d8fd19b',
          '0xe5e11cc5fb894ef5a9d7da768cfb17066b9d35d7',
          '0x49d4b4cb01971736e1b3996121d4ddea7733fb3f',
          '0xa25207bb8f8ec2423e2ddf2686a0cd2048352f3e',
        ],
      },
      {
        dateTime: 1692576000000,
        users: [
          '0xfc9527820a76b515a2c66c22e0575501dedd8281',
          '0xa0facbd53826095f65cbe48f43ddba293d8fd19b',
          '0xe5e11cc5fb894ef5a9d7da768cfb17066b9d35d7',
          '0x49d4b4cb01971736e1b3996121d4ddea7733fb3f',
          '0xa25207bb8f8ec2423e2ddf2686a0cd2048352f3e',
        ],
      },
      {
        dateTime: 1693872000000,
        users: [
          '0xfc9527820a76b515a2c66c22e0575501dedd8281',
          '0xa0facbd53826095f65cbe48f43ddba293d8fd19b',
          '0xe5e11cc5fb894ef5a9d7da768cfb17066b9d35d7',
          '0x49d4b4cb01971736e1b3996121d4ddea7733fb3f',
          '0xa25207bb8f8ec2423e2ddf2686a0cd2048352f3e',
          '0x2b50777bf5657cee8d11b41a906a77387b34be84',
          '0x1078daa844cdf1edb51e5189c8b113b80a6a6957',
        ],
      },
      {
        dateTime: 1694044800000,
        users: [
          '0xfc9527820a76b515a2c66c22e0575501dedd8281',
          '0xa0facbd53826095f65cbe48f43ddba293d8fd19b',
          '0xe5e11cc5fb894ef5a9d7da768cfb17066b9d35d7',
          '0x49d4b4cb01971736e1b3996121d4ddea7733fb3f',
          '0xa25207bb8f8ec2423e2ddf2686a0cd2048352f3e',
          '0x2b50777bf5657cee8d11b41a906a77387b34be84',
          '0x1078daa844cdf1edb51e5189c8b113b80a6a6957',
        ],
      },
      {
        dateTime: 1695168000000,
        users: [
          '0xfc9527820a76b515a2c66c22e0575501dedd8281',
          '0xa0facbd53826095f65cbe48f43ddba293d8fd19b',
          '0xe5e11cc5fb894ef5a9d7da768cfb17066b9d35d7',
          '0x49d4b4cb01971736e1b3996121d4ddea7733fb3f',
          '0xa25207bb8f8ec2423e2ddf2686a0cd2048352f3e',
          '0x2b50777bf5657cee8d11b41a906a77387b34be84',
          '0x1078daa844cdf1edb51e5189c8b113b80a6a6957',
          '0x26fa7fc3d3801d039ca313e759a55088e19efd1b',
        ],
      },
    ],
  },
  {
    dataType: 'lockedSummarySnapshots',
    inputData: [
      { lockedTotal: '2000000000000000000000', timestamp: 1691167452 },
      { lockedTotal: '100002000000000000000000000', timestamp: 1691334144 },
      { lockedTotal: '0', timestamp: 1691334252 },
      { lockedTotal: '4000000000000000000000', timestamp: 1691411496 },
      { lockedTotal: '2000000000000000000000', timestamp: 1691412612 },
      { lockedTotal: '4000000000000000000000', timestamp: 1691413836 },
      { lockedTotal: '1000000000000000000000', timestamp: 1691414040 },
      { lockedTotal: '4000000000000000000000', timestamp: 1691414196 },
      { lockedTotal: '3000000000000000000000', timestamp: 1691414280 },
      { lockedTotal: '4000000000000000000000', timestamp: 1691414352 },
      { lockedTotal: '4666000000000000000000', timestamp: 1691416956 },
      { lockedTotal: '100004666000000000000000000', timestamp: 1691421540 },
      { lockedTotal: '1004666000000000000000000', timestamp: 1691512452 },
      { lockedTotal: '1004777000000000000000000', timestamp: 1691513256 },
      { lockedTotal: '1004888000000000000000000', timestamp: 1691513784 },
      { lockedTotal: '1004666000000000000000000', timestamp: 1691514312 },
      { lockedTotal: '1004888000000000000000000', timestamp: 1691514468 },
      { lockedTotal: '1004777000000000000000000', timestamp: 1691514504 },
      { lockedTotal: '1007777000000000000000000', timestamp: 1691517276 },
      { lockedTotal: '1010777000000000000000000', timestamp: 1691517348 },
      { lockedTotal: '1010877000000000000000000', timestamp: 1691518800 },
      { lockedTotal: '1010977000000000000000000', timestamp: 1691520060 },
      { lockedTotal: '1011077000000000000000000', timestamp: 1691520072 },
      { lockedTotal: '1011177000000000000000000', timestamp: 1691520096 },
      { lockedTotal: '1011427000000000000000000', timestamp: 1692078408 },
      { lockedTotal: '1013427000000000000000000', timestamp: 1692158796 },
      { lockedTotal: '1012761000000000000000000', timestamp: 1692353808 },
      { lockedTotal: '1013316000000000000000000', timestamp: 1692353928 },
      { lockedTotal: '1013439000000000000000000', timestamp: 1692622800 },
      { lockedTotal: '1013839000000000000000000', timestamp: 1693885272 },
      { lockedTotal: '1013851000000000000000000', timestamp: 1693885908 },
      { lockedTotal: '1013951000000000000000000', timestamp: 1693947888 },
      { lockedTotal: '1013981000000000000000000', timestamp: 1694063148 },
      { lockedTotal: '1013986000000000000000000', timestamp: 1694064276 },
      { lockedTotal: '1014986000000000000000000', timestamp: 1695205176 },
      { lockedTotal: '1013986000000000000000000', timestamp: 1695206520 },
      { lockedTotal: '1014986000000000000000000', timestamp: 1695213252 },
      { lockedTotal: '1013986000000000000000000', timestamp: 1695213408 },
      { lockedTotal: '1013539000000000000000000', timestamp: 1696810860 },
      { lockedTotal: '1013289000000000000000000', timestamp: 1696903644 },
    ],
    outputData: [
      { cummulativeGlmAmount: 2000, dateTime: 1691107200000 },
      { cummulativeGlmAmount: 0, dateTime: 1691280000000 },
      { cummulativeGlmAmount: 100004666, dateTime: 1691366400000 },
      { cummulativeGlmAmount: 1011177, dateTime: 1691452800000 },
      { cummulativeGlmAmount: 1011427, dateTime: 1692057600000 },
      { cummulativeGlmAmount: 1013427, dateTime: 1692144000000 },
      { cummulativeGlmAmount: 1013316, dateTime: 1692316800000 },
      { cummulativeGlmAmount: 1013439, dateTime: 1692576000000 },
      { cummulativeGlmAmount: 1013951, dateTime: 1693872000000 },
      { cummulativeGlmAmount: 1013986, dateTime: 1694044800000 },
      { cummulativeGlmAmount: 1013986, dateTime: 1695168000000 },
      { cummulativeGlmAmount: 1013539, dateTime: 1696809600000 },
      { cummulativeGlmAmount: 1013289, dateTime: 1696896000000 },
    ],
  },
];

describe('getMetricsChartDataGroupedByDate', () => {
  for (const { dataType, inputData, outputData } of testCases) {
    it(`returns ${JSON.stringify(
      outputData,
    )} for ${dataType} dataType and inputData: ${JSON.stringify(inputData)}`, () => {
      expect(
        getMetricsChartDataGroupedByDate(
          inputData,
          dataType as 'lockedSummarySnapshots' | 'lockeds',
        ),
      ).toStrictEqual(outputData);
    });
  }
});
