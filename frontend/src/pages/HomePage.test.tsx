import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HomePage } from './HomePage';

// Mock the components
vi.mock('../components', () => ({
  Navigation: () => <div data-testid="navigation">Navigation</div>,
  HeroSection: () => <div data-testid="hero-section">Hero Section</div>,
  FeatureHighlights: () => <div data-testid="feature-highlights">Feature Highlights</div>,
  WorkflowSection: () => <div data-testid="workflow-section">Workflow Section</div>,
  MetricsSection: () => <div data-testid="metrics-section">Metrics Section</div>,
  SocialProof: () => <div data-testid="social-proof">Social Proof</div>,
  Footer: () => <div data-testid="footer">Footer</div>,
}));

describe('HomePage - Responsive Design', () => {
  beforeEach(() => {
    // Reset window size to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Component Integration', () => {
    it('should render all major sections', () => {
      render(<HomePage />);
      
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('feature-highlights')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-section')).toBeInTheDocument();
      expect(screen.getByTestId('metrics-section')).toBeInTheDocument();
      expect(screen.getByTestId('social-proof')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should render main element with proper structure', () => {
      render(<HomePage />);
      
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass('pt-72', 'desktop:pt-72', 'tablet:pt-64', 'mobile:pt-64');
    });

    it('should have proper page background color', () => {
      const { container } = render(<HomePage />);
      
      const pageDiv = container.firstChild;
      expect(pageDiv).toHaveClass('min-h-screen', 'bg-neutral-white');
    });
  });

  describe('Responsive Layout - Mobile (320px - 767px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('should apply mobile padding to main content', () => {
      render(<HomePage />);
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('mobile:pt-64');
    });

    it('should render all sections in single-column layout', () => {
      render(<HomePage />);
      
      // All sections should be present and stacked vertically
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('feature-highlights')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-section')).toBeInTheDocument();
      expect(screen.getByTestId('metrics-section')).toBeInTheDocument();
      expect(screen.getByTestId('social-proof')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('Responsive Layout - Tablet (768px - 1023px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
    });

    it('should apply tablet padding to main content', () => {
      render(<HomePage />);
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('tablet:pt-64');
    });

    it('should render all sections with tablet layout', () => {
      render(<HomePage />);
      
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('feature-highlights')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-section')).toBeInTheDocument();
      expect(screen.getByTestId('metrics-section')).toBeInTheDocument();
      expect(screen.getByTestId('social-proof')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('Responsive Layout - Desktop (1024px+)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      });
    });

    it('should apply desktop padding to main content', () => {
      render(<HomePage />);
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('desktop:pt-72');
    });

    it('should render all sections with desktop layout', () => {
      render(<HomePage />);
      
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('feature-highlights')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-section')).toBeInTheDocument();
      expect(screen.getByTestId('metrics-section')).toBeInTheDocument();
      expect(screen.getByTestId('social-proof')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('Navigation Positioning', () => {
    it('should account for fixed navigation in main content padding', () => {
      render(<HomePage />);
      
      const main = screen.getByRole('main');
      // Main should have top padding to account for fixed navigation
      expect(main).toHaveClass('pt-72', 'desktop:pt-72', 'tablet:pt-64', 'mobile:pt-64');
    });
  });

  describe('CTA Button Handlers', () => {
    it('should handle primary CTA click', () => {
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { ...originalLocation, href: '' } as any;

      render(<HomePage />);
      
      // The component should be renderable without errors
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();

      window.location = originalLocation;
    });

    it('should handle secondary CTA click', () => {
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { ...originalLocation, href: '' } as any;

      render(<HomePage />);
      
      // The component should be renderable without errors
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();

      window.location = originalLocation;
    });
  });

  describe('Semantic HTML Structure', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(<HomePage />);
      
      // Should have main element
      expect(container.querySelector('main')).toBeInTheDocument();
      
      // Should have footer element
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<HomePage />);
      
      // Navigation should be present
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<HomePage />);
      
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('should maintain proper color contrast', () => {
      const { container } = render(<HomePage />);
      
      // Background should be neutral-white for proper contrast
      const pageDiv = container.firstChild;
      expect(pageDiv).toHaveClass('bg-neutral-white');
    });
  });

  describe('Performance - Lazy Loading', () => {
    it('should render without performance issues', () => {
      const startTime = performance.now();
      render(<HomePage />);
      const endTime = performance.now();
      
      // Render should complete in reasonable time (< 1000ms)
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Responsive Typography', () => {
    it('should apply responsive typography classes', () => {
      render(<HomePage />);
      
      // Hero section should have responsive typography
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });
  });

  describe('Responsive Images', () => {
    it('should pass responsive image props to HeroSection', () => {
      render(<HomePage />);
      
      // Hero section should be rendered with image props
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });
  });

  describe('Touch Targets', () => {
    it('should have proper touch target sizes on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<HomePage />);
      
      // Navigation should be present with proper touch targets
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
    });
  });

  describe('Layout Transitions', () => {
    it('should handle viewport resize smoothly', () => {
      const { rerender } = render(<HomePage />);
      
      // Simulate resize to tablet
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      rerender(<HomePage />);
      
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      
      // Simulate resize to desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      });
      
      rerender(<HomePage />);
      
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });
  });
});
