export default interface ProjectListItemHeaderProps {
  address: string;
  epoch?: number;
  name?: string;
  profileImageSmall?: string;
  website?: {
    label?: string;
    url?: string;
  };
}
