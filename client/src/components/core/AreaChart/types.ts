type AreaChartData =
  | {
      x: number;
      y: number;
    }[]
  | undefined;

export default interface AreaChartProps {
  className?: string;
  data: AreaChartData;
  shouldFormatXValueToDate?: boolean;
  shouldFormatYValue?: boolean;
  yDomain?: number[];
}
