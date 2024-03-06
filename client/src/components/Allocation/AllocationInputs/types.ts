export type FormFields = {
  valueCryptoSelected: string;
};

export default interface AllocationInputsProps {
  className?: string;
  isManuallyEdited?: boolean;
  onClose: (newValue: bigint) => void;
  restToDistribute?: bigint;
  valueCryptoSelected: bigint;
  valueCryptoTotal: bigint;
}
