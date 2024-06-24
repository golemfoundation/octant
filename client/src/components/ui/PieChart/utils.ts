import { PieChartData, PieChartInputData } from './types';

export const getPieChartData = (data: PieChartInputData, radius: number): PieChartData => {
  // imported colors from styles module are undefined during test
  const pieChartColors = [
    '#17B239',
    '#FF9601',
    '#2D9B87',
    '#685B8A',
    '#1D4558',
    '#177967',
    '#F6C54B',
    '#FF6157',
  ];

  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

  return data
    .sort((a, b) => {
      if (a.value < b.value) {
        return 1;
      }
      if (a.value > b.value) {
        return -1;
      }
      return 0;
    })
    .reduce((acc, curr, idx) => {
      const fractionValue = curr.value / totalValue;
      const angle0 = acc.length ? acc[acc.length - 1].angle : 0;

      const angle = (angle0 / (2 * Math.PI) + fractionValue) * 2 * Math.PI;
      const el = {
        angle,
        angle0,
        color: pieChartColors[idx % pieChartColors.length],
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
