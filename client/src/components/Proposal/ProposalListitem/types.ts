export default interface ProposalListItemProps {
  address: string;
  description?: string;
  epoch?: number;
  index: number;
  name?: string;
  numberOfDonors: number;
  profileImageSmall?: string;
  totalValueOfAllocations?: bigint;
  website?: {
    label?: string;
    url: string;
  };
}
