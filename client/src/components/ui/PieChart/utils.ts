import { PieChartData, PieChartInputData } from './types';

export const getPieChartData = (data: PieChartInputData, radius: number): PieChartData => {
  // imported colors from styles module are undefined during test
  const pieChartColors = ['#177967', '#17B239', '#FF9601', '#2D9B87', '#FF6157'];

  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

  return data.reduce((acc, curr, idx) => {
    const fractionValue = curr.value / totalValue;
    const angle0 = acc.length ? acc[acc.length - 1].angle : 0;

    const angle = (angle0 / (2 * Math.PI) + fractionValue) * 2 * Math.PI;
    const el = {
      angle,
      angle0,
      color: pieChartColors[idx],
      id: idx,
      label: curr.label,
      percentageValue: Math.round(fractionValue * 100),
      radius,
      radius0: radius,
      value: curr.value,
      valueLabel: curr.valueLabel,
    };
    acc.push(el);
    return acc;
  }, [] as PieChartData);
};
