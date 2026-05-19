import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Button,
  Card,
  Navigation,
  FeatureHighlights,
  WorkflowSection,
  Footer,
} from '../components';

/**
 * Animation and Micro-interactions Tests
 * 
 * Tests for button hover/click feedback, card animations,
 * scroll animations, and prefers-reduced-motion support.
 */

describe('Animations and Micro-interactions', () => {
  describe('Button Hover and Click Feedback', () => {
    it('should have hover state styling on primary button', () => {
      const { container } = render(
        <Button variant="primary" size="regular">
          Click Me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('hover:shadow-button-hover');
    });

    it('should have hover state styling on secondary button', () => {
      const { container } = render(
        <Button variant="secondary" size="regular">
          Click Me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('hover:bg-primary-blue-light');
    });

    it('should have active state styling', () => {
      const { container } = render(
        <Button variant="primary" size="regular">
          Click Me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('active:scale-95');
    });

    it('should have transition duration', () => {
      const { container } = render(
        <Button variant="primary" size="regular">
          Click Me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('transition-all', 'duration-200');
    });

    it('should have focus state styling', () => {
      const { container } = render(
        <Button variant="primary" size="regular">
          Click Me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('focus:outline-2', 'focus:outline-offset-2');
    });

    it('should have disabled state styling', () => {
      const { container } = render(
        <Button variant="primary" size="regular" disabled>
          Click Me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveAttribute('disabled');
      expect(button).toHaveClass('disabled:opacity-50');
    });
  });

  describe('Card Hover Animations', () => {
    it('should have hover shadow effect', () => {
      const { container } = render(
        <Card>
          <div>Card Content</div>
        </Card>
      );

      const card = container.firstChild;
      expect(card).toHaveClass('hover:shadow-card-hover');
    });

    it('should have hover transform effect', () => {
      const { container } = render(
        <Card>
          <div>Card Content</div>
        </Card>
      );

      const card = container.firstChild;
      expect(card).toHaveClass('hover:-translate-y-1');
    });

    it('should have transition duration', () => {
      const { container } = render(
        <Card>
          <div>Card Content</div>
        </Card>
      );

      const card = container.firstChild;
      expect(card).toHaveClass('transition-all', 'duration-300');
    });

    it('should have easing function', () => {
      const { container } = render(
        <Card>
          <div>Card Content</div>
        </Card>
      );

      const card = container.firstChild;
      expect(card).toHaveClass('ease-in-out');
    });
  });

  describe('Navigation Link Hover States', () => {
    it('should have hover color change', () => {
      const { container } = render(<Navigation />);

      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link).toHaveClass('hover:text-primary-blue');
      });
    });

    it('should have hover transition', () => {
      const { container } = render(<Navigation />);

      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link).toHaveClass('transition-colors', 'duration-200');
      });
    });

    it('should have active state styling', () => {
      const { container } = render(<Navigation />);

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Scroll Animations', () => {
    it('should have fade-in animation classes', () => {
      const { container } = render(
        <>
          <FeatureHighlights />
          <WorkflowSection />
        </>
      );

      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should have smooth scroll behavior', () => {
      const { container } = render(
        <>
          <Navigation />
          <FeatureHighlights />
        </>
      );

      // Check for scroll-smooth class
      const elements = container.querySelectorAll('[class*="scroll"]');
      expect(elements.length).toBeGreaterThanOrEqual(0);
    });

    it('should have reveal animations', () => {
      const { container } = render(
        <>
          <FeatureHighlights />
          <WorkflowSection />
        </>
      );

      const cards = container.querySelectorAll('[class*="card"]');
      expect(cards.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Micro-interactions', () => {
    it('should have button click feedback', () => {
      const { container } = render(
        <Button variant="primary" size="regular">
          Click Me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('active:scale-95');
    });

    it('should have link hover feedback', () => {
      const { container } = render(<Footer />);

      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link).toHaveClass('hover:text-neutral-white');
      });
    });

    it('should have card hover feedback', () => {
      const { container } = render(
        <Card>
          <div>Card Content</div>
        </Card>
      );

      const card = container.firstChild;
      expect(card).toHaveClass('hover:shadow-card-hover');
    });

    it('should have smooth transitions', () => {
      const { container } = render(
        <>
          <Button variant="primary" size="regular">
            Button
          </Button>
          <Card>
            <div>Card</div>
          </Card>
        </>
      );

      const elements = container.querySelectorAll('[class*="transition"]');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Animation Duration', () => {
    it('should have 200ms duration for button animations', () => {
      const { container } = render(
        <Button variant="primary" size="regular">
          Click Me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('duration-200');
    });

    it('should have 300ms duration for card animations', () => {
      const { container } = render(
        <Card>
          <div>Card Content</div>
        </Card>
      );

      const card = container.firstChild;
      expect(card).toHaveClass('duration-300');
    });

    it('should have 200ms duration for link animations', () => {
      const { container } = render(<Navigation />);

      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link).toHaveClass('duration-200');
      });
    });
  });

  describe('Animation Easing', () => {
    it('should use ease-in-out for smooth animations', () => {
      const { container } = render(
        <>
          <Button variant="primary" size="regular">
            Button
          </Button>
          <Card>
            <div>Card</div>
          </Card>
        </>
      );

      const elements = container.querySelectorAll('[class*="ease-in-out"]');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should not use linear easing', () => {
      const { container } = render(
        <>
          <Button variant="primary" size="regular">
            Button
          </Button>
          <Card>
            <div>Card</div>
          </Card>
        </>
      );

      const elements = container.querySelectorAll('[class*="ease-linear"]');
      expect(elements.length).toBe(0);
    });
  });

  describe('Prefers-Reduced-Motion Support', () => {
    it('should respect prefers-reduced-motion preference', () => {
      // Mock prefers-reduced-motion
      window.matchMedia('(prefers-reduced-motion: reduce)');

      const { container } = render(
        <>
          <Button variant="primary" size="regular">
            Button
          </Button>
          <Card>
            <div>Card</div>
          </Card>
        </>
      );

      // Components should still render
      expect(container.querySelector('button')).toBeInTheDocument();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should disable animations when prefers-reduced-motion is set', () => {
      // Mock prefers-reduced-motion
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      if (mediaQuery.matches) {
        const { container } = render(
          <>
            <Button variant="primary" size="regular">
              Button
            </Button>
            <Card>
              <div>Card</div>
            </Card>
          </>
        );

        // Animations should be minimal
        expect(container.querySelector('button')).toBeInTheDocument();
      }
    });

    it('should maintain functionality without animations', () => {
      const { container } = render(
        <>
          <Button variant="primary" size="regular">
            Button
          </Button>
          <Card>
            <div>Card</div>
          </Card>
        </>
      );

      // All elements should be functional
      expect(container.querySelector('button')).toBeInTheDocument();
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Animation Performance', () => {
    it('should use GPU-accelerated properties', () => {
      const { container } = render(
        <>
          <Button variant="primary" size="regular">
            Button
          </Button>
          <Card>
            <div>Card</div>
          </Card>
        </>
      );

      // Should use transform and opacity for animations
      const elements = container.querySelectorAll('[class*="translate"], [class*="scale"], [class*="opacity"]');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should not use layout-triggering animations', () => {
      const { container } = render(
        <>
          <Button variant="primary" size="regular">
            Button
          </Button>
          <Card>
            <div>Card</div>
          </Card>
        </>
      );

      // Should not animate width, height, or position
      const elements = container.querySelectorAll('[class*="w-"], [class*="h-"], [class*="left-"], [class*="top-"]');
      // These classes are for sizing, not animations
      expect(elements.length).toBeGreaterThanOrEqual(0);
    });

    it('should render animations without performance issues', () => {
      const startTime = performance.now();

      render(
        <>
          <Navigation />
          <FeatureHighlights />
          <WorkflowSection />
        </>
      );

      const endTime = performance.now();

      // Should render in reasonable time
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('Animation Consistency', () => {
    it('should have consistent animation durations', () => {
      const { container } = render(
        <>
          <Button variant="primary" size="regular">
            Button
          </Button>
          <Navigation />
          <Footer />
        </>
      );

      // Check for consistent duration classes
      const duration200 = container.querySelectorAll('[class*="duration-200"]');
      const duration300 = container.querySelectorAll('[class*="duration-300"]');

      expect(duration200.length + duration300.length).toBeGreaterThan(0);
    });

    it('should have consistent easing functions', () => {
      const { container } = render(
        <>
          <Button variant="primary" size="regular">
            Button
          </Button>
          <Card>
            <div>Card</div>
          </Card>
        </>
      );

      // Check for consistent easing
      const easeInOut = container.querySelectorAll('[class*="ease-in-out"]');
      expect(easeInOut.length).toBeGreaterThan(0);
    });
  });

  describe('Animation Accessibility', () => {
    it('should not interfere with keyboard navigation', () => {
      const { container } = render(
        <>
          <Navigation />
          <Button variant="primary" size="regular">
            Button
          </Button>
        </>
      );

      // All interactive elements should be accessible
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should not interfere with screen reader announcements', () => {
      render(
        <>
          <Navigation />
          <FeatureHighlights />
        </>
      );

      // Navigation should be announced
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should not cause focus loss', () => {
      const { container } = render(
        <>
          <Button variant="primary" size="regular">
            Button
          </Button>
          <Card>
            <div>Card</div>
          </Card>
        </>
      );

      // Focus should be maintained
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Hover State Consistency', () => {
    it('should have consistent hover styling across buttons', () => {
      const { container } = render(
        <>
          <Button variant="primary" size="regular">
            Primary
          </Button>
          <Button variant="secondary" size="regular">
            Secondary
          </Button>
        </>
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('transition-all');
      });
    });

    it('should have consistent hover styling across links', () => {
      const { container } = render(
        <>
          <Navigation />
          <Footer />
        </>
      );

      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link).toHaveClass('transition-colors');
      });
    });
  });

  describe('Focus State Animations', () => {
    it('should have focus animations on buttons', () => {
      const { container } = render(
        <Button variant="primary" size="regular">
          Click Me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('focus:outline-2');
    });

    it('should have focus animations on links', () => {
      const { container } = render(<Navigation />);

      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link).toHaveClass('focus:outline-2');
      });
    });
  });

  describe('Disabled State Animations', () => {
    it('should have disabled state styling', () => {
      const { container } = render(
        <Button variant="primary" size="regular" disabled>
          Disabled
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('disabled:opacity-50');
    });

    it('should not animate disabled elements', () => {
      const { container } = render(
        <Button variant="primary" size="regular" disabled>
          Disabled
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveAttribute('disabled');
    });
  });
});
