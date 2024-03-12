export default function getValidatedProjectsFromLocalStorage(
  localStorageAllocationItems: string[],
  proposals: string[],
): string[] {
  // Remove duplicates, if any
  return [
    ...new Set(
      localStorageAllocationItems.filter(item => proposals.find(address => address === item)),
    ),
  ];
}
