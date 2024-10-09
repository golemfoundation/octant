// gap.client.ts;
import { GAP } from '@show-karma/karma-gap-sdk';
import { GapIndexerClient } from '@show-karma/karma-gap-sdk/core/class';

const gap = new GAP({
  // sepolia, optimism,
apiClient: new GapIndexerClient('https://gapapi.karmahq.xyz'), 
  network: 'optimism-sepolia',
  // apiClient: custom api client, see Section 8;
  // gelatoOpts: for gasless transactions, see Section 7;
});

export default gap;
