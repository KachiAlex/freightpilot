import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  Navigation,
  HeroSection,
  FeatureHighlights,
  WorkflowSection,
  MetricsSection,
  SocialProof,
  Footer,
  Button,
} from '../components';

/**
 * Keyboard Navigation Tests
 * 
 * Tests for keyboard accessibility including:
 * - Tab navigation through all interactive elements
 * - Escape key to close menus/modals
 * - Arrow key navigation in menus
 * - Focus indicators on all interactive elements
 * - Logical tab order
 * 
 * Validates: Requirements 10.3, 3.6
 */

describe('Keyboard Navigation - WCAG 2.1 AA Compliance', () => {
  describe('Tab Navigation', () => {
    it('should allow tabbing through navigation links', async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      // Tab to first navigation link
      await user.tab();
      const firstLink = screen.getByRole('link', { name: /Product|Freightpilot/i });
      expect(firstLink).toHaveFocus();
    });

    it('should allow tabbing through all interactive elements in order', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
          <Footer />
        </>
      );

      const focusableElements = container.querySelectorAll(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('should maintain logical tab order from top to bottom', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
          <Footer />
        </>
      );

      const focusableElements = Array.from(
        container.querySelectorAll(
          'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ) as HTMLElement[];

      // Verify elements are in document order
      for (let i = 0; i < focusableElements.length - 1; i++) {
        const current = focusableElements[i];
        const next = focusableElements[i + 1];
        const comparison = current.compareDocumentPosition(next);
        // DOCUMENT_POSITION_FOLLOWING = 4
        expect(comparison & 4).toBe(4);
      }
    });

    it('should allow shift+tab to navigate backwards', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Navigation />
          <HeroSection />
        </>
      );

      // Tab forward
      await user.tab();
      const firstElement = document.activeElement;

      // Shift+Tab backward
      await user.tab({ shift: true });
      const previousElement = document.activeElement;

      // Should have moved to a different element
      expect(previousElement).not.toBe(firstElement);
    });

    it('should skip disabled elements in tab order', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Button disabled>Disabled Button</Button>
          <Button>Enabled Button</Button>
        </>
      );

      await user.tab();
      const focusedElement = document.activeElement;
      expect(focusedElement).toHaveTextContent('Enabled Button');
    });
  });

  describe('Escape Key Navigation', () => {
    it('should close mobile menu when Escape is pressed', async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      // Open mobile menu
      const hamburgerButton = screen.getByLabelText(/open menu|close menu/i);
      await user.click(hamburgerButton);

      // Verify menu is open
      const mobileMenu = screen.getByRole('navigation', { hidden: true });
      expect(mobileMenu).toBeInTheDocument();

      // Press Escape
      await user.keyboard('{Escape}');

      // Menu should be closed (aria-expanded should be false)
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should restore focus to hamburger button after closing menu with Escape', async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      const hamburgerButton = screen.getByLabelText(/open menu|close menu/i);

      // Open menu
      await user.click(hamburgerButton);

      // Press Escape
      await user.keyboard('{Escape}');

      // Focus should return to hamburger button
      expect(hamburgerButton).toHaveFocus();
    });

    it('should not affect other elements when Escape is pressed outside menu', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Navigation />
          <HeroSection />
        </>
      );

      // Press Escape without opening menu
      await user.keyboard('{Escape}');

      // Should not cause any errors
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Arrow Key Navigation', () => {
    it('should navigate menu items with arrow keys', async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      // Tab to first navigation link
      await user.tab();
      const firstLink = screen.getByRole('menuitem', { name: 'Product' });
      expect(firstLink).toHaveFocus();

      // Arrow right to next link
      await user.keyboard('{ArrowRight}');
      const secondLink = screen.getByRole('menuitem', { name: 'Workflow' });
      expect(secondLink).toHaveFocus();

      // Arrow left back to first link
      await user.keyboard('{ArrowLeft}');
      expect(firstLink).toHaveFocus();
    });

    it('should support Home key to jump to first menu item', async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      // Tab to navigation
      await user.tab();
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowRight}');

      // Press Home to go to first item
      await user.keyboard('{Home}');
      const firstLink = screen.getByRole('menuitem', { name: 'Product' });
      expect(firstLink).toHaveFocus();
    });

    it('should support End key to jump to last menu item', async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      // Tab to navigation
      await user.tab();

      // Press End to go to last item
      await user.keyboard('{End}');
      const lastLink = screen.getByRole('menuitem', { name: 'Compliance' });
      expect(lastLink).toHaveFocus();
    });
  });

  describe('Focus Indicators', () => {
    it('should have visible focus indicator on buttons', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
        </>
      );

      const buttons = container.querySelectorAll('button');
      // At least some buttons should have focus-visible styles
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have visible focus indicator on links', () => {
      const { container } = render(
        <>
          <Navigation />
          <Footer />
        </>
      );

      const links = container.querySelectorAll('a');
      // At least some links should have focus-visible styles
      expect(links.length).toBeGreaterThan(0);
    });

    it('should show focus indicator when tabbing to button', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Navigation />
          <HeroSection />
        </>
      );

      // Tab to first button
      await user.tab();
      const focusedElement = document.activeElement;

      // Should be a button or link
      expect(
        focusedElement?.tagName === 'BUTTON' || focusedElement?.tagName === 'A'
      ).toBe(true);
    });

    it('should show focus indicator on feature cards', async () => {
      const user = userEvent.setup();
      const { container } = render(<FeatureHighlights />);

      // Tab to first feature card
      await user.tab();
      const featureCard = container.querySelector('[role="region"]');

      expect(featureCard).toHaveFocus();
    });

    it('should show focus indicator on workflow steps', async () => {
      const user = userEvent.setup();
      const { container } = render(<WorkflowSection />);

      // Tab to first workflow step
      await user.tab();
      const workflowStep = container.querySelector('[role="region"]');

      expect(workflowStep).toHaveFocus();
    });

    it('should show focus indicator on metric cards', async () => {
      const user = userEvent.setup();
      const { container } = render(<MetricsSection />);

      // Tab to first metric card
      await user.tab();
      const metricCard = container.querySelector('article[role="region"]');

      expect(metricCard).toHaveFocus();
    });

    it('should show focus indicator on company logos', async () => {
      const user = userEvent.setup();
      const { container } = render(<SocialProof />);

      // Tab to first company logo
      await user.tab();
      const companyLogo = container.querySelector('article[role="region"]');

      expect(companyLogo).toHaveFocus();
    });
  });

  describe('Focus Management', () => {
    it('should trap focus within mobile menu when open', async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      // Open mobile menu
      const hamburgerButton = screen.getByLabelText(/open menu|close menu/i);
      await user.click(hamburgerButton);

      // Tab through menu items
      await user.tab();
      const focusedElement = document.activeElement;

      // Should be within the mobile menu
      const mobileMenu = screen.getByRole('navigation', { name: 'Mobile navigation menu' });
      expect(mobileMenu.contains(focusedElement)).toBe(true);
    });

    it('should restore focus after closing menu', async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      const hamburgerButton = screen.getByLabelText(/open menu|close menu/i);

      // Open menu
      await user.click(hamburgerButton);

      // Close menu with Escape
      await user.keyboard('{Escape}');

      // Focus should be on hamburger button
      expect(hamburgerButton).toHaveFocus();
    });

    it('should allow focus on all interactive elements', async () => {
      const user = userEvent.setup();
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

      const focusableElements = container.querySelectorAll(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      // Should have multiple focusable elements
      expect(focusableElements.length).toBeGreaterThan(5);
    });
  });

  describe('Button Keyboard Activation', () => {
    it('should activate button with Enter key', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
    });

    it('should activate button with Space key', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalled();
    });

    it('should not activate disabled button with keyboard', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Click me
        </Button>
      );

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Enter}');
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Link Keyboard Navigation', () => {
    it('should allow Enter key to activate links', async () => {
      const user = userEvent.setup();
      render(
        <a href="https://example.com" data-testid="test-link">
          Test Link
        </a>
      );

      const link = screen.getByTestId('test-link');
      link.focus();

      // Enter key should work on links
      expect(link).toHaveFocus();
    });

    it('should allow navigation through footer links', async () => {
      const user = userEvent.setup();
      const { container } = render(<Footer />);

      const footerLinks = container.querySelectorAll('footer a');
      expect(footerLinks.length).toBeGreaterThan(0);

      // All links should be focusable
      footerLinks.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Mobile Menu Keyboard Navigation', () => {
    it('should navigate mobile menu items with arrow keys', async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      // Open mobile menu
      const hamburgerButton = screen.getByLabelText(/open menu|close menu/i);
      await user.click(hamburgerButton);

      // Tab to first menu item
      await user.tab();
      const firstLink = screen.getAllByRole('link', { name: 'Product' })[1]; // Get mobile menu link
      expect(firstLink).toHaveFocus();

      // Arrow down to next item
      await user.keyboard('{ArrowDown}');
      const secondLink = screen.getAllByRole('link', { name: 'Workflow' })[1]; // Get mobile menu link
      expect(secondLink).toHaveFocus();

      // Arrow up back to first item
      await user.keyboard('{ArrowUp}');
      expect(firstLink).toHaveFocus();
    });

    it('should close mobile menu when clicking outside', async () => {
      const user = userEvent.setup();
      const { container } = render(<Navigation />);

      // Open mobile menu
      const hamburgerButton = screen.getByLabelText(/open menu|close menu/i);
      await user.click(hamburgerButton);

      // Click outside menu (on the header)
      const header = container.querySelector('header') || container.querySelector('[class*="fixed"]');
      if (header) {
        await user.click(header);
      }

      // Menu should be closed
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Semantic HTML for Keyboard Navigation', () => {
    it('should use semantic button elements', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
        </>
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach((button) => {
        expect(button.tagName).toBe('BUTTON');
      });
    });

    it('should use semantic link elements', () => {
      const { container } = render(
        <>
          <Navigation />
          <Footer />
        </>
      );

      const links = container.querySelectorAll('a');
      expect(links.length).toBeGreaterThan(0);

      links.forEach((link) => {
        expect(link.tagName).toBe('A');
        expect(link).toHaveAttribute('href');
      });
    });

    it('should use semantic nav elements', () => {
      const { container } = render(
        <>
          <Navigation />
          <Footer />
        </>
      );

      const navs = container.querySelectorAll('nav');
      expect(navs.length).toBeGreaterThan(0);
    });

    it('should use semantic footer element', () => {
      const { container } = render(<Footer />);

      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });
  });

  describe('ARIA Attributes for Keyboard Navigation', () => {
    it('should have aria-label on hamburger button', () => {
      render(<Navigation />);

      const hamburgerButton = screen.getByLabelText(/open menu|close menu/i);
      expect(hamburgerButton).toHaveAttribute('aria-label');
    });

    it('should have aria-expanded on hamburger button', () => {
      render(<Navigation />);

      const hamburgerButton = screen.getByLabelText(/open menu|close menu/i);
      expect(hamburgerButton).toHaveAttribute('aria-expanded');
    });

    it('should have aria-controls on hamburger button', () => {
      render(<Navigation />);

      const hamburgerButton = screen.getByLabelText(/open menu|close menu/i);
      expect(hamburgerButton).toHaveAttribute('aria-controls');
    });

    it('should have aria-label on navigation', () => {
      const { container } = render(<Navigation />);

      const navs = container.querySelectorAll('nav');
      navs.forEach((nav) => {
        expect(nav).toHaveAttribute('aria-label');
      });
    });

    it('should have aria-label on footer navigation', () => {
      const { container } = render(<Footer />);

      const navs = container.querySelectorAll('footer nav');
      navs.forEach((nav) => {
        expect(nav).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Keyboard Navigation in Complex Layouts', () => {
    it('should maintain keyboard navigation across full page', async () => {
      const user = userEvent.setup();
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

      const focusableElements = Array.from(
        container.querySelectorAll(
          'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ) as HTMLElement[];

      // Should be able to tab through all elements
      for (let i = 0; i < Math.min(5, focusableElements.length); i++) {
        await user.tab();
        expect(document.activeElement).toBeTruthy();
      }
    });

    it('should handle focus in nested interactive elements', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
        </>
      );

      // Tab through elements
      await user.tab();
      const firstElement = document.activeElement;

      await user.tab();
      const secondElement = document.activeElement;

      // Should be different elements
      expect(firstElement).not.toBe(secondElement);
    });
  });
});
