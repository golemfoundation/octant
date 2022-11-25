export default function truncateEthAddress(address: string): string {
  const first = address.substring(0, 5);
  const last = address.substring(address.length - 4);

  return `${first}...${last}`;
}
