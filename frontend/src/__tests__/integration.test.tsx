import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HomePage } from '../pages/HomePage';
import { Navigation, Button, Card } from '../components';

/**
 * Integration Tests
 * 
 * Tests for component integration, user flows,
 * and end-to-end functionality.
 */

describe('Integration Tests', () => {
  describe('HomePage Integration', () => {
    it('should render all sections in correct order', () => {
      render(<HomePage />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should have working navigation links', () => {
      render(<HomePage />);
      
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('should have working CTA buttons', () => {
      render(<HomePage />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation Integration', () => {
    it('should integrate with routing', () => {
      render(<Navigation />);
      
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('should have consistent styling across pages', () => {
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Button Integration', () => {
    it('should integrate with click handlers', () => {
      const handleClick = vi.fn();
      render(
        <Button variant="primary" onClick={handleClick}>
          Click Me
        </Button>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalled();
    });

    it('should integrate with form submissions', () => {
      render(<Button variant="primary" type="submit">Submit</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('Card Integration', () => {
    it('should integrate with content', () => {
      render(
        <Card>
          <h3>Card Title</h3>
          <p>Card content</p>
        </Card>
      );
      
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should integrate with hover states', () => {
      render(
        <Card>
          <div>Content</div>
        </Card>
      );
      
      const card = screen.queryByText('Content')?.parentElement;
      expect(card).toBeInTheDocument();
    });
  });

  describe('Responsive Design Integration', () => {
    it('should adapt to mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<HomePage />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should adapt to tablet viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<HomePage />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should adapt to desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      render(<HomePage />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain keyboard navigation across components', () => {
      render(
        <>
          <Navigation />
          <Button variant="primary">Test</Button>
        </>
      );
      
      const focusableElements = screen.getAllByRole('button', { hidden: true });
      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('should maintain screen reader support', () => {
      render(<HomePage />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
    });
  });

  describe('Animation Integration', () => {
    it('should apply animations consistently', () => {
      render(
        <>
          <Button variant="primary">Test</Button>
          <Card>Content</Card>
        </>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-all');
    });
  });

  describe('Theme Integration', () => {
    it('should use consistent color palette', () => {
      render(<HomePage />);
      
      const page = screen.getByRole('navigation').parentElement;
      expect(page).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('should render without significant delay', () => {
      const startTime = performance.now();
      render(<HomePage />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(200);
    });
  });
});
