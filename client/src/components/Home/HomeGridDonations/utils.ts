import { Response, ResponseItem } from 'hooks/helpers/useUserAllocationsAllEpochs';

export function getReducedUserAllocationsAllEpochs(
  userAllocationsAllEpochs: Response,
): ResponseItem['elements'] {
  return userAllocationsAllEpochs
    .reduce<ResponseItem['elements']>((acc, curr) => [...acc, ...curr.elements], [])
    .reduce<ResponseItem['elements']>((acc, curr) => {
      const indexOfProjectAlreadyAdded = acc.findIndex(element => element.address === curr.address);
      if (indexOfProjectAlreadyAdded > -1) {
        // eslint-disable-next-line operator-assignment
        acc[indexOfProjectAlreadyAdded].value = acc[indexOfProjectAlreadyAdded].value + curr.value;
        acc[indexOfProjectAlreadyAdded].epoch = curr.epoch;
        return acc;
      }
      return [...acc, curr];
    }, []);
}
