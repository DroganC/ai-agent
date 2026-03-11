import { ReactNode } from 'react';
import { Button as AMButton } from 'antd-mobile';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export const Button = ({
  children,
  variant = 'primary',
  full,
  onClick,
  disabled,
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  full?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const map: Record<ButtonVariant, { color?: 'primary'; fill?: 'solid' | 'outline' | 'none' }> = {
    primary: { color: 'primary', fill: 'solid' },
    secondary: { color: 'primary', fill: 'outline' },
    ghost: { color: 'primary', fill: 'none' },
  };
  return (
    <AMButton
      onClick={onClick}
      disabled={disabled}
      block={full}
      color={map[variant].color}
      fill={map[variant].fill}
      size="middle"
    >
      {children}
    </AMButton>
  );
};
