import { useAccount } from 'wagmi';

import useProposalsAllIpfs from 'hooks/queries/useProposalsAllIpfs';

const useIsProjectAdminMode = (): boolean => {
  const { isConnected, address } = useAccount();
  const { data: proposalsAllIpfs } = useProposalsAllIpfs();

  return isConnected && !!proposalsAllIpfs?.includes(address as `0x${string}`);
};

export default useIsProjectAdminMode;
