export default interface ImgProps {
  alt?: string;
  className?: string;
  dataTest?: string;
  onLoad?: () => void;
  sources?: string[];
  src?: string;
}
