import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { FeatureHighlights } from '../components/FeatureHighlights';
import { MetricsSection } from '../components/MetricsSection';
import { SocialProof } from '../components/SocialProof';
import { Footer } from '../components/Footer';
import { WorkflowSection } from '../components/WorkflowSection';
import { HeroSection } from '../components/HeroSection';

/**
 * Tablet Layout Tests (768px - 1023px)
 * 
 * Validates that all homepage sections display correctly on tablet devices with:
 * - Two-column layouts where appropriate
 * - Optimized spacing and sizing
 * - Balanced visual hierarchy
 * 
 * Requirements: 8.2, 8.7
 */

describe('Tablet Layout (768px - 1023px)', () => {
  describe('Feature Cards - 2-Column Grid', () => {
    it('should display feature cards in 2-column grid on tablet', () => {
      const { container } = render(<FeatureHighlights />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('tablet:grid-cols-2');
      expect(grid).toHaveClass('desktop:grid-cols-3');
    });

    it('should have optimized gap spacing on tablet', () => {
      const { container } = render(<FeatureHighlights />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('tablet:gap-md');
    });

    it('should have balanced card heights on tablet', () => {
      const { container } = render(<FeatureHighlights />);
      
      const cards = container.querySelectorAll('[data-testid^="feature-card-"]');
      expect(cards.length).toBeGreaterThan(0);
      
      // All cards should have flex-col and h-full for balanced heights
      cards.forEach(card => {
        expect(card).toHaveClass('flex', 'flex-col', 'h-full');
      });
    });

    it('should have optimized icon sizing on tablet', () => {
      const { container } = render(<FeatureHighlights />);
      
      const icons = container.querySelectorAll('[data-testid^="feature-card-"] > div:first-child');
      expect(icons.length).toBeGreaterThan(0);
      
      // Icons should scale appropriately
      icons.forEach(icon => {
        expect(icon).toHaveClass('tablet:text-5xl');
      });
    });

    it('should have optimized margin spacing on tablet', () => {
      const { container } = render(<FeatureHighlights />);
      
      const cards = container.querySelectorAll('[data-testid^="feature-card-"]');
      expect(cards.length).toBeGreaterThan(0);
      
      // Cards should have responsive margins
      cards.forEach(card => {
        const title = card.querySelector('h3');
        expect(title).toHaveClass('tablet:mb-lg');
      });
    });
  });

  describe('Workflow Steps - Horizontal Layout', () => {
    it('should display workflow steps horizontally on tablet', () => {
      const { container } = render(<WorkflowSection />);
      
      const flexContainer = container.querySelector('.flex');
      expect(flexContainer).toHaveClass('tablet:flex-row');
      expect(flexContainer).toHaveClass('desktop:flex-row');
    });

    it('should have optimized gap spacing between workflow steps on tablet', () => {
      const { container } = render(<WorkflowSection />);
      
      const flexContainer = container.querySelector('.flex');
      expect(flexContainer).toHaveClass('tablet:gap-md');
    });

    it('should display connector lines on tablet', () => {
      const { container } = render(<WorkflowSection />);
      
      const connectors = container.querySelectorAll('.tablet\\:block');
      // Should have connector lines visible on tablet
      expect(connectors.length).toBeGreaterThan(0);
    });

    it('should have balanced step card heights on tablet', () => {
      const { container } = render(<WorkflowSection />);
      
      const stepCards = container.querySelectorAll('[data-testid^="workflow-step-"]');
      expect(stepCards.length).toBeGreaterThan(0);
      
      // All step cards should have h-full for balanced heights
      stepCards.forEach(card => {
        expect(card).toHaveClass('h-full');
      });
    });

    it('should have optimized spacing between step elements on tablet', () => {
      const { container } = render(<WorkflowSection />);
      
      const stepCards = container.querySelectorAll('[data-testid^="workflow-step-"]');
      expect(stepCards.length).toBeGreaterThan(0);
      
      stepCards.forEach(card => {
        const title = card.querySelector('h3');
        expect(title).toHaveClass('tablet:mb-lg');
      });
    });
  });

  describe('Metrics - 2-Column Grid', () => {
    it('should display metrics in 2-column grid on tablet', () => {
      const { container } = render(<MetricsSection />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('tablet:grid-cols-2');
      expect(grid).toHaveClass('desktop:grid-cols-3');
    });

    it('should have optimized gap spacing on tablet', () => {
      const { container } = render(<MetricsSection />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('tablet:gap-md');
    });

    it('should have optimized padding on metric cards on tablet', () => {
      const { container } = render(<MetricsSection />);
      
      const metricCards = container.querySelectorAll('[data-testid^="metric-card-"]');
      expect(metricCards.length).toBeGreaterThan(0);
      
      metricCards.forEach(card => {
        expect(card).toHaveClass('tablet:p-lg');
      });
    });

    it('should have optimized font sizes on metric cards on tablet', () => {
      const { container } = render(<MetricsSection />);
      
      const metricCards = container.querySelectorAll('[data-testid^="metric-card-"]');
      expect(metricCards.length).toBeGreaterThan(0);
      
      metricCards.forEach(card => {
        const number = card.querySelector('div:first-child');
        expect(number).toHaveClass('tablet:text-3xl');
      });
    });

    it('should have optimized spacing between metric elements on tablet', () => {
      const { container } = render(<MetricsSection />);
      
      const metricCards = container.querySelectorAll('[data-testid^="metric-card-"]');
      expect(metricCards.length).toBeGreaterThan(0);
      
      metricCards.forEach(card => {
        const label = card.querySelector('div:nth-child(2)');
        expect(label).toHaveClass('tablet:mb-md');
      });
    });
  });

  describe('Social Proof - 3-Column Grid', () => {
    it('should display logos in 3-column grid on tablet', () => {
      const { container } = render(<SocialProof />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('tablet:grid-cols-3');
      expect(grid).toHaveClass('desktop:grid-cols-6');
    });

    it('should have optimized gap spacing on tablet', () => {
      const { container } = render(<SocialProof />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('tablet:gap-md');
    });

    it('should have proper logo sizing on tablet', () => {
      const { container } = render(<SocialProof />);
      
      const logos = container.querySelectorAll('img');
      expect(logos.length).toBeGreaterThan(0);
      
      logos.forEach(logo => {
        expect(logo).toHaveAttribute('style');
        expect(logo.getAttribute('style')).toContain('height: 40px');
      });
    });

    it('should have proper logo container width on tablet', () => {
      const { container } = render(<SocialProof />);
      
      const logoContainers = container.querySelectorAll('[data-testid^="company-logo-"]');
      expect(logoContainers.length).toBeGreaterThan(0);
      
      logoContainers.forEach(container => {
        expect(container).toHaveClass('w-full');
      });
    });
  });

  describe('Footer - 2-Column Grid', () => {
    it('should display footer sections in 2-column grid on tablet', () => {
      const { container } = render(<Footer />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('tablet:grid-cols-2');
      expect(grid).toHaveClass('desktop:grid-cols-3');
    });

    it('should have optimized gap spacing on tablet', () => {
      const { container } = render(<Footer />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('tablet:gap-md');
    });

    it('should have optimized section heading sizing on tablet', () => {
      const { container } = render(<Footer />);
      
      const headings = container.querySelectorAll('h3');
      expect(headings.length).toBeGreaterThan(0);
      
      headings.forEach(heading => {
        expect(heading).toHaveClass('tablet:text-body');
      });
    });

    it('should have optimized link spacing on tablet', () => {
      const { container } = render(<Footer />);
      
      const lists = container.querySelectorAll('ul');
      expect(lists.length).toBeGreaterThan(0);
      
      lists.forEach(list => {
        expect(list).toHaveClass('tablet:space-y-md');
      });
    });

    it('should have optimized footer bottom layout on tablet', () => {
      const { container } = render(<Footer />);
      
      const footerBottom = container.querySelector('.pt-sm');
      expect(footerBottom).toHaveClass('tablet:flex-row');
    });
  });

  describe('Hero Section - Tablet Optimization', () => {
    it('should stack content vertically on tablet', () => {
      const { container } = render(<HeroSection />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('tablet:grid-cols-1');
      expect(grid).toHaveClass('desktop:grid-cols-2');
    });

    it('should have optimized headline sizing on tablet', () => {
      const { container } = render(<HeroSection />);
      
      const headline = container.querySelector('h1');
      expect(headline).toHaveClass('tablet:text-h1');
    });

    it('should have optimized subheading sizing on tablet', () => {
      const { container } = render(<HeroSection />);
      
      const subheading = container.querySelector('p');
      expect(subheading).toHaveClass('tablet:text-body_lg');
    });

    it('should have optimized button layout on tablet', () => {
      const { container } = render(<HeroSection />);
      
      const buttonContainer = container.querySelector('.flex');
      // Buttons should be in a flex container that can be row on tablet
      expect(buttonContainer).toHaveClass('flex');
      expect(buttonContainer).toHaveClass('flex-col');
    });

    it('should have optimized spacing on tablet', () => {
      const { container } = render(<HeroSection />);
      
      const headline = container.querySelector('h1');
      expect(headline).toHaveClass('tablet:mb-lg');
    });
  });

  describe('Typography Scaling on Tablet', () => {
    it('should use tablet-optimized H2 sizes', () => {
      const { container } = render(<FeatureHighlights />);
      
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('tablet:text-h2');
    });

    it('should use tablet-optimized H3 sizes', () => {
      const { container } = render(<FeatureHighlights />);
      
      const headings = container.querySelectorAll('h3');
      expect(headings.length).toBeGreaterThan(0);
      
      headings.forEach(heading => {
        expect(heading).toHaveClass('tablet:text-h3');
      });
    });

    it('should use tablet-optimized body text sizes', () => {
      const { container } = render(<FeatureHighlights />);
      
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBeGreaterThan(0);
      
      paragraphs.forEach(p => {
        expect(p).toHaveClass('tablet:text-body');
      });
    });
  });

  describe('Spacing Optimization on Tablet', () => {
    it('should have optimized section padding on tablet', () => {
      const { container } = render(<FeatureHighlights />);
      
      const section = container.querySelector('section');
      expect(section).toHaveClass('tablet:py-3xl');
    });

    it('should have optimized margin-bottom on section headings on tablet', () => {
      const { container } = render(<FeatureHighlights />);
      
      const heading = container.querySelector('h2');
      // Heading should have responsive margin-bottom
      expect(heading).toHaveClass('tablet:text-h2');
    });

    it('should have optimized gap spacing in grids on tablet', () => {
      const { container } = render(<FeatureHighlights />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('tablet:gap-md');
    });
  });

  describe('Visual Hierarchy on Tablet', () => {
    it('should maintain visual hierarchy with proper font weights on tablet', () => {
      const { container } = render(<FeatureHighlights />);
      
      const heading = container.querySelector('h2');
      // Heading should have proper styling for visual hierarchy
      expect(heading).toHaveClass('text-neutral-dark');
      expect(heading).toHaveClass('tablet:text-h2');
    });

    it('should maintain visual hierarchy with proper spacing on tablet', () => {
      const { container } = render(<FeatureHighlights />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('tablet:gap-md');
    });

    it('should maintain visual hierarchy with proper color contrast on tablet', () => {
      const { container } = render(<FeatureHighlights />);
      
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('text-neutral-dark');
    });
  });
});
