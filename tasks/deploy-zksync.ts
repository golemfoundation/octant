import { extendConfig, task } from 'hardhat/config';

import { ZkSyncContractsConfig } from '../types';

extendConfig(config => {
  const defaultConfig: ZkSyncContractsConfig = {
    epochsAddress: '',
  };
  // eslint-disable-next-line no-param-reassign
  config.zkSyncContracts = { ...defaultConfig, ...config.zkSyncContracts };
});

task('deploy-zksync', 'Runs the deploy scripts for zkSync network').setAction(
  async ({ script }: { script: string }, { config, run, artifacts }, runSuper) => {
    await runSuper();
  },
);
