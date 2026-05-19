import React, { type ReactNode } from 'react';

/**
 * Button component with multiple variants, sizes, and states
 * Supports primary and secondary variants with large, regular, and small sizes
 * Includes loading state with spinner and full accessibility support
 * 
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 10.4
 */

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'large' | 'regular' | 'small';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Whether the button is in a loading state */
  isLoading?: boolean;
  /** Content to display in the button */
  children: ReactNode;
  /** Optional CSS class name */
  className?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Accessible label for the button */
  ariaLabel?: string;
}

/**
 * Button Component
 * 
 * Features:
 * - Primary and secondary variants with distinct styling
 * - Three sizes: large (48px), regular (44px), small (36px)
 * - Full state support: default, hover, active, disabled, focus
 * - 44px minimum touch target height (regular and large sizes)
 * - Loading state with animated spinner
 * - Proper focus indicators with 2px outline and 2px offset
 * - Full accessibility attributes (aria-label, aria-disabled)
 * - Smooth transitions (200ms ease-in-out)
 * - GPU-accelerated hover animations
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'regular',
      isLoading = false,
      children,
      className = '',
      disabled = false,
      ariaLabel,
      ...props
    },
    ref
  ) => {
    // Base styles applied to all buttons
    const baseStyles = [
      'inline-flex',
      'items-center',
      'justify-center',
      'font-sans',
      'font-semibold',
      'rounded-sm',
      'transition-all',
      'duration-200',
      'ease-in-out',
      'cursor-pointer',
      'border-none',
      'focus:outline-none',
      'focus-visible:outline-2',
      'focus-visible:outline-offset-2',
      'focus-visible:ring-0',
      'disabled:cursor-not-allowed',
      'disabled:opacity-50',
      'active:scale-95',
    ];

    // Size-specific styles
    const sizeStyles = {
      large: [
        'h-12',
        'px-8',
        'text-lg',
        'min-w-12',
      ],
      regular: [
        'h-11',
        'px-6',
        'text-base',
        'min-w-11',
      ],
      small: [
        'h-9',
        'px-4',
        'text-sm',
        'min-w-9',
      ],
    };

    // Variant-specific styles
    const variantStyles = {
      primary: [
        'bg-primary-blue',
        'text-neutral-white',
        'hover:bg-primary-blue-dark',
        'hover:shadow-button-hover',
        'hover:-translate-y-0.5',
        'active:bg-blue-900',
        'focus-visible:outline-primary-blue',
      ],
      secondary: [
        'bg-transparent',
        'border-2',
        'border-primary-blue',
        'text-primary-blue',
        'hover:bg-primary-blue-light',
        'hover:border-primary-blue-dark',
        'hover:text-primary-blue-dark',
        'active:bg-blue-100',
        'focus-visible:outline-primary-blue',
      ],
    };

    // Loading state styles
    const loadingStyles = isLoading ? ['opacity-75', 'pointer-events-none'] : [];

    // Combine all styles
    const allStyles = [
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...loadingStyles,
      className,
    ].join(' ');

    return (
      <button
        ref={ref}
        className={allStyles}
        disabled={disabled || isLoading}
        aria-label={ariaLabel}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            {/* Spinner */}
            <span className="inline-flex items-center justify-center mr-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
