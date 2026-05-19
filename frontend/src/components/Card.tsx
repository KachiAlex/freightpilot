import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  testId?: string;
  style?: React.CSSProperties;
}

/**
 * Card Component
 * 
 * A reusable card component with consistent styling, shadows, and hover effects.
 * 
 * Features:
 * - 12px border-radius, 24px padding, white background
 * - 1px border (#E5E7EB), default shadow 0 1px 3px rgba(0,0,0,0.1)
 * - Hover state with shadow 0 4px 12px rgba(0,0,0,0.15) and -4px translateY
 * - 300ms ease-in-out transition
 * 
 * @example
 * <Card>
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </Card>
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  testId,
  style,
}) => {
  return (
    <div
      className={`
        rounded-md
        p-lg
        bg-neutral-white
        border border-neutral-border
        shadow-card-default
        transition-all
        duration-300
        ease-in-out
        hover:shadow-card-hover
        hover:-translate-y-1
        focus:outline-none
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-primary-blue
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      data-testid={testId}
      style={style}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
};

export default Card;
