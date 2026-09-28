/**
 * Classes compartilhadas — Heurística 4 (Consistência e padrões).
 * Todo botão, campo e selo da aplicação sai daqui, para que a mesma ação
 * tenha sempre a mesma aparência.
 */

export const cx = (...classes) => classes.filter(Boolean).join(' ');

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors ' +
  'disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap';

const sizes = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-[15px]',
  icon: 'h-9 w-9 text-sm',
  iconSm: 'h-8 w-8 text-sm',
};

const variants = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover shadow-card',
  secondary: 'bg-surface text-fg border border-line hover:bg-surface-2 hover:border-line-strong',
  ghost: 'text-muted hover:text-fg hover:bg-surface-2',
  danger: 'bg-danger text-white hover:opacity-90',
  dangerGhost: 'text-muted hover:text-danger hover:bg-danger-soft',
};

export function btn(variant = 'secondary', size = 'md', extra = '') {
  return cx(base, sizes[size], variants[variant], extra);
}

export const inputClass =
  'w-full h-10 px-3 rounded-lg bg-surface border border-line text-sm text-fg placeholder:text-subtle ' +
  'transition-colors hover:border-line-strong focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 ' +
  'aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/25';

export const labelClass = 'block text-[13px] font-medium text-fg mb-1.5';
export const hintClass = 'mt-1.5 text-[13px] text-muted';
export const errorClass = 'mt-1.5 text-[13px] text-danger flex items-start gap-1.5';

export const cardClass = 'rounded-xl bg-surface border border-line shadow-card';

export const tones = {
  success: 'bg-success-soft text-success border-success/30',
  warning: 'bg-warning-soft text-warning border-warning/30',
  danger: 'bg-danger-soft text-danger border-danger/30',
  neutral: 'bg-surface-2 text-muted border-line',
  accent: 'bg-accent-soft text-accent-text border-accent/25',
};

export function badge(tone = 'neutral', extra = '') {
  return cx(
    'inline-flex items-center gap-1 h-6 px-2 rounded-md border text-xs font-medium whitespace-nowrap',
    tones[tone],
    extra
  );
}
