export default function truncateEthAddress(address: string, isShortVersion?: boolean): string {
  const first = address.substring(0, 5);
  const last = address.substring(address.length - 4);

  if (isShortVersion) {
    return first;
  }

  return `${first}...${last}`;
}
