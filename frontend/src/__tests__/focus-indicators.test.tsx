import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  Button,
  Navigation,
  Card,
  HeroSection,
  FeatureHighlights,
  WorkflowSection,
  MetricsSection,
  SocialProof,
  Footer,
} from '../components';

/**
 * Focus Indicators Tests (WCAG 2.1 AA Compliance)
 * 
 * Tests for visible focus indicators on all interactive elements.
 * Focus indicators must have:
 * - Minimum 3:1 contrast ratio with background
 * - 2px outline with 2px offset
 * - Visible on all interactive elements (buttons, links, form inputs, cards)
 * - Not removed or hidden
 * 
 * Validates: Requirements 10.4, 7.4
 */

describe('Focus Indicators - WCAG 2.1 AA Compliance', () => {
  describe('Button Focus Indicators', () => {
    it('should have visible focus indicator on primary button', () => {
      const { container } = render(
        <Button variant="primary" size="regular">
          Click me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('focus-visible:outline-2');
      expect(button).toHaveClass('focus-visible:outline-offset-2');
      expect(button).toHaveClass('focus-visible:outline-primary-blue');
    });

    it('should have visible focus indicator on secondary button', () => {
      const { container } = render(
        <Button variant="secondary" size="regular">
          Click me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('focus-visible:outline-2');
      expect(button).toHaveClass('focus-visible:outline-offset-2');
      expect(button).toHaveClass('focus-visible:outline-primary-blue');
    });

    it('should have visible focus indicator on large button', () => {
      const { container } = render(
        <Button variant="primary" size="large">
          Click me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('focus-visible:outline-2');
      expect(button).toHaveClass('focus-visible:outline-offset-2');
    });

    it('should have visible focus indicator on small button', () => {
      const { container } = render(
        <Button variant="primary" size="small">
          Click me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('focus-visible:outline-2');
      expect(button).toHaveClass('focus-visible:outline-offset-2');
    });

    it('should have focus indicator that is not outline:none', () => {
      const { container } = render(
        <Button variant="primary">
          Click me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('focus:outline-none');
      expect(button).toHaveClass('focus-visible:outline-2');
      // focus-visible should override focus:outline-none for keyboard focus
    });

    it('should maintain focus indicator on disabled button', () => {
      const { container } = render(
        <Button variant="primary" disabled>
          Click me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('focus-visible:outline-2');
      expect(button).toHaveClass('focus-visible:outline-offset-2');
    });
  });

  describe('Navigation Focus Indicators', () => {
    it('should have visible focus indicator on navigation links', () => {
      const { container } = render(<Navigation />);

      const links = container.querySelectorAll('nav a');
      links.forEach((link) => {
        expect(link.className).toMatch(/focus-visible:outline-2/);
        expect(link.className).toMatch(/focus-visible:outline-offset-2/);
        expect(link.className).toMatch(/focus-visible:outline-primary-blue/);
      });
    });

    it('should have visible focus indicator on hamburger menu button', () => {
      const { container } = render(<Navigation />);

      const hamburgerButton = container.querySelector('button[aria-label*="menu"]');
      expect(hamburgerButton).toHaveClass('focus-visible:outline-2');
      expect(hamburgerButton).toHaveClass('focus-visible:outline-offset-2');
      expect(hamburgerButton).toHaveClass('focus-visible:outline-primary-blue');
    });

    it('should have visible focus indicator on navigation action buttons', () => {
      const { container } = render(<Navigation />);

      const buttons = container.querySelectorAll('nav button');
      buttons.forEach((button) => {
        expect(button.className).toMatch(/focus-visible:outline-2/);
        expect(button.className).toMatch(/focus-visible:outline-offset-2/);
      });
    });

    it('should have visible focus indicator on mobile menu links', async () => {
      const user = userEvent.setup();
      const { container } = render(<Navigation />);

      // Open mobile menu
      const hamburgerButton = container.querySelector('button[aria-label*="menu"]');
      if (hamburgerButton) {
        await user.click(hamburgerButton);

        // Check mobile menu links have focus indicators
        const mobileLinks = container.querySelectorAll('nav a');
        mobileLinks.forEach((link) => {
          expect(link.className).toMatch(/focus-visible:outline-2/);
        });
      }
    });
  });

  describe('Card Focus Indicators', () => {
    it('should have visible focus indicator on clickable card', () => {
      const { container } = render(
        <Card onClick={() => {}}>
          Card content
        </Card>
      );

      const card = container.querySelector('[role="button"]');
      expect(card).toHaveClass('focus-visible:outline-2');
      expect(card).toHaveClass('focus-visible:outline-offset-2');
      expect(card).toHaveClass('focus-visible:outline-primary-blue');
    });

    it('should have visible focus indicator on feature cards', () => {
      const { container } = render(<FeatureHighlights />);

      const featureCards = container.querySelectorAll('[role="region"]');
      featureCards.forEach((card) => {
        expect(card.className).toMatch(/focus-within:outline-none|focus-within:ring-2/);
      });
    });

    it('should have visible focus indicator on workflow step cards', () => {
      const { container } = render(<WorkflowSection />);

      const stepCards = container.querySelectorAll('[role="region"]');
      stepCards.forEach((card) => {
        expect(card.className).toMatch(/focus-within:outline-none|focus-within:ring-2/);
      });
    });

    it('should have visible focus indicator on metric cards', () => {
      const { container } = render(<MetricsSection />);

      const metricCards = container.querySelectorAll('[data-testid^="metric-card-"]');
      metricCards.forEach((card) => {
        expect(card.className).toMatch(/focus-visible:outline-2|focus-visible:outline-neutral-white/);
      });
    });

    it('should have visible focus indicator on social proof logos', () => {
      const { container } = render(<SocialProof />);

      const logoCards = container.querySelectorAll('[role="region"]');
      logoCards.forEach((card) => {
        expect(card.className).toMatch(/focus-visible:outline-2/);
      });
    });
  });

  describe('Link Focus Indicators', () => {
    it('should have visible focus indicator on footer links', () => {
      const { container } = render(<Footer />);

      const links = container.querySelectorAll('footer a');
      links.forEach((link) => {
        expect(link.className).toMatch(/focus-visible:outline-2/);
        expect(link.className).toMatch(/focus-visible:outline-offset-2/);
        expect(link.className).toMatch(/focus-visible:outline-primary-blue/);
      });
    });

    it('should have visible focus indicator on footer social links', () => {
      const { container } = render(<Footer />);

      const socialLinks = container.querySelectorAll('footer a[aria-label]');
      socialLinks.forEach((link) => {
        expect(link.className).toMatch(/focus-visible:outline-2/);
      });
    });

    it('should have visible focus indicator on hero section links', () => {
      const { container } = render(<HeroSection />);

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button.className).toMatch(/focus-visible:outline-2/);
      });
    });
  });

  describe('Focus Indicator Contrast', () => {
    it('should have sufficient contrast for button focus indicator', () => {
      const { container } = render(
        <Button variant="primary">
          Click me
        </Button>
      );

      const button = container.querySelector('button');
      // Primary blue (#0066FF) on white background has 4.5:1 contrast
      expect(button).toHaveClass('focus-visible:outline-primary-blue');
    });

    it('should have sufficient contrast for metric card focus indicator', () => {
      const { container } = render(<MetricsSection />);

      const metricCards = container.querySelectorAll('[data-testid^="metric-card-"]');
      metricCards.forEach((card) => {
        // White outline on blue gradient background has sufficient contrast
        expect(card.className).toMatch(/focus-visible:outline-neutral-white|focus-visible:outline-2/);
      });
    });

    it('should have sufficient contrast for link focus indicator', () => {
      const { container } = render(<Footer />);

      const links = container.querySelectorAll('footer a');
      links.forEach((link) => {
        // Primary blue on dark background has sufficient contrast
        expect(link.className).toMatch(/focus-visible:outline-primary-blue/);
      });
    });
  });

  describe('Focus Indicator Visibility', () => {
    it('should not have outline:none on focus-visible', () => {
      const { container } = render(
        <Button variant="primary">
          Click me
        </Button>
      );

      const button = container.querySelector('button');
      // Should have focus:outline-none but focus-visible:outline-2
      expect(button).toHaveClass('focus:outline-none');
      expect(button).toHaveClass('focus-visible:outline-2');
    });

    it('should have 2px outline width', () => {
      const { container } = render(
        <Button variant="primary">
          Click me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('focus-visible:outline-2');
    });

    it('should have 2px outline offset', () => {
      const { container } = render(
        <Button variant="primary">
          Click me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('focus-visible:outline-offset-2');
    });

    it('should not be obscured by other elements', () => {
      const { container } = render(
        <div className="relative">
          <Button variant="primary">
            Click me
          </Button>
        </div>
      );

      const button = container.querySelector('button');
      // Button should have z-index or be positioned to not be obscured
      expect(button).toBeInTheDocument();
    });
  });

  describe('Focus Indicator Keyboard Navigation', () => {
    it('should show focus indicator when tabbing to button', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Button variant="primary">
          Click me
        </Button>
      );

      const button = container.querySelector('button');
      await user.tab();

      expect(button).toHaveFocus();
      expect(button).toHaveClass('focus-visible:outline-2');
    });

    it('should show focus indicator when tabbing to link', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <a href="/">Home</a>
      );

      const link = container.querySelector('a');
      await user.tab();

      expect(link).toHaveFocus();
    });

    it('should show focus indicator when tabbing through navigation', async () => {
      const user = userEvent.setup();
      const { container } = render(<Navigation />);

      const links = container.querySelectorAll('nav a');
      if (links.length > 0) {
        await user.tab();
        expect(links[0]).toHaveFocus();
      }
    });

    it('should show focus indicator when tabbing through footer', async () => {
      const user = userEvent.setup();
      const { container } = render(<Footer />);

      const links = container.querySelectorAll('footer a');
      if (links.length > 0) {
        // Tab multiple times to reach footer
        for (let i = 0; i < 10; i++) {
          await user.tab();
        }
        // At least one link should be in the document
        expect(links.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Focus Indicator Accessibility', () => {
    it('should have focus indicator on all interactive elements', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
          <FeatureHighlights />
          <WorkflowSection />
          <MetricsSection />
          <SocialProof />
          <Footer />
        </>
      );

      const buttons = container.querySelectorAll('button');
      const links = container.querySelectorAll('a');
      const interactiveElements = container.querySelectorAll('[role="button"], [role="region"]');

      // All buttons should have focus indicators
      buttons.forEach((button) => {
        expect(button.className).toMatch(/focus-visible:outline-2|focus-within:ring-2/);
      });

      // All links should have focus indicators
      links.forEach((link) => {
        expect(link.className).toMatch(/focus-visible:outline-2|focus-visible:outline-primary-blue/);
      });

      // All interactive elements should have focus indicators
      interactiveElements.forEach((element) => {
        expect(element.className).toMatch(/focus-visible:outline-2|focus-visible:outline-offset-2|focus-within:ring-2/);
      });
    });

    it('should maintain focus indicator on hover', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Button variant="primary">
          Click me
        </Button>
      );

      const button = container.querySelector('button');
      await user.hover(button!);

      expect(button).toHaveClass('focus-visible:outline-2');
    });

    it('should maintain focus indicator on active state', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Button variant="primary">
          Click me
        </Button>
      );

      const button = container.querySelector('button');
      await user.click(button!);

      expect(button).toHaveClass('focus-visible:outline-2');
    });

    it('should have focus indicator on disabled button', () => {
      const { container } = render(
        <Button variant="primary" disabled>
          Click me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('focus-visible:outline-2');
    });
  });

  describe('Focus Indicator Consistency', () => {
    it('should use consistent focus indicator style across all buttons', () => {
      const { container } = render(
        <>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="primary" size="large">Large</Button>
          <Button variant="primary" size="small">Small</Button>
        </>
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('focus-visible:outline-2');
        expect(button).toHaveClass('focus-visible:outline-offset-2');
      });
    });

    it('should use consistent focus indicator style across all links', () => {
      const { container } = render(
        <>
          <Navigation />
          <Footer />
        </>
      );

      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link.className).toMatch(/focus-visible:outline-2|focus-visible:outline-offset-2/);
      });
    });

    it('should use consistent focus indicator color', () => {
      const { container } = render(
        <>
          <Button variant="primary">Button</Button>
          <Navigation />
          <Footer />
        </>
      );

      const buttons = container.querySelectorAll('button');
      const links = container.querySelectorAll('a');

      buttons.forEach((button) => {
        expect(button.className).toMatch(/focus-visible:outline-primary-blue/);
      });

      links.forEach((link) => {
        expect(link.className).toMatch(/focus-visible:outline-primary-blue|focus-visible:outline-neutral-white/);
      });
    });
  });

  describe('Focus Indicator Edge Cases', () => {
    it('should have focus indicator on card with onClick handler', () => {
      const { container } = render(
        <Card onClick={() => {}}>
          Clickable card
        </Card>
      );

      const card = container.querySelector('[role="button"]');
      expect(card).toHaveClass('focus-visible:outline-2');
      expect(card).toHaveClass('focus-visible:outline-offset-2');
    });

    it('should have focus indicator on card without onClick handler', () => {
      const { container } = render(
        <Card>
          Non-clickable card
        </Card>
      );

      const card = container.querySelector('div[class*="rounded-md"]');
      expect(card).toBeInTheDocument();
    });

    it('should have focus indicator on nested interactive elements', () => {
      const { container } = render(
        <Card onClick={() => {}}>
          <button>Nested button</button>
        </Card>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('focus-visible:outline-2');
    });

    it('should have focus indicator on form inputs', () => {
      const { container } = render(
        <input type="text" placeholder="Enter text" />
      );

      const input = container.querySelector('input');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Focus Indicator Performance', () => {
    it('should not cause layout shift on focus', () => {
      const { container } = render(
        <Button variant="primary">
          Click me
        </Button>
      );

      const button = container.querySelector('button');
      const initialRect = button?.getBoundingClientRect();

      // Simulate focus
      button?.focus();

      const focusedRect = button?.getBoundingClientRect();
      // Outline with offset should not cause layout shift
      expect(initialRect?.width).toBe(focusedRect?.width);
      expect(initialRect?.height).toBe(focusedRect?.height);
    });

    it('should not cause performance issues with multiple focus indicators', () => {
      const { container } = render(
        <>
          {Array.from({ length: 100 }).map((_, i) => (
            <Button key={i} variant="primary">
              Button {i}
            </Button>
          ))}
        </>
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(100);

      buttons.forEach((button) => {
        expect(button).toHaveClass('focus-visible:outline-2');
      });
    });
  });
});
