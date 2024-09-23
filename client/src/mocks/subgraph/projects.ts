import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';

export const mockedProjectATotalValueOfAllocations1: ProjectIpfsWithRewards = {
  address: 'address',
  donations: BigInt(1),
  isLoadingError: false,
  matchedRewards: BigInt(1),
  name: 'A',
  numberOfDonors: 10,
  percentage: 1,
  totalValueOfAllocations: BigInt(1),
};

export const mockedProjectATotalValueOfAllocationsUndefined = {
  ...mockedProjectATotalValueOfAllocations1,
  totalValueOfAllocations: undefined,
};

export const mockedProjectATotalValueOfAllocations2: ProjectIpfsWithRewards = {
  ...mockedProjectATotalValueOfAllocations1,
  totalValueOfAllocations: BigInt(2),
};

export const mockedProjectBTotalValueOfAllocations2: ProjectIpfsWithRewards = {
  ...mockedProjectATotalValueOfAllocations1,
  name: 'B',
  totalValueOfAllocations: BigInt(2),
};

export const mockedProjectBTotalValueOfAllocationsUndefined = {
  ...mockedProjectBTotalValueOfAllocations2,
  totalValueOfAllocations: undefined,
};

export const mockedProjectCTotalValueOfAllocations3: ProjectIpfsWithRewards = {
  ...mockedProjectATotalValueOfAllocations1,
  name: 'C',
  totalValueOfAllocations: BigInt(3),
};

export const mockedProjectCTotalValueOfAllocationsUndefined = {
  ...mockedProjectCTotalValueOfAllocations3,
  totalValueOfAllocations: undefined,
};

export const mockedProjectDTotalValueOfAllocations4: ProjectIpfsWithRewards = {
  ...mockedProjectATotalValueOfAllocations1,
  name: 'D',
  totalValueOfAllocations: BigInt(4),
};

export const mockedProjectDTotalValueOfAllocationsUndefined = {
  ...mockedProjectDTotalValueOfAllocations4,
  totalValueOfAllocations: undefined,
};
