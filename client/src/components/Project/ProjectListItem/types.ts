export default interface ProjectListItemProps {
  address: string;
  description?: string;
  epoch?: number;
  index: number;
  name?: string;
  profileImageSmall?: string;
  website?: {
    label?: string;
    url: string;
  };
}
