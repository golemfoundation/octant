import { SvgImageConfig } from 'components/ui/Svg/types';

export const pending: SvgImageConfig = {
  markup:
    '<circle cx="6" cy="6" r="6" fill="#F6C54B"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 6h6"/>',
  viewBox: '0 0 12 12',
};

export const completed: SvgImageConfig = {
  markup:
    '<circle cx="6" cy="6" r="6" fill="#2D9B87"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.819 6.127 5.056 7.47l3.182-3.182"/>',
  viewBox: '0 0 12 12',
};
