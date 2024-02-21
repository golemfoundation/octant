export type PieChartInputData = {
  label: string;
  value: number;
  valueLabel: string;
}[];

export type PieChartProps = {
  data: PieChartInputData;
  isLoading?: boolean;
};

export type PieChartData = {
  angle: number;
  angle0: number;
  color: string;
  id: number;
  label: string;
  percentageValue: number;
  radius: number;
  radius0: number;
  value: number;
}[];
