import { useAccount } from 'wagmi';

import { CYPRESS_IS_PROJECT_ADMIN } from 'constants/window';
import useAllProjects from 'hooks/subgraph/useAllProjects';

const useIsProjectAdminMode = (): boolean => {
  const { isConnected, address } = useAccount();
  const { data: allProjects } = useAllProjects();

  if (window.Cypress && window[CYPRESS_IS_PROJECT_ADMIN]) {
    return isConnected;
  }

  return (
    isConnected && !!address && !!allProjects?.includes(address.toLowerCase() as `0x${string}`)
  );
};

export default useIsProjectAdminMode;
