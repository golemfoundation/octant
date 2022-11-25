export default interface InputTextProps {
  className?: string;
  label?: string;
  name?: string;
  onChange: (event) => void;
  placeholder?: string;
  suffix?: string;
  value?: string;
}
