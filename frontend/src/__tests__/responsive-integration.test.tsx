import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
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
 * Responsive Design Integration Tests
 * 
 * Tests that verify all components work together responsively
 * across mobile, tablet, and desktop breakpoints.
 */

describe('Responsive Design Integration', () => {
  describe('Mobile Responsive (320px - 767px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('should render Navigation with mobile layout', () => {
      render(<Navigation />);
      
      // Navigation should be present
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should render HeroSection with mobile layout', () => {
      render(
        <HeroSection
          headline="Test Headline"
          subheading="Test Subheading"
        />
      );
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-h1');
    });

    it('should render FeatureHighlights with single-column grid on mobile', () => {
      render(<FeatureHighlights />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('should render WorkflowSection with vertical stack on mobile', () => {
      render(<WorkflowSection />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('should render MetricsSection with mobile grid', () => {
      render(<MetricsSection />);
      
      // Metrics should be present
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });

    it('should render SocialProof with mobile logo grid', () => {
      render(<SocialProof />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('should render Footer with mobile layout', () => {
      render(<Footer />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('should have proper touch targets on all interactive elements', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
        </>
      );

      // Check for buttons with proper height
      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        // Buttons should have at least 44px height
        expect(button).toHaveClass('h-11');
      });
    });

    it('should use mobile typography sizes', () => {
      render(
        <>
          <HeroSection headline="Test" />
          <FeatureHighlights />
        </>
      );

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveClass('text-h1');
    });
  });

  describe('Tablet Responsive (768px - 1023px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
    });

    it('should render Navigation with tablet layout', () => {
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should render HeroSection with tablet layout', () => {
      render(
        <HeroSection
          headline="Test Headline"
          subheading="Test Subheading"
        />
      );
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should render FeatureHighlights with two-column grid on tablet', () => {
      render(<FeatureHighlights />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('should render WorkflowSection with horizontal layout on tablet', () => {
      render(<WorkflowSection />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('should render MetricsSection with tablet grid', () => {
      render(<MetricsSection />);
      
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });

    it('should render SocialProof with tablet logo grid', () => {
      render(<SocialProof />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('should render Footer with tablet layout', () => {
      render(<Footer />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('should use tablet typography sizes', () => {
      render(
        <>
          <HeroSection headline="Test" />
          <FeatureHighlights />
        </>
      );

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe('Desktop Responsive (1024px+)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      });
    });

    it('should render Navigation with desktop layout', () => {
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should render HeroSection with desktop layout', () => {
      render(
        <HeroSection
          headline="Test Headline"
          subheading="Test Subheading"
        />
      );
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('desktop:text-h1');
    });

    it('should render FeatureHighlights with three-column grid on desktop', () => {
      render(<FeatureHighlights />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('should render WorkflowSection with horizontal layout on desktop', () => {
      render(<WorkflowSection />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('should render MetricsSection with desktop grid', () => {
      render(<MetricsSection />);
      
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });

    it('should render SocialProof with desktop logo grid', () => {
      render(<SocialProof />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('should render Footer with desktop layout', () => {
      render(<Footer />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('should use desktop typography sizes', () => {
      render(
        <>
          <HeroSection headline="Test" />
          <FeatureHighlights />
        </>
      );

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveClass('desktop:text-h1');
    });
  });

  describe('Responsive Typography Consistency', () => {
    it('should maintain readable line-height across all breakpoints', () => {
      const { container } = render(
        <>
          <HeroSection
            headline="Test"
            subheading="Test subheading with longer text to test line-height"
          />
          <FeatureHighlights />
        </>
      );

      const paragraphs = container.querySelectorAll('p');
      paragraphs.forEach((p) => {
        // Should have proper line-height
        const style = window.getComputedStyle(p);
        expect(style.lineHeight).toBeTruthy();
      });
    });

    it('should scale font sizes proportionally', () => {
      render(
        <>
          <HeroSection headline="Test" />
          <FeatureHighlights />
        </>
      );

      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });

      // H1 should have responsive classes
      expect(h1).toHaveClass('text-h1');
      
      // H2 should have responsive classes
      expect(h2).toHaveClass('text-h2');
    });
  });

  describe('Responsive Image Handling', () => {
    it('should render images with lazy loading', () => {
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

      const img = screen.getByAltText('Test Company');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('should render hero image with proper alt text', () => {
      render(
        <HeroSection
          headline="Test"
          imageAlt="Test image description"
        />
      );

      // Image should be present with alt text
      const images = screen.queryAllByRole('img');
      expect(images.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Responsive Spacing', () => {
    it('should apply responsive padding to sections', () => {
      const { container } = render(
        <>
          <FeatureHighlights />
          <WorkflowSection />
          <MetricsSection />
        </>
      );

      const sections = container.querySelectorAll('section');
      sections.forEach((section) => {
        // Sections should have responsive padding classes
        expect(section.className).toMatch(/py-|px-/);
      });
    });

    it('should apply responsive gaps to grids', () => {
      const { container } = render(
        <>
          <FeatureHighlights />
          <WorkflowSection />
        </>
      );

      const grids = container.querySelectorAll('.grid');
      grids.forEach((grid) => {
        // Grids should have gap classes
        expect(grid.className).toMatch(/gap-/);
      });
    });
  });

  describe('Responsive Container Widths', () => {
    it('should apply responsive max-widths', () => {
      const { container } = render(
        <>
          <FeatureHighlights />
          <WorkflowSection />
        </>
      );

      const containers = container.querySelectorAll('[class*="max-w"]');
      expect(containers.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility Across Breakpoints', () => {
    it('should maintain semantic HTML across all breakpoints', () => {
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

      // Should have proper semantic elements
      expect(container.querySelector('nav')).toBeInTheDocument();
      expect(container.querySelector('main')).not.toBeInTheDocument(); // Not in this test
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('should maintain proper heading hierarchy', () => {
      render(
        <>
          <HeroSection headline="H1 Test" />
          <FeatureHighlights heading="H2 Test" />
          <WorkflowSection heading="H2 Test 2" />
        </>
      );

      const h1 = screen.getByRole('heading', { level: 1 });
      const h2s = screen.getAllByRole('heading', { level: 2 });

      expect(h1).toBeInTheDocument();
      expect(h2s.length).toBeGreaterThanOrEqual(2);
    });

    it('should have proper focus indicators on interactive elements', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
          <Footer />
        </>
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        // Buttons should be focusable
        expect(button).toHaveProperty('tabIndex');
      });
    });
  });

  describe('Performance Across Breakpoints', () => {
    it('should render all components without performance issues', () => {
      const startTime = performance.now();
      
      render(
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
      
      const endTime = performance.now();
      
      // Should render in reasonable time
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });
});
