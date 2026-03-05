import { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export const Button = ({
  children,
  variant = 'primary',
  full,
  onClick,
  disabled,
  className = '',
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  full?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) => {
  const base = 'inline-flex items-center justify-center gap-2 text-sm font-medium rounded-[var(--radius-btn)] transition whitespace-nowrap';
  const sizing = 'h-9 px-3'; // 36px height
  const styleMap: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-white shadow-sm disabled:bg-gray-300 disabled:text-gray-500',
    secondary: 'bg-white border border-slate-200 text-gray-700 disabled:text-gray-400',
    ghost: 'bg-transparent text-primary',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizing} ${styleMap[variant]} ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};
