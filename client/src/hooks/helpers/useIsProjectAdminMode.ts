import { useAccount } from 'wagmi';

import useAllProjects from 'hooks/subgraph/useAllProjects';

const useIsProjectAdminMode = (): boolean => {
  const { isConnected, address } = useAccount();
  const { data: allProjects } = useAllProjects();

  return (
    isConnected && !!address && !!allProjects?.includes(address.toLowerCase() as `0x${string}`)
  );
};

export default useIsProjectAdminMode;
