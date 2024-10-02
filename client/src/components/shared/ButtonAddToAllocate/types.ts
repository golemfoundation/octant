export default interface ButtonAddToAllocateProps {
  className?: string;
  dataTest?: string;
  isAddedToAllocate: boolean;
  isAllocatedTo: boolean;
  isArchivedProject?: boolean;
  onClick: () => void;
  variant?: 'cta' | 'iconOnly';
}
