import { UseQueryResult, useQuery } from 'react-query';

import { NUMBER_OF_ETHERS_PER_VALIDATOR } from 'constants/eth';

import useContractBeaconChainOracle from './contracts/useContractBeaconChainOracle';

export default function useEthStaked(): UseQueryResult<string | undefined> {
  const contractBeaconChainOracle = useContractBeaconChainOracle();

  return useQuery(['ethStaked'], () => contractBeaconChainOracle?.validatorIndexes(), {
    enabled: !!contractBeaconChainOracle,
    select: response => {
      const numberOfValidators = response!.split(',').length;
      return `${numberOfValidators * NUMBER_OF_ETHERS_PER_VALIDATOR}.0`;
    },
  });
}
