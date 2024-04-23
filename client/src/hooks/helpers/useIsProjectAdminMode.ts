import { useAccount } from 'wagmi';

import useAllProjects from 'hooks/subgraph/useAllProjects';

const useIsProjectAdminMode = (): { data: boolean; isFetching: boolean } => {
  const { isConnected, address } = useAccount();
  const { data: allProjects, isFetching: isFetchingAllProjects } = useAllProjects();

  return {
    data:
      isConnected && !!address && !!allProjects?.includes(address.toLowerCase() as `0x${string}`),
    isFetching: isFetchingAllProjects,
  };
};

export default useIsProjectAdminMode;
