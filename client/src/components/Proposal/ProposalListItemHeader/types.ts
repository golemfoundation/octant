export default interface ProposalListItemHeaderProps {
  address: string;
  epoch?: number;
  name?: string;
  profileImageSmall?: string;
  website?: {
    label?: string;
    url?: string;
  };
}
