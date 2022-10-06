import 'hardhat/types/config';
import { ZkSyncContractsConfig } from './types';

declare module 'hardhat/types/config' {
    interface HardhatUserConfig {
        zkSyncContracts?: Partial<ZkSyncContractsConfig>;
    }

    interface HardhatConfig {
      zkSyncContracts: ZkSyncContractsConfig;
    }
}
