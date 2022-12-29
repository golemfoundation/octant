import { SvgImageConfig } from 'components/core/svg/types';

export const arrow: SvgImageConfig = {
  markup:
    '<path stroke="#141DEF" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.434 1.7h6.441v6.528"/><path stroke="#141DEF" stroke-linecap="round" stroke-width="2" d="M1-1h9.118" transform="matrix(-.69444 .71955 -.71011 -.70409 8.596 1)"/>',
  viewBox: '0 0 10 10',
};

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

export const donorGenericIcon: SvgImageConfig = {
  markup:
    '<path fill="#1D4558" d="M12 0c8.868 0 12 3.147 12 12 0 8.82-3.184 12-12 12-8.79 0-12-3.22-12-12C0 3.187 3.158 0 12 0Z"/><path fill="#fff" fill-rule="evenodd" d="M12.003 7.54 8.14 9.77v4.46l3.862 2.23 3.862-2.23V9.77l-3.862-2.23Zm.619-1.374a1.238 1.238 0 0 0-1.239 0L7.26 8.546c-.383.222-.62.63-.62 1.073v4.762c0 .442.237.851.62 1.072l4.123 2.381c.384.221.856.221 1.239 0l4.124-2.38c.383-.222.619-.63.619-1.073V9.619c0-.442-.236-.851-.62-1.072l-4.123-2.381Z" clip-rule="evenodd"/>',
  viewBox: '0 0 24 24',
};
