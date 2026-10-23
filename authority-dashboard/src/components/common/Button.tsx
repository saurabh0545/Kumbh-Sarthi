import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'saffron' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  disabled,
  style,
  ...props
}) => {
  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '13px', gap: '6px' },
    md: { padding: '9px 16px', fontSize: '14px', gap: '8px' },
    lg: { padding: '12px 22px', fontSize: '15px', gap: '10px' },
  }[size];

  const variantStyles = {
    primary: {
      backgroundColor: '#123B5D',
      color: '#FFFFFF',
      border: '1px solid #0A2540',
    },
    saffron: {
      backgroundColor: '#F47C20',
      color: '#FFFFFF',
      border: '1px solid #D9650E',
    },
    outline: {
      backgroundColor: '#FFFFFF',
      color: '#123B5D',
      border: '1px solid #CBD5E1',
    },
    danger: {
      backgroundColor: '#DC2626',
      color: '#FFFFFF',
      border: '1px solid #B91C1C',
    },
    success: {
      backgroundColor: '#16A34A',
      color: '#FFFFFF',
      border: '1px solid #15803D',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#475569',
      border: '1px solid transparent',
    },
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        borderRadius: '8px',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.6 : 1,
        transition: 'all 0.15s ease-in-out',
        boxShadow: variant !== 'ghost' && variant !== 'outline' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
        ...sizeStyles,
        ...variantStyles,
        ...style,
      }}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.7s linear infinite',
          }}
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
