import { SvgImageConfig } from 'components/ui/Svg/types';

import styles from './style.module.scss';

export const allocate: SvgImageConfig = {
  className: styles.allocate,
  markup:
    '<path stroke="#171717" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m13.6 15.131-4.426-4.623A2.623 2.623 0 0 1 12.883 6.8l.723.725.724-.725a2.622 2.622 0 1 1 3.708 3.71L13.6 15.13ZM10 27.133a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 27.133a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path stroke="#171717" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m4 10.333 2.485 8.413a1.6 1.6 0 0 0 1.546 1.187h11.54a1.6 1.6 0 0 0 1.549-1.187L24.574 5.78A2.4 2.4 0 0 1 26.893 4H28"/>',
  viewBox: '0 0 32 32',
};

export const metrics: SvgImageConfig = {
  markup:
    '<g stroke="#CDD1CD" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" clip-path="url(#metrics)"><path d="M16 27.25c6.213 0 11.25-5.037 11.25-11.25S22.213 4.75 16 4.75 4.75 9.787 4.75 16 9.787 27.25 16 27.25Z"/><path d="M21.25 21.25h-10.5V11.5"/><path d="m10.75 17.5 3-2.187a.377.377 0 0 1 .553.164l2.531 2.545a.375.375 0 0 0 .666.046L19 15.08a.372.372 0 0 1 .231-.171l2.1-.409"/></g><defs><clipPath id="metrics"><path fill="#fff" d="M4 4h24v24H4z"/></clipPath></defs>',
  viewBox: '0 0 32 32',
};

export const project: SvgImageConfig = {
  markup:
    '<path stroke="#CDD1CD" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.53 27.25H25c1.281 0 2-.906 2-2.25V7c0-1-.5-2.25-2-2.25H6.53C5.122 4.75 4.5 5.757 4.5 7v18c0 1.243.751 2.25 2.03 2.25ZM16.219 16.5h-6M21.219 19.5h-11M17.219 22.5h-7"/><path stroke="#CDD1CD" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.219 11.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" clip-rule="evenodd"/>',
  viewBox: '0 0 32 32',
};

export const settings: SvgImageConfig = {
  markup:
    '<path d="M9.79 3.032a1.63 1.63 0 0 0 2.423 0L13 2.167a1.632 1.632 0 0 1 2.842 1.177l-.06 1.167a1.633 1.633 0 0 0 1.71 1.712l1.166-.06a1.632 1.632 0 0 1 1.175 2.842l-.868.784a1.633 1.633 0 0 0 0 2.424l.868.783a1.632 1.632 0 0 1-1.177 2.842l-1.167-.06a1.633 1.633 0 0 0-1.713 1.714l.059 1.167A1.632 1.632 0 0 1 13 19.834l-.784-.868a1.632 1.632 0 0 0-2.424 0l-.787.868a1.633 1.633 0 0 1-2.838-1.174l.06-1.166a1.632 1.632 0 0 0-1.714-1.714l-1.166.06A1.632 1.632 0 0 1 2.168 13l.867-.783a1.633 1.633 0 0 0 0-2.424l-.867-.788a1.632 1.632 0 0 1 1.174-2.838l1.166.06a1.632 1.632 0 0 0 1.715-1.718l-.055-1.167a1.632 1.632 0 0 1 2.838-1.175l.783.865Z" stroke="#171717" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 14.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" stroke="#171717" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  viewBox: '0 0 22 22',
};

export const chevronLeft: SvgImageConfig = {
  markup:
    '<path stroke="#CDD1CD" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.515 24.485 10.029 16l8.486-8.485"/>',
  viewBox: '0 0 32 32',
};
