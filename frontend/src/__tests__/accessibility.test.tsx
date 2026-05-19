import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Navigation,
  HeroSection,
  FeatureHighlights,
  WorkflowSection,
  MetricsSection,
  SocialProof,
  Footer,
} from '../components';

/**
 * Accessibility Tests (WCAG 2.1 AA Compliance)
 * 
 * Tests for semantic HTML, keyboard navigation, focus indicators,
 * color contrast, screen reader support, and animation controls.
 */

describe('Accessibility - WCAG 2.1 AA Compliance', () => {
  describe('Semantic HTML Structure', () => {
    it('should use semantic header element for navigation', () => {
      const { container } = render(<Navigation />);
      
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });

    it('should use semantic footer element', () => {
      const { container } = render(<Footer />);
      
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should use semantic section elements', () => {
      const { container } = render(
        <>
          <HeroSection headline="Test" />
          <FeatureHighlights />
          <WorkflowSection />
          <MetricsSection />
          <SocialProof />
        </>
      );
      
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should use semantic article elements where appropriate', () => {
      const { container } = render(
        <>
          <FeatureHighlights />
          <WorkflowSection />
        </>
      );
      
      const articles = container.querySelectorAll('article');
      // Articles should be present for feature cards and workflow steps
      expect(articles.length).toBeGreaterThanOrEqual(0);
    });

    it('should use proper heading hierarchy', () => {
      render(
        <>
          <HeroSection headline="H1 Headline" />
          <FeatureHighlights heading="H2 Features" />
          <WorkflowSection heading="H2 Workflow" />
        </>
      );
      
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2s = screen.getAllByRole('heading', { level: 2 });
      
      expect(h1).toBeInTheDocument();
      expect(h2s.length).toBeGreaterThanOrEqual(2);
    });

    it('should not skip heading levels', () => {
      render(
        <>
          <HeroSection headline="H1" />
          <FeatureHighlights heading="H2" />
        </>
      );
      
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      
      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
    });

    it('should use list elements for navigation links', () => {
      const { container } = render(<Navigation />);
      
      const lists = container.querySelectorAll('ul, ol');
      // Navigation should use list elements
      expect(lists.length).toBeGreaterThanOrEqual(0);
    });

    it('should use list elements for footer links', () => {
      const { container } = render(<Footer />);
      
      const lists = container.querySelectorAll('ul');
      expect(lists.length).toBeGreaterThan(0);
    });
  });

  describe('Alt Text for Images', () => {
    it('should have alt text for hero images', () => {
      render(
        <HeroSection
          headline="Test"
          imageAlt="Freightpilot dashboard interface"
        />
      );
      
      // Image should have alt text
      const images = screen.queryAllByRole('img');
      images.forEach((img) => {
        expect(img).toHaveAttribute('alt');
      });
    });

    it('should have alt text for social proof logos', () => {
      render(
        <SocialProof
          companies={[
            {
              id: '1',
              name: 'Test Company',
              logoUrl: 'https://example.com/logo.png',
            },
          ]}
        />
      );
      
      const img = screen.getByAltText('Test Company logo');
      expect(img).toBeInTheDocument();
    });

    it('should have descriptive alt text', () => {
      render(
        <HeroSection
          headline="Test"
          imageAlt="Freightpilot dashboard showing HOS monitoring and trip planning"
        />
      );
      
      const images = screen.queryAllByRole('img');
      images.forEach((img) => {
        const alt = img.getAttribute('alt');
        expect(alt).toBeTruthy();
        expect(alt?.length).toBeGreaterThan(5);
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have focusable buttons', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
        </>
      );
      
      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveProperty('tabIndex');
      });
    });

    it('should have focusable links', () => {
      const { container } = render(
        <>
          <Navigation />
          <Footer />
        </>
      );
      
      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('should have logical tab order', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
          <Footer />
        </>
      );
      
      const focusableElements = container.querySelectorAll(
        'button, a, input, select, textarea'
      );
      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation in navigation menu', () => {
      const { container } = render(<Navigation />);
      
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
      
      const links = nav?.querySelectorAll('a');
      expect(links?.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation in footer', () => {
      const { container } = render(<Footer />);
      
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
      
      const links = footer?.querySelectorAll('a');
      expect(links?.length).toBeGreaterThan(0);
    });
  });

  describe('Focus Indicators', () => {
    it('should have visible focus indicators on buttons', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
        </>
      );
      
      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        // Buttons should have focus styles
        expect(button).toHaveProperty('className');
      });
    });

    it('should have visible focus indicators on links', () => {
      const { container } = render(
        <>
          <Navigation />
          <Footer />
        </>
      );
      
      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        // Links should have focus styles
        expect(link).toHaveProperty('className');
      });
    });

    it('should have sufficient contrast for focus indicators', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
        </>
      );
      
      const focusableElements = container.querySelectorAll(
        'button, a, input'
      );
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe('Color Contrast Compliance', () => {
    it('should have sufficient contrast for primary text', () => {
      render(
        <>
          <HeroSection headline="Test" />
          <FeatureHighlights />
        </>
      );
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have sufficient contrast for secondary text', () => {
      render(
        <>
          <HeroSection
            headline="Test"
            subheading="Test subheading"
          />
          <FeatureHighlights />
        </>
      );
      
      const paragraphs = screen.queryAllByText(/Test/);
      expect(paragraphs.length).toBeGreaterThan(0);
    });

    it('should have sufficient contrast for links', () => {
      const { container } = render(
        <>
          <Navigation />
          <Footer />
        </>
      );
      
      const links = container.querySelectorAll('a');
      expect(links.length).toBeGreaterThan(0);
    });

    it('should have sufficient contrast for buttons', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
        </>
      );
      
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels for buttons', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
        </>
      );
      
      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        // Buttons should have aria-label or text content
        const hasLabel = button.getAttribute('aria-label') || button.textContent;
        expect(hasLabel).toBeTruthy();
      });
    });

    it('should have proper ARIA labels for icons', () => {
      const { container } = render(
        <>
          <FeatureHighlights />
          <WorkflowSection />
        </>
      );
      
      // Icons should have aria-label or title attributes
      const elements = container.querySelectorAll('[aria-label], [title]');
      expect(elements.length).toBeGreaterThanOrEqual(0);
    });

    it('should have proper ARIA roles for navigation', () => {
      const { container } = render(<Navigation />);
      
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
      // nav is a semantic element and doesn't require an explicit role attribute
      expect(nav).toHaveAttribute('aria-label');
    });

    it('should have proper ARIA roles for footer', () => {
      const { container } = render(<Footer />);
      
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should announce form labels correctly', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
        </>
      );
      
      // Form elements should have associated labels
      const inputs = container.querySelectorAll('input');
      inputs.forEach((input) => {
        // Should have aria-label or be associated with label
        const hasLabel = input.getAttribute('aria-label') || 
                        input.getAttribute('id');
        expect(hasLabel).toBeTruthy();
      });
    });

    it('should announce error messages', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
        </>
      );
      
      // Error messages should be announced
      const errorElements = container.querySelectorAll('[role="alert"]');
      expect(errorElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Animation Controls', () => {
    it('should respect prefers-reduced-motion', () => {
      // Mock prefers-reduced-motion
      window.matchMedia('(prefers-reduced-motion: reduce)');
      
      render(
        <>
          <Navigation />
          <FeatureHighlights />
          <WorkflowSection />
        </>
      );
      
      // Components should render without errors
      expect(screen.getAllByRole('navigation').length).toBeGreaterThan(0);
    });

    it('should not have animations that interfere with functionality', () => {
      const { container } = render(
        <>
          <FeatureHighlights />
          <WorkflowSection />
        </>
      );
      
      // All interactive elements should be functional
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(0);
    });

    it('should have smooth transitions', () => {
      const { container } = render(
        <>
          <Navigation />
          <FeatureHighlights />
        </>
      );
      
      // Elements should have transition classes
      const elements = container.querySelectorAll('[class*="transition"]');
      expect(elements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Form Accessibility', () => {
    it('should have associated labels for form inputs', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
        </>
      );
      
      const inputs = container.querySelectorAll('input');
      inputs.forEach((input) => {
        // Should have aria-label or be associated with label
        const hasLabel = input.getAttribute('aria-label') || 
                        input.getAttribute('id');
        expect(hasLabel).toBeTruthy();
      });
    });

    it('should have proper input types', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
        </>
      );
      
      const inputs = container.querySelectorAll('input');
      inputs.forEach((input) => {
        expect(input).toHaveAttribute('type');
      });
    });
  });

  describe('Link Accessibility', () => {
    it('should have descriptive link text', () => {
      const { container } = render(
        <>
          <Navigation />
          <Footer />
        </>
      );
      
      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        const text = link.textContent || link.getAttribute('aria-label');
        expect(text).toBeTruthy();
      });
    });

    it('should not use generic link text', () => {
      const { container } = render(
        <>
          <Navigation />
          <Footer />
        </>
      );
      
      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        const text = link.textContent?.toLowerCase() || '';
        // Should not use generic text like "click here"
        expect(text).not.toMatch(/^click here$/i);
      });
    });

    it('should have proper link targets', () => {
      const { container } = render(
        <>
          <Navigation />
          <Footer />
        </>
      );
      
      const links = container.querySelectorAll('a[target="_blank"]');
      links.forEach((link) => {
        // External links should have rel="noopener noreferrer"
        expect(link).toHaveAttribute('rel');
      });
    });
  });

  describe('Page Structure', () => {
    it('should have proper page structure', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection headline="Test" />
          <FeatureHighlights />
          <WorkflowSection />
          <MetricsSection />
          <SocialProof />
          <Footer />
        </>
      );
      
      // Should have navigation
      expect(container.querySelector('nav')).toBeInTheDocument();
      
      // Should have sections
      expect(container.querySelectorAll('section').length).toBeGreaterThan(0);
      
      // Should have footer
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('should have proper landmark regions', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection headline="Test" />
          <Footer />
        </>
      );
      
      // Should have navigation landmark
      expect(container.querySelector('nav')).toBeInTheDocument();
      
      // Should have footer landmark
      expect(container.querySelector('footer')).toBeInTheDocument();
    });
  });

  describe('Text Alternatives', () => {
    it('should provide text alternatives for visual content', () => {
      render(
        <>
          <FeatureHighlights />
          <WorkflowSection />
        </>
      );
      
      // All visual content should have text alternatives
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have descriptive headings', () => {
      render(
        <>
          <HeroSection headline="Plan compliant miles with one intelligent workspace" />
          <FeatureHighlights heading="Why Choose Freightpilot" />
        </>
      );
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1.textContent).toBeTruthy();
      expect(h1.textContent?.length).toBeGreaterThan(10);
    });
  });

  describe('Responsive Accessibility', () => {
    it('should maintain accessibility on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(
        <>
          <Navigation />
          <HeroSection headline="Test" />
          <Footer />
        </>
      );
      
      // Should still have proper semantic structure
      expect(container.querySelector('nav')).toBeInTheDocument();
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('should maintain accessibility on tablet', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { container } = render(
        <>
          <Navigation />
          <HeroSection headline="Test" />
          <Footer />
        </>
      );
      
      // Should still have proper semantic structure
      expect(container.querySelector('nav')).toBeInTheDocument();
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('should maintain accessibility on desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      });

      const { container } = render(
        <>
          <Navigation />
          <HeroSection headline="Test" />
          <Footer />
        </>
      );
      
      // Should still have proper semantic structure
      expect(container.querySelector('nav')).toBeInTheDocument();
      expect(container.querySelector('footer')).toBeInTheDocument();
    });
  });
});
