import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  testId?: string;
}

/**
 * Container Component
 * 
 * A layout component that provides responsive max-width and padding for consistent spacing.
 * 
 * Features:
 * - Max-width: 1440px (desktop), 768px (tablet), 100% (mobile)
 * - Responsive padding: 24px (desktop), 16px (tablet), 12px (mobile)
 * - Centered alignment with margin auto
 * 
 * @example
 * <Container>
 *   <h1>Page Title</h1>
 *   <p>Page content goes here</p>
 * </Container>
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  testId,
}) => {
  return (
    <div
      className={`
        w-full
        mx-auto
        px-sm
        mobile:px-sm
        tablet:px-md
        desktop:px-lg
        max-w-full
        tablet:max-w-container-tablet
        desktop:max-w-container-desktop
        ${className}
      `}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

export default Container;
