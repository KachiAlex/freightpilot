import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Button } from './Button';
import '@testing-library/jest-dom';

/**
 * Unit tests for Button component
 * Tests all variants, sizes, states, and accessibility features
 * 
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 10.4
 */

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render a button with text content', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it('should render with default variant (primary)', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary-blue');
      expect(button).toHaveClass('text-neutral-white');
    });

    it('should render with secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-2');
      expect(button).toHaveClass('border-primary-blue');
      expect(button).toHaveClass('text-primary-blue');
      expect(button).toHaveClass('bg-transparent');
    });
  });

  describe('Sizes', () => {
    it('should render with large size (48px height)', () => {
      render(<Button size="large">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-12');
      expect(button).toHaveClass('px-8');
      expect(button).toHaveClass('text-lg');
    });

    it('should render with regular size (44px height) by default', () => {
      render(<Button>Regular</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11');
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('text-base');
    });

    it('should render with small size (36px height)', () => {
      render(<Button size="small">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('text-sm');
    });
  });

  describe('States', () => {
    it('should render in disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });

    it('should have aria-disabled attribute when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should have hover styles applied', () => {
      render(<Button>Hover</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-primary-blue-dark');
      expect(button).toHaveClass('hover:shadow-button-hover');
      expect(button).toHaveClass('hover:-translate-y-0.5');
    });

    it('should have active styles applied', () => {
      render(<Button>Active</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('active:scale-95');
    });

    it('should have focus styles applied', () => {
      render(<Button>Focus</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-2');
      expect(button).toHaveClass('focus-visible:outline-offset-2');
      expect(button).toHaveClass('focus-visible:outline-primary-blue');
    });
  });

  describe('Loading State', () => {
    it('should render spinner when loading', () => {
      render(<Button isLoading>Loading</Button>);
      const spinner = screen.getByRole('button').querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should display loading text with spinner', () => {
      render(<Button isLoading>Loading</Button>);
      expect(screen.getByText('Loading')).toBeInTheDocument();
    });

    it('should disable button when loading', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should have aria-disabled when loading', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should apply opacity to loading state', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('opacity-75');
      expect(button).toHaveClass('pointer-events-none');
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label prop', () => {
      render(<Button ariaLabel="Submit form">Submit</Button>);
      const button = screen.getByRole('button', { name: /submit form/i });
      expect(button).toBeInTheDocument();
    });

    it('should have proper focus indicator styles', () => {
      render(<Button>Focus Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none');
      expect(button).toHaveClass('focus-visible:outline-2');
      expect(button).toHaveClass('focus-visible:outline-offset-2');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalled();
    });

    it('should have semantic button element', () => {
      render(<Button>Semantic</Button>);
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should support custom aria attributes', () => {
      render(
        <Button aria-describedby="help-text">
          Help
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'help-text');
    });
  });

  describe('Variants', () => {
    it('should apply primary variant styles correctly', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary-blue');
      expect(button).toHaveClass('text-neutral-white');
      expect(button).toHaveClass('hover:bg-primary-blue-dark');
    });

    it('should apply secondary variant styles correctly', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('border-2');
      expect(button).toHaveClass('border-primary-blue');
      expect(button).toHaveClass('text-primary-blue');
      expect(button).toHaveClass('hover:bg-primary-blue-light');
    });

    it('should have different hover states for each variant', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-primary-blue-dark');

      rerender(<Button variant="secondary">Secondary</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-primary-blue-light');
    });
  });

  describe('Touch Target Size', () => {
    it('should have minimum 44px height for regular size', () => {
      render(<Button size="regular">Touch</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11'); // 44px
    });

    it('should have minimum 44px height for large size', () => {
      render(<Button size="large">Touch</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-12'); // 48px
    });

    it('should have 36px height for small size', () => {
      render(<Button size="small">Touch</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9'); // 36px
    });
  });

  describe('Focus Indicator', () => {
    it('should have 2px outline on focus', () => {
      render(<Button>Focus</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-2');
    });

    it('should have 2px offset on focus', () => {
      render(<Button>Focus</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-offset-2');
    });

    it('should have primary blue outline color', () => {
      render(<Button>Focus</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-primary-blue');
    });
  });

  describe('Transitions', () => {
    it('should have 200ms transition duration', () => {
      render(<Button>Transition</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('duration-200');
    });

    it('should use ease-in-out timing function', () => {
      render(<Button>Transition</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('ease-in-out');
    });

    it('should have transition-all property', () => {
      render(<Button>Transition</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-all');
    });
  });

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should accept onClick handler', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      
      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should accept type prop', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should accept data attributes', () => {
      render(<Button data-testid="custom-button">Data</Button>);
      const button = screen.getByTestId('custom-button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to button element', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('should allow ref to be used for imperative operations', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref</Button>);
      expect(ref.current?.click).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(<Button>{''}</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle multiple children elements', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.querySelectorAll('span')).toHaveLength(2);
    });

    it('should handle disabled and loading together', () => {
      render(<Button disabled isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not trigger click when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      
      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Display Name', () => {
    it('should have correct display name for debugging', () => {
      expect(Button.displayName).toBe('Button');
    });
  });
});
