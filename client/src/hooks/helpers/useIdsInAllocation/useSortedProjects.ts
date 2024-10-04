import { useMemo } from 'react';

import { PROJECTS_ADDRESSES_RANDOMIZED_ORDER } from 'constants/localStorageKeys';
import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';
import { ProjectsIpfsWithRewardsAndEpochs } from 'hooks/queries/useSearchedProjectsDetails';
import { ProjectsAddressesRandomizedOrder } from 'types/localStorage';
import { OrderOption } from 'views/ProjectsView/types';

export default function useSortedProjects(
  projects: ProjectIpfsWithRewards[] | ProjectsIpfsWithRewardsAndEpochs[],
  orderOption: OrderOption,
): ProjectIpfsWithRewards[] | ProjectsIpfsWithRewardsAndEpochs[] {
  return useMemo((): ProjectIpfsWithRewards[] | ProjectsIpfsWithRewardsAndEpochs[] => {
    switch (orderOption) {
      case 'randomized': {
        const projectsAddressesRandomizedOrder = JSON.parse(
          localStorage.getItem(PROJECTS_ADDRESSES_RANDOMIZED_ORDER)!,
        ) as ProjectsAddressesRandomizedOrder;

        const { addressesRandomizedOrder } = projectsAddressesRandomizedOrder;

        return projects.sort((a, b) => {
          return (
            addressesRandomizedOrder.indexOf(a.address) -
            addressesRandomizedOrder.indexOf(b.address)
          );
        });
      }
      case 'alphabeticalAscending': {
        const projectIpfsWithRewardsFiltered = projects.filter(
          element => element.name !== undefined,
        );
        return projectIpfsWithRewardsFiltered.sort((a, b) => a.name!.localeCompare(b.name!));
      }
      case 'alphabeticalDescending': {
        const projectIpfsWithRewardsFiltered = projects.filter(
          element => element.name !== undefined,
        );
        return projectIpfsWithRewardsFiltered.sort((a, b) => b.name!.localeCompare(a.name!));
      }
      case 'donorsAscending': {
        return projects.sort((a, b) => a.numberOfDonors - b.numberOfDonors);
      }
      case 'donorsDescending': {
        return projects.sort((a, b) => b.numberOfDonors - a.numberOfDonors);
      }
      case 'totalsAscending': {
        const projectIpfsWithRewardsFiltered = projects.filter(
          element => element.totalValueOfAllocations !== undefined,
        );
        return projectIpfsWithRewardsFiltered.sort((a, b) =>
          Number(a.totalValueOfAllocations! - b.totalValueOfAllocations!),
        );
      }
      case 'totalsDescending': {
        const projectIpfsWithRewardsFiltered = projects.filter(
          element => element.totalValueOfAllocations !== undefined,
        );
        return projectIpfsWithRewardsFiltered.sort((a, b) =>
          Number(b.totalValueOfAllocations! - a.totalValueOfAllocations!),
        );
      }
      default: {
        return projects;
      }
    }
  }, [projects, orderOption]);
}
