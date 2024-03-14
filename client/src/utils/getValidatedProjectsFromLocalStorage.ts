export default function getValidatedProjectsFromLocalStorage(
  localStorageAllocationItems: string[],
  projects: string[],
): string[] {
  // Remove duplicates, if any
  return [
    ...new Set(
      localStorageAllocationItems.filter(item => projects.find(address => address === item)),
    ),
  ];
}
