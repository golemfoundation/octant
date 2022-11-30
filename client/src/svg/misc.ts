import { SvgImageConfig } from 'components/core/svg/types';

export const tick: SvgImageConfig = {
  markup:
    '<path stroke="#271558" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1.407 6.664 2.938 3.752 8.485-8.485"/>',
  viewBox: '0 0 14 12',
};

export const cross: SvgImageConfig = {
  markup:
    '<path stroke="#271558" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 9.485 9.485 1M9.485 9.485 1 1"/>',
  viewBox: '0 0 11 11',
};

export const plus: SvgImageConfig = {
  markup:
    '<path stroke="#EBEBEB" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1.344 7.657h12M7.344 13.657v-12"/>',
  viewBox: '0 0 15 15',
};

export const minus: SvgImageConfig = {
  markup:
    '<path stroke="#EBEBEB" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1.001h12"/>',
  viewBox: '0 0 14 2',
};

export const notificationIcon: SvgImageConfig = {
  markup:
    '<path fill="#141DEF" d="M11.55.12a.902.902 0 0 1 .9 0l11.1 6.408c.278.161.45.46.45.781v12.816c0 .322-.172.62-.45.78l-11.1 6.408a.902.902 0 0 1-.9 0L.45 20.905a.902.902 0 0 1-.45-.78V7.309c0-.322.172-.62.45-.78L11.55.12Z"/><path fill="#fff" d="M11.05 16.53h2.058l.32-5.27V7.5H10.73v3.76l.319 5.27ZM12.079 21c.87 0 1.596-.71 1.596-1.561 0-.87-.727-1.597-1.596-1.597-.87 0-1.579.728-1.579 1.597 0 .851.71 1.561 1.579 1.561Z"/>',
  viewBox: '0 0 24 28',
};
