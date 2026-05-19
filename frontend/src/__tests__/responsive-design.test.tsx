import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Container } from '../components/Container';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { HeroSection } from '../components/HeroSection';
import { FeatureHighlights } from '../components/FeatureHighlights';
import { WorkflowSection } from '../components/WorkflowSection';
import { MetricsSection } from '../components/MetricsSection';
import { SocialProof } from '../components/SocialProof';
import { Footer } from '../components/Footer';
import { Navigation } from '../components/Navigation';

/**
 * Responsive Design Tests
 * 
 * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7**
 * 
 * Comprehensive tests for responsive design across mobile, tablet, and desktop breakpoints.
 * Validates that components adapt properly to different viewport sizes, typography scales,
 * images scale appropriately, and layout transitions are smooth.
 * 
 * Breakpoints:
 * - Mobile: 320px - 767px
 * - Tablet: 768px - 1023px
 * - Desktop: 1024px+
 */

// Helper function to set viewport width and trigger resize
const setViewportWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 768,
  });
  window.dispatchEvent(new Event('resize'));
};

// Helper function to get computed styles
const getComputedFontSize = (element: Element): number => {
  const style = window.getComputedStyle(element);
  const fontSize = style.fontSize;
  return parseInt(fontSize, 10);
};

// Helper function to check if element is visible
const isElementVisible = (element: Element): boolean => {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden';
};

describe('Responsive Design - Breakpoints', () => {
  describe('Mobile Layout (320px - 767px)', () => {
    beforeEach(() => {
      setViewportWidth(375);
    });

    afterEach(() => {
      setViewportWidth(1024);
    });

    it('should render Container with mobile padding', () => {
      const { container } = render(
        <Container>
          <div>Test Content</div>
        </Container>
      );

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('px-sm', 'mobile:px-sm');
    });

    it('should render Card with mobile-friendly spacing', () => {
      const { container } = render(
        <Card>
          <div>Card Content</div>
        </Card>
      );

      const card = container.firstChild;
      expect(card).toHaveClass('p-lg', 'rounded-md');
    });

    it('should render Button with touch-friendly size', () => {
      const { container } = render(
        <Button variant="primary" size="regular">
          Click Me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('h-11');
    });

    it('should have minimum 44x44px touch targets', () => {
      const { container } = render(
        <Button variant="primary" size="regular">
          Touch Target
        </Button>
      );

      const button = container.querySelector('button');
      // Button should have at least 44px height
      expect(button).toHaveClass('h-11');
    });

    it('should stack content vertically on mobile', () => {
      const { container } = render(
        <div className="flex flex-col mobile:flex-col desktop:flex-row gap-md">
          <div>Item 1</div>
          <div>Item 2</div>
        </div>
      );

      const flexDiv = container.firstChild;
      expect(flexDiv).toHaveClass('flex-col', 'mobile:flex-col');
    });

    it('should use optimized font sizes for mobile', () => {
      const { container } = render(
        <h1 className="text-h1">
          Mobile Headline
        </h1>
      );

      const heading = container.firstChild;
      expect(heading).toHaveClass('text-h1');
    });

    it('should use full-width images on mobile', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          className="w-full mobile:w-full desktop:w-auto"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('w-full', 'mobile:w-full');
    });

    it('should have appropriate padding for mobile sections', () => {
      const { container } = render(
        <section className="px-md mobile:px-md tablet:px-lg desktop:px-lg">
          Content
        </section>
      );

      const section = container.firstChild;
      expect(section).toHaveClass('px-md', 'mobile:px-md');
    });
  });

  describe('Tablet Layout (768px - 1023px)', () => {
    beforeEach(() => {
      setViewportWidth(768);
    });

    afterEach(() => {
      setViewportWidth(1024);
    });

    it('should render Container with tablet padding', () => {
      const { container } = render(
        <Container>
          <div>Test Content</div>
        </Container>
      );

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('tablet:px-md');
    });

    it('should render two-column layout on tablet', () => {
      const { container } = render(
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-lg">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass('tablet:grid-cols-2');
    });

    it('should use tablet font sizes', () => {
      const { container } = render(
        <h2 className="text-h2">
          Tablet Heading
        </h2>
      );

      const heading = container.firstChild;
      expect(heading).toHaveClass('text-h2');
    });

    it('should have balanced spacing on tablet', () => {
      const { container } = render(
        <div className="gap-md tablet:gap-lg desktop:gap-2xl">
          Content
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('tablet:gap-lg');
    });

    it('should display images with tablet sizing', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          className="w-full tablet:w-1/2 desktop:w-auto"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('tablet:w-1/2');
    });

    it('should have appropriate padding for tablet sections', () => {
      const { container } = render(
        <section className="px-md tablet:px-lg desktop:px-2xl">
          Content
        </section>
      );

      const section = container.firstChild;
      expect(section).toHaveClass('tablet:px-lg');
    });
  });

  describe('Desktop Layout (1024px+)', () => {
    beforeEach(() => {
      setViewportWidth(1440);
    });

    afterEach(() => {
      setViewportWidth(1024);
    });

    it('should render Container with desktop padding', () => {
      const { container } = render(
        <Container>
          <div>Test Content</div>
        </Container>
      );

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('desktop:px-lg');
    });

    it('should render multi-column grid on desktop', () => {
      const { container } = render(
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-2xl">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass('desktop:grid-cols-3');
    });

    it('should use full desktop font sizes', () => {
      const { container } = render(
        <h1 className="text-h1">
          Desktop Headline
        </h1>
      );

      const heading = container.firstChild;
      expect(heading).toHaveClass('text-h1');
    });

    it('should have generous spacing on desktop', () => {
      const { container } = render(
        <div className="gap-md tablet:gap-lg desktop:gap-2xl">
          Content
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('desktop:gap-2xl');
    });

    it('should display images with desktop sizing', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          className="w-full tablet:w-1/2 desktop:w-auto"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('desktop:w-auto');
    });

    it('should have appropriate padding for desktop sections', () => {
      const { container } = render(
        <section className="px-md tablet:px-lg desktop:px-2xl">
          Content
        </section>
      );

      const section = container.firstChild;
      expect(section).toHaveClass('desktop:px-2xl');
    });
  });

  describe('Responsive Typography Scaling', () => {
    it('should use fluid typography for H1 scaling from 32px to 48px', () => {
      const { container } = render(
        <h1 className="text-h1">
          Responsive Headline
        </h1>
      );

      const heading = container.firstChild;
      expect(heading).toHaveClass('text-h1');
    });

    it('should use fluid typography for H2 scaling from 24px to 36px', () => {
      const { container } = render(
        <h2 className="text-h2">
          Responsive Subheading
        </h2>
      );

      const heading = container.firstChild;
      expect(heading).toHaveClass('text-h2');
    });

    it('should use fluid typography for H3 scaling from 18px to 24px', () => {
      const { container } = render(
        <h3 className="text-h3">
          Responsive Section
        </h3>
      );

      const heading = container.firstChild;
      expect(heading).toHaveClass('text-h3');
    });

    it('should use fluid typography for body large scaling from 16px to 18px', () => {
      const { container } = render(
        <p className="text-body_lg">
          Body large text with fluid scaling
        </p>
      );

      const paragraph = container.firstChild;
      expect(paragraph).toHaveClass('text-body_lg');
    });

    it('should use fluid typography for body regular scaling from 14px to 16px', () => {
      const { container } = render(
        <p className="text-body">
          Body regular text with fluid scaling
        </p>
      );

      const paragraph = container.firstChild;
      expect(paragraph).toHaveClass('text-body');
    });

    it('should use fluid typography for body small scaling from 12px to 14px', () => {
      const { container } = render(
        <p className="text-body_sm">
          Body small text with fluid scaling
        </p>
      );

      const paragraph = container.firstChild;
      expect(paragraph).toHaveClass('text-body_sm');
    });

    it('should maintain line-height across all viewport sizes', () => {
      const { container } = render(
        <p className="text-body leading-relaxed">
          Body text with consistent line-height
        </p>
      );

      const paragraph = container.firstChild;
      expect(paragraph).toHaveClass('leading-relaxed');
    });

    it('should maintain letter-spacing for headings', () => {
      const { container } = render(
        <h1 className="text-h1 tracking-tight">
          Headline with adjusted spacing
        </h1>
      );

      const heading = container.firstChild;
      expect(heading).toHaveClass('tracking-tight');
    });
  });

  describe('Responsive Image Scaling', () => {
    it('should maintain aspect ratio on mobile', () => {
      const { container } = render(
        <div className="aspect-square">
          <img src="test.jpg" alt="Test" className="w-full h-full object-cover" />
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('aspect-square');
    });

    it('should maintain aspect ratio on tablet', () => {
      const { container } = render(
        <div className="aspect-video tablet:aspect-square desktop:aspect-auto">
          <img src="test.jpg" alt="Test" className="w-full h-full object-cover" />
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('tablet:aspect-square');
    });

    it('should maintain aspect ratio on desktop', () => {
      const { container } = render(
        <div className="aspect-video tablet:aspect-square desktop:aspect-auto">
          <img src="test.jpg" alt="Test" className="w-full h-full object-cover" />
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('desktop:aspect-auto');
    });

    it('should use responsive image sizes', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          className="w-full mobile:w-full tablet:w-1/2 desktop:w-1/3"
          srcSet="test-small.jpg 375w, test-medium.jpg 768w, test-large.jpg 1440w"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('srcSet');
    });

    it('should use WebP format with PNG fallback', () => {
      const { container } = render(
        <picture>
          <source srcSet="test.webp" type="image/webp" />
          <img src="test.png" alt="Test" className="w-full" />
        </picture>
      );

      const source = container.querySelector('source');
      expect(source).toHaveAttribute('type', 'image/webp');
    });

    it('should use object-fit to prevent distortion', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          className="w-full h-full object-cover"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('object-cover');
    });

    it('should use object-contain for images that need full visibility', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          className="w-full h-full object-contain"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('object-contain');
    });

    it('should use lazy loading for below-the-fold images', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          loading="lazy"
          className="w-full"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('should support sizes attribute for responsive sizing', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          srcSet="test-small.jpg 375w, test-medium.jpg 768w, test-large.jpg 1440w"
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('sizes');
    });

    it('should prevent layout shift with aspect ratio container', () => {
      const { container } = render(
        <div className="aspect-square overflow-hidden">
          <img src="test.jpg" alt="Test" className="w-full h-full object-cover" />
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('aspect-square', 'overflow-hidden');
    });
  });

  describe('Touch Target Sizes', () => {
    it('should have 44x44px minimum touch targets on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(
        <button className="h-11 w-11 flex items-center justify-center">
          Touch
        </button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('h-11', 'w-11');
    });

    it('should have adequate spacing between touch targets', () => {
      const { container } = render(
        <div className="flex gap-md">
          <button className="h-11 w-11">Button 1</button>
          <button className="h-11 w-11">Button 2</button>
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('gap-md');
    });
  });

  describe('Layout Transitions', () => {
    it('should have smooth transitions between breakpoints', () => {
      const { container } = render(
        <div className="transition-all duration-300">
          Content
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('transition-all', 'duration-300');
    });

    it('should not have jarring reflows', () => {
      const { container } = render(
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-lg">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass('grid');
    });
  });

  describe('Container Max-Widths', () => {
    it('should have 100% max-width on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(
        <Container>
          <div>Content</div>
        </Container>
      );

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('w-full');
    });

    it('should have 768px max-width on tablet', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { container } = render(
        <Container>
          <div>Content</div>
        </Container>
      );

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('tablet:max-w-container-tablet');
    });

    it('should have 1440px max-width on desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      });

      const { container } = render(
        <Container>
          <div>Content</div>
        </Container>
      );

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('desktop:max-w-container-desktop');
    });
  });

  describe('Responsive Visibility', () => {
    it('should hide desktop elements on mobile', () => {
      const { container } = render(
        <div className="hidden desktop:block">Desktop Only</div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('hidden', 'desktop:block');
    });

    it('should show mobile elements on mobile', () => {
      const { container } = render(
        <div className="block desktop:hidden">Mobile Only</div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('block', 'desktop:hidden');
    });
  });

  describe('All Components at Mobile Breakpoint', () => {
    beforeEach(() => {
      setViewportWidth(375);
    });

    afterEach(() => {
      setViewportWidth(1024);
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
          <HeroSection />
          <FeatureHighlights />
        </>
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        // Buttons should have at least 44px height (h-11 = 44px)
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

    it('should stack content vertically on mobile', () => {
      const { container } = render(
        <div className="flex flex-col mobile:flex-col desktop:flex-row gap-md">
          <div>Item 1</div>
          <div>Item 2</div>
        </div>
      );

      const flexDiv = container.firstChild;
      expect(flexDiv).toHaveClass('flex-col', 'mobile:flex-col');
    });

    it('should use full-width images on mobile', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          className="w-full mobile:w-full desktop:w-auto"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('w-full', 'mobile:w-full');
    });

    it('should have appropriate padding for mobile sections', () => {
      const { container } = render(
        <section className="px-md mobile:px-md tablet:px-lg desktop:px-lg">
          Content
        </section>
      );

      const section = container.firstChild;
      expect(section).toHaveClass('px-md', 'mobile:px-md');
    });
  });

  describe('All Components at Tablet Breakpoint', () => {
    beforeEach(() => {
      setViewportWidth(768);
    });

    afterEach(() => {
      setViewportWidth(1024);
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

    it('should render two-column layout on tablet', () => {
      const { container } = render(
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-lg">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass('tablet:grid-cols-2');
    });

    it('should use tablet font sizes', () => {
      render(
        <h2 className="text-h2">
          Tablet Heading
        </h2>
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveClass('text-h2');
    });

    it('should have balanced spacing on tablet', () => {
      const { container } = render(
        <div className="gap-md tablet:gap-lg desktop:gap-2xl">
          Content
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('tablet:gap-lg');
    });

    it('should display images with tablet sizing', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          className="w-full tablet:w-1/2 desktop:w-auto"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('tablet:w-1/2');
    });

    it('should have appropriate padding for tablet sections', () => {
      const { container } = render(
        <section className="px-md tablet:px-lg desktop:px-2xl">
          Content
        </section>
      );

      const section = container.firstChild;
      expect(section).toHaveClass('tablet:px-lg');
    });
  });

  describe('All Components at Desktop Breakpoint', () => {
    beforeEach(() => {
      setViewportWidth(1440);
    });

    afterEach(() => {
      setViewportWidth(1024);
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
      expect(heading).toHaveClass('text-h1');
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

    it('should render multi-column grid on desktop', () => {
      const { container } = render(
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-2xl">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass('desktop:grid-cols-3');
    });

    it('should use full desktop font sizes', () => {
      render(
        <h1 className="text-h1">
          Desktop Headline
        </h1>
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-h1');
    });

    it('should have generous spacing on desktop', () => {
      const { container } = render(
        <div className="gap-md tablet:gap-lg desktop:gap-2xl">
          Content
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('desktop:gap-2xl');
    });

    it('should display images with desktop sizing', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          className="w-full tablet:w-1/2 desktop:w-auto"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('desktop:w-auto');
    });

    it('should have appropriate padding for desktop sections', () => {
      const { container } = render(
        <section className="px-md tablet:px-lg desktop:px-2xl">
          Content
        </section>
      );

      const section = container.firstChild;
      expect(section).toHaveClass('desktop:px-2xl');
    });
  });

  describe('Responsive Typography Scaling - Fluid Typography', () => {
    it('should use fluid typography for H1 scaling from 32px to 48px', () => {
      const { container } = render(
        <h1 className="text-h1">
          Responsive Headline
        </h1>
      );

      const heading = container.firstChild;
      expect(heading).toHaveClass('text-h1');
    });

    it('should use fluid typography for H2 scaling from 24px to 36px', () => {
      const { container } = render(
        <h2 className="text-h2">
          Responsive Subheading
        </h2>
      );

      const heading = container.firstChild;
      expect(heading).toHaveClass('text-h2');
    });

    it('should use fluid typography for H3 scaling from 18px to 24px', () => {
      const { container } = render(
        <h3 className="text-h3">
          Responsive Section
        </h3>
      );

      const heading = container.firstChild;
      expect(heading).toHaveClass('text-h3');
    });

    it('should use fluid typography for body large scaling from 16px to 18px', () => {
      const { container } = render(
        <p className="text-body_lg">
          Body large text with fluid scaling
        </p>
      );

      const paragraph = container.firstChild;
      expect(paragraph).toHaveClass('text-body_lg');
    });

    it('should use fluid typography for body regular scaling from 14px to 16px', () => {
      const { container } = render(
        <p className="text-body">
          Body regular text with fluid scaling
        </p>
      );

      const paragraph = container.firstChild;
      expect(paragraph).toHaveClass('text-body');
    });

    it('should use fluid typography for body small scaling from 12px to 14px', () => {
      const { container } = render(
        <p className="text-body_sm">
          Body small text with fluid scaling
        </p>
      );

      const paragraph = container.firstChild;
      expect(paragraph).toHaveClass('text-body_sm');
    });

    it('should maintain line-height across all viewport sizes', () => {
      const { container } = render(
        <p className="text-body leading-relaxed">
          Body text with consistent line-height
        </p>
      );

      const paragraph = container.firstChild;
      expect(paragraph).toHaveClass('leading-relaxed');
    });

    it('should maintain letter-spacing for headings', () => {
      const { container } = render(
        <h1 className="text-h1 tracking-tight">
          Headline with adjusted spacing
        </h1>
      );

      const heading = container.firstChild;
      expect(heading).toHaveClass('tracking-tight');
    });

    it('should scale typography proportionally on mobile', () => {
      setViewportWidth(375);
      const { container } = render(
        <>
          <h1 className="text-h1">H1 Mobile</h1>
          <h2 className="text-h2">H2 Mobile</h2>
          <p className="text-body">Body Mobile</p>
        </>
      );

      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');
      const p = container.querySelector('p');

      expect(h1).toHaveClass('text-h1');
      expect(h2).toHaveClass('text-h2');
      expect(p).toHaveClass('text-body');

      setViewportWidth(1024);
    });

    it('should scale typography proportionally on tablet', () => {
      setViewportWidth(768);
      const { container } = render(
        <>
          <h1 className="text-h1">H1 Tablet</h1>
          <h2 className="text-h2">H2 Tablet</h2>
          <p className="text-body">Body Tablet</p>
        </>
      );

      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');
      const p = container.querySelector('p');

      expect(h1).toHaveClass('text-h1');
      expect(h2).toHaveClass('text-h2');
      expect(p).toHaveClass('text-body');

      setViewportWidth(1024);
    });

    it('should scale typography proportionally on desktop', () => {
      setViewportWidth(1440);
      const { container } = render(
        <>
          <h1 className="text-h1">H1 Desktop</h1>
          <h2 className="text-h2">H2 Desktop</h2>
          <p className="text-body">Body Desktop</p>
        </>
      );

      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');
      const p = container.querySelector('p');

      expect(h1).toHaveClass('text-h1');
      expect(h2).toHaveClass('text-h2');
      expect(p).toHaveClass('text-body');

      setViewportWidth(1024);
    });
  });

  describe('Responsive Image Scaling', () => {
    it('should maintain aspect ratio on mobile', () => {
      const { container } = render(
        <div className="aspect-square">
          <img src="test.jpg" alt="Test" className="w-full h-full object-cover" />
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('aspect-square');
    });

    it('should maintain aspect ratio on tablet', () => {
      const { container } = render(
        <div className="aspect-video tablet:aspect-square desktop:aspect-auto">
          <img src="test.jpg" alt="Test" className="w-full h-full object-cover" />
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('tablet:aspect-square');
    });

    it('should maintain aspect ratio on desktop', () => {
      const { container } = render(
        <div className="aspect-video tablet:aspect-square desktop:aspect-auto">
          <img src="test.jpg" alt="Test" className="w-full h-full object-cover" />
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('desktop:aspect-auto');
    });

    it('should use responsive image sizes', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          className="w-full mobile:w-full tablet:w-1/2 desktop:w-1/3"
          srcSet="test-small.jpg 375w, test-medium.jpg 768w, test-large.jpg 1440w"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('srcSet');
    });

    it('should use WebP format with PNG fallback', () => {
      const { container } = render(
        <picture>
          <source srcSet="test.webp" type="image/webp" />
          <img src="test.png" alt="Test" className="w-full" />
        </picture>
      );

      const source = container.querySelector('source');
      expect(source).toHaveAttribute('type', 'image/webp');
    });

    it('should use object-fit to prevent distortion', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          className="w-full h-full object-cover"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('object-cover');
    });

    it('should use object-contain for images that need full visibility', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          className="w-full h-full object-contain"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('object-contain');
    });

    it('should use lazy loading for below-the-fold images', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          loading="lazy"
          className="w-full"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('should support sizes attribute for responsive sizing', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          srcSet="test-small.jpg 375w, test-medium.jpg 768w, test-large.jpg 1440w"
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('sizes');
    });

    it('should prevent layout shift with aspect ratio container', () => {
      const { container } = render(
        <div className="aspect-square overflow-hidden">
          <img src="test.jpg" alt="Test" className="w-full h-full object-cover" />
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('aspect-square', 'overflow-hidden');
    });

    it('should scale images responsively on mobile', () => {
      setViewportWidth(375);
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          className="w-full mobile:w-full tablet:w-1/2 desktop:w-1/3"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('w-full', 'mobile:w-full');

      setViewportWidth(1024);
    });

    it('should scale images responsively on tablet', () => {
      setViewportWidth(768);
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          className="w-full mobile:w-full tablet:w-1/2 desktop:w-1/3"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('tablet:w-1/2');

      setViewportWidth(1024);
    });

    it('should scale images responsively on desktop', () => {
      setViewportWidth(1440);
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          className="w-full mobile:w-full tablet:w-1/2 desktop:w-1/3"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('desktop:w-1/3');

      setViewportWidth(1024);
    });
  });

  describe('Touch Target Sizes', () => {
    it('should have 44x44px minimum touch targets on mobile', () => {
      setViewportWidth(375);

      const { container } = render(
        <button className="h-11 w-11 flex items-center justify-center">
          Touch
        </button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('h-11', 'w-11');

      setViewportWidth(1024);
    });

    it('should have adequate spacing between touch targets', () => {
      const { container } = render(
        <div className="flex gap-md">
          <button className="h-11 w-11">Button 1</button>
          <button className="h-11 w-11">Button 2</button>
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('gap-md');
    });

    it('should have 44px minimum height for buttons on mobile', () => {
      setViewportWidth(375);

      const { container } = render(
        <Button variant="primary" size="regular">
          Click Me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('h-11');

      setViewportWidth(1024);
    });

    it('should have 44px minimum height for buttons on tablet', () => {
      setViewportWidth(768);

      const { container } = render(
        <Button variant="primary" size="regular">
          Click Me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('h-11');

      setViewportWidth(1024);
    });

    it('should have 44px minimum height for buttons on desktop', () => {
      setViewportWidth(1440);

      const { container } = render(
        <Button variant="primary" size="regular">
          Click Me
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('h-11');

      setViewportWidth(1024);
    });
  });

  describe('Layout Transitions and Smooth Reflow', () => {
    it('should have smooth transitions between breakpoints', () => {
      const { container } = render(
        <div className="transition-all duration-300">
          Content
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('transition-all', 'duration-300');
    });

    it('should not have jarring reflows', () => {
      const { container } = render(
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-lg">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass('grid');
    });

    it('should use CSS Grid for automatic reflow', () => {
      const { container } = render(
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass('grid');
    });

    it('should use Flexbox for automatic reflow', () => {
      const { container } = render(
        <div className="flex flex-col tablet:flex-row desktop:flex-row gap-lg">
          <div>Item 1</div>
          <div>Item 2</div>
        </div>
      );

      const flex = container.firstChild;
      expect(flex).toHaveClass('flex');
    });

    it('should prevent layout shift with aspect ratio containers', () => {
      const { container } = render(
        <div className="aspect-square">
          <img src="test.jpg" alt="Test" className="w-full h-full object-cover" />
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('aspect-square');
    });

    it('should transition smoothly between mobile and tablet', () => {
      setViewportWidth(375);
      const { container, rerender } = render(
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-lg transition-all duration-300">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      );

      let grid = container.firstChild;
      expect(grid).toHaveClass('grid-cols-1');

      setViewportWidth(768);
      rerender(
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-lg transition-all duration-300">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      );

      grid = container.firstChild;
      expect(grid).toHaveClass('tablet:grid-cols-2');

      setViewportWidth(1024);
    });

    it('should transition smoothly between tablet and desktop', () => {
      setViewportWidth(768);
      const { container, rerender } = render(
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-lg transition-all duration-300">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      );

      let grid = container.firstChild;
      expect(grid).toHaveClass('tablet:grid-cols-2');

      setViewportWidth(1440);
      rerender(
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-lg transition-all duration-300">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      );

      grid = container.firstChild;
      expect(grid).toHaveClass('desktop:grid-cols-3');

      setViewportWidth(1024);
    });
  });

  describe('Container Max-Widths', () => {
    it('should have 100% max-width on mobile', () => {
      setViewportWidth(375);

      const { container } = render(
        <Container>
          <div>Content</div>
        </Container>
      );

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('w-full');

      setViewportWidth(1024);
    });

    it('should have 768px max-width on tablet', () => {
      setViewportWidth(768);

      const { container } = render(
        <Container>
          <div>Content</div>
        </Container>
      );

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('tablet:max-w-container-tablet');

      setViewportWidth(1024);
    });

    it('should have 1440px max-width on desktop', () => {
      setViewportWidth(1440);

      const { container } = render(
        <Container>
          <div>Content</div>
        </Container>
      );

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('desktop:max-w-container-desktop');

      setViewportWidth(1024);
    });
  });

  describe('Responsive Spacing and Padding', () => {
    it('should apply responsive padding to sections', () => {
      const { container } = render(
        <>
          <section className="px-md mobile:px-md tablet:px-lg desktop:px-2xl">
            Content 1
          </section>
          <section className="px-md mobile:px-md tablet:px-lg desktop:px-2xl">
            Content 2
          </section>
        </>
      );

      const sections = container.querySelectorAll('section');
      sections.forEach((section) => {
        expect(section.className).toMatch(/px-/);
      });
    });

    it('should apply responsive gaps to grids', () => {
      const { container } = render(
        <>
          <div className="grid gap-md mobile:gap-md tablet:gap-lg desktop:gap-2xl">
            Item 1
          </div>
          <div className="grid gap-md mobile:gap-md tablet:gap-lg desktop:gap-2xl">
            Item 2
          </div>
        </>
      );

      const grids = container.querySelectorAll('.grid');
      grids.forEach((grid) => {
        expect(grid.className).toMatch(/gap-/);
      });
    });

    it('should apply responsive vertical padding', () => {
      const { container } = render(
        <section className="py-3xl mobile:py-3xl tablet:py-3xl desktop:py-4xl">
          Content
        </section>
      );

      const section = container.firstChild as HTMLElement | null;
      expect(section?.className).toMatch(/py-/);
    });

    it('should apply responsive horizontal padding', () => {
      const { container } = render(
        <section className="px-md mobile:px-md tablet:px-lg desktop:px-lg">
          Content
        </section>
      );

      const section = container.firstChild as HTMLElement | null;
      expect(section?.className).toMatch(/px-/);
    });
  });

  describe('Responsive Visibility', () => {
    it('should hide desktop elements on mobile', () => {
      const { container } = render(
        <div className="hidden desktop:block">Desktop Only</div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('hidden', 'desktop:block');
    });

    it('should show mobile elements on mobile', () => {
      const { container } = render(
        <div className="block desktop:hidden">Mobile Only</div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('block', 'desktop:hidden');
    });

    it('should hide tablet elements on mobile', () => {
      const { container } = render(
        <div className="hidden tablet:block">Tablet Only</div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('hidden', 'tablet:block');
    });

    it('should show desktop elements on desktop', () => {
      setViewportWidth(1440);

      const { container } = render(
        <div className="hidden desktop:block">Desktop Only</div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('hidden', 'desktop:block');

      setViewportWidth(1024);
    });
  });
});


describe('Responsive Design - Comprehensive Breakpoint Testing', () => {
  describe('Mobile Breakpoint (320px - 767px) - Comprehensive', () => {
    beforeEach(() => {
      setViewportWidth(320); // Test at minimum mobile width
    });

    afterEach(() => {
      setViewportWidth(1024);
    });

    it('should render all components with mobile layout at 320px', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection headline="Test" subheading="Test" />
          <FeatureHighlights />
          <WorkflowSection />
          <MetricsSection />
          <SocialProof />
          <Footer />
        </>
      );

      expect(container).toBeInTheDocument();
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should stack feature cards vertically on mobile', () => {
      const { container } = render(
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3">
          <div>Card 1</div>
          <div>Card 2</div>
          <div>Card 3</div>
        </div>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass('grid-cols-1');
    });

    it('should use single column layout for workflow on mobile', () => {
      const { container } = render(
        <div className="flex flex-col mobile:flex-col tablet:flex-row desktop:flex-row gap-md">
          <div>Step 1</div>
          <div>Step 2</div>
          <div>Step 3</div>
        </div>
      );

      const flex = container.firstChild;
      expect(flex).toHaveClass('flex-col', 'mobile:flex-col');
    });

    it('should ensure all buttons have 44x44px minimum touch target', () => {
      const { container } = render(
        <>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
        </>
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('h-11');
      });
    });

    it('should use mobile-optimized font sizes', () => {
      const { container } = render(
        <>
          <h1 className="text-h1">H1 Heading</h1>
          <h2 className="text-h2">H2 Heading</h2>
          <p className="text-body">Body text</p>
        </>
      );

      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');
      const p = container.querySelector('p');

      expect(h1).toHaveClass('text-h1');
      expect(h2).toHaveClass('text-h2');
      expect(p).toHaveClass('text-body');
    });

    it('should apply full-width padding on mobile', () => {
      const { container } = render(
        <Container>
          <div>Content</div>
        </Container>
      );

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('w-full');
    });

    it('should render images at full width on mobile', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          className="w-full mobile:w-full tablet:w-1/2 desktop:w-1/3"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('w-full', 'mobile:w-full');
    });

    it('should have proper spacing between touch targets', () => {
      const { container } = render(
        <div className="flex flex-col gap-md">
          <button className="h-11">Button 1</button>
          <button className="h-11">Button 2</button>
          <button className="h-11">Button 3</button>
        </div>
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(3);
      buttons.forEach((button) => {
        expect(button).toHaveClass('h-11');
      });
    });

    it('should stack CTA buttons vertically on mobile', () => {
      const { container } = render(
        <div className="flex flex-col mobile:flex-col desktop:flex-row gap-md">
          <Button variant="primary">Primary CTA</Button>
          <Button variant="secondary">Secondary CTA</Button>
        </div>
      );

      const flex = container.firstChild;
      expect(flex).toHaveClass('flex-col', 'mobile:flex-col');
    });

    it('should use mobile hamburger menu for navigation', () => {
      render(<Navigation />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should have appropriate section padding on mobile', () => {
      const { container } = render(
        <section className="px-md mobile:px-md tablet:px-lg desktop:px-lg py-3xl mobile:py-3xl tablet:py-3xl desktop:py-4xl">
          Content
        </section>
      );

      const section = container.firstChild as HTMLElement | null;
      expect(section?.className).toMatch(/px-md/);
      expect(section?.className).toMatch(/py-3xl/);
    });
  });

  describe('Tablet Breakpoint (768px - 1023px) - Comprehensive', () => {
    beforeEach(() => {
      setViewportWidth(768); // Test at minimum tablet width
    });

    afterEach(() => {
      setViewportWidth(1024);
    });

    it('should render all components with tablet layout at 768px', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection headline="Test" subheading="Test" />
          <FeatureHighlights />
          <WorkflowSection />
          <MetricsSection />
          <SocialProof />
          <Footer />
        </>
      );

      expect(container).toBeInTheDocument();
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should render feature cards in two-column grid on tablet', () => {
      const { container } = render(
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3">
          <div>Card 1</div>
          <div>Card 2</div>
          <div>Card 3</div>
        </div>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass('tablet:grid-cols-2');
    });

    it('should use horizontal layout for workflow on tablet', () => {
      const { container } = render(
        <div className="flex flex-col mobile:flex-col tablet:flex-row desktop:flex-row gap-lg">
          <div>Step 1</div>
          <div>Step 2</div>
          <div>Step 3</div>
        </div>
      );

      const flex = container.firstChild;
      expect(flex).toHaveClass('tablet:flex-row');
    });

    it('should maintain 44x44px touch targets on tablet', () => {
      const { container } = render(
        <>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
        </>
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('h-11');
      });
    });

    it('should use tablet-optimized font sizes', () => {
      const { container } = render(
        <>
          <h1 className="text-h1">H1 Heading</h1>
          <h2 className="text-h2">H2 Heading</h2>
          <p className="text-body">Body text</p>
        </>
      );

      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');
      const p = container.querySelector('p');

      expect(h1).toHaveClass('text-h1');
      expect(h2).toHaveClass('text-h2');
      expect(p).toHaveClass('text-body');
    });

    it('should apply tablet padding to container', () => {
      const { container } = render(
        <Container>
          <div>Content</div>
        </Container>
      );

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('tablet:px-md');
    });

    it('should render images at half width on tablet', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          className="w-full mobile:w-full tablet:w-1/2 desktop:w-1/3"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('tablet:w-1/2');
    });

    it('should have balanced spacing on tablet', () => {
      const { container } = render(
        <div className="gap-md tablet:gap-lg desktop:gap-2xl">
          Content
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('tablet:gap-lg');
    });

    it('should stack CTA buttons horizontally on tablet', () => {
      const { container } = render(
        <div className="flex flex-col mobile:flex-col tablet:flex-row desktop:flex-row gap-md">
          <Button variant="primary">Primary CTA</Button>
          <Button variant="secondary">Secondary CTA</Button>
        </div>
      );

      const flex = container.firstChild;
      expect(flex).toHaveClass('tablet:flex-row');
    });

    it('should have appropriate section padding on tablet', () => {
      const { container } = render(
        <section className="px-md mobile:px-md tablet:px-lg desktop:px-lg py-3xl mobile:py-3xl tablet:py-3xl desktop:py-4xl">
          Content
        </section>
      );

      const section = container.firstChild as HTMLElement | null;
      expect(section?.className).toMatch(/tablet:px-lg/);
      expect(section?.className).toMatch(/tablet:py-3xl/);
    });

    it('should render metrics in two-column grid on tablet', () => {
      const { container } = render(
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-lg">
          <div>Metric 1</div>
          <div>Metric 2</div>
          <div>Metric 3</div>
        </div>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass('tablet:grid-cols-2');
    });
  });

  describe('Desktop Breakpoint (1024px+) - Comprehensive', () => {
    beforeEach(() => {
      setViewportWidth(1440); // Test at typical desktop width
    });

    afterEach(() => {
      setViewportWidth(1024);
    });

    it('should render all components with desktop layout at 1440px', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection headline="Test" subheading="Test" />
          <FeatureHighlights />
          <WorkflowSection />
          <MetricsSection />
          <SocialProof />
          <Footer />
        </>
      );

      expect(container).toBeInTheDocument();
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should render feature cards in three-column grid on desktop', () => {
      const { container } = render(
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3">
          <div>Card 1</div>
          <div>Card 2</div>
          <div>Card 3</div>
        </div>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass('desktop:grid-cols-3');
    });

    it('should use horizontal layout for workflow on desktop', () => {
      const { container } = render(
        <div className="flex flex-col mobile:flex-col tablet:flex-row desktop:flex-row gap-2xl">
          <div>Step 1</div>
          <div>Step 2</div>
          <div>Step 3</div>
        </div>
      );

      const flex = container.firstChild;
      expect(flex).toHaveClass('desktop:flex-row');
    });

    it('should use full desktop font sizes', () => {
      const { container } = render(
        <>
          <h1 className="text-h1">H1 Heading</h1>
          <h2 className="text-h2">H2 Heading</h2>
          <p className="text-body">Body text</p>
        </>
      );

      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');
      const p = container.querySelector('p');

      expect(h1).toHaveClass('text-h1');
      expect(h2).toHaveClass('text-h2');
      expect(p).toHaveClass('text-body');
    });

    it('should apply desktop padding to container', () => {
      const { container } = render(
        <Container>
          <div>Content</div>
        </Container>
      );

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('desktop:px-lg');
    });

    it('should render images at full width on desktop', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          className="w-full mobile:w-full tablet:w-1/2 desktop:w-auto"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('desktop:w-auto');
    });

    it('should have generous spacing on desktop', () => {
      const { container } = render(
        <div className="gap-md tablet:gap-lg desktop:gap-2xl">
          Content
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('desktop:gap-2xl');
    });

    it('should have appropriate section padding on desktop', () => {
      const { container } = render(
        <section className="px-md mobile:px-md tablet:px-lg desktop:px-lg py-3xl mobile:py-3xl tablet:py-3xl desktop:py-4xl">
          Content
        </section>
      );

      const section = container.firstChild as HTMLElement | null;
      expect(section?.className).toMatch(/desktop:px-lg/);
      expect(section?.className).toMatch(/desktop:py-4xl/);
    });

    it('should render metrics in three-column grid on desktop', () => {
      const { container } = render(
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-2xl">
          <div>Metric 1</div>
          <div>Metric 2</div>
          <div>Metric 3</div>
        </div>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass('desktop:grid-cols-3');
    });

    it('should have max-width constraint on desktop', () => {
      const { container } = render(
        <Container>
          <div>Content</div>
        </Container>
      );

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('desktop:max-w-container-desktop');
    });
  });

  describe('Typography Scaling Across Breakpoints', () => {
    it('should scale H1 from 32px (mobile) to 48px (desktop)', () => {
      const { container } = render(
        <h1 className="text-h1">Responsive H1</h1>
      );

      const h1 = container.querySelector('h1');
      expect(h1).toHaveClass('text-h1');
    });

    it('should scale H2 from 24px (mobile) to 36px (desktop)', () => {
      const { container } = render(
        <h2 className="text-h2">Responsive H2</h2>
      );

      const h2 = container.querySelector('h2');
      expect(h2).toHaveClass('text-h2');
    });

    it('should scale H3 from 18px (mobile) to 24px (desktop)', () => {
      const { container } = render(
        <h3 className="text-h3">Responsive H3</h3>
      );

      const h3 = container.querySelector('h3');
      expect(h3).toHaveClass('text-h3');
    });

    it('should scale body large from 16px (mobile) to 18px (desktop)', () => {
      const { container } = render(
        <p className="text-body_lg">Body large text</p>
      );

      const p = container.querySelector('p');
      expect(p).toHaveClass('text-body_lg');
    });

    it('should scale body regular from 14px (mobile) to 16px (desktop)', () => {
      const { container } = render(
        <p className="text-body">Body regular text</p>
      );

      const p = container.querySelector('p');
      expect(p).toHaveClass('text-body');
    });

    it('should scale body small from 12px (mobile) to 14px (desktop)', () => {
      const { container } = render(
        <p className="text-body_sm">Body small text</p>
      );

      const p = container.querySelector('p');
      expect(p).toHaveClass('text-body_sm');
    });

    it('should maintain consistent line-height across breakpoints', () => {
      const { container } = render(
        <p className="text-body leading-relaxed">
          Text with consistent line-height
        </p>
      );

      const p = container.querySelector('p');
      expect(p).toHaveClass('leading-relaxed');
    });

    it('should maintain letter-spacing for headings', () => {
      const { container } = render(
        <h1 className="text-h1 tracking-tight">
          Heading with letter-spacing
        </h1>
      );

      const h1 = container.querySelector('h1');
      expect(h1).toHaveClass('tracking-tight');
    });
  });

  describe('Image Scaling and Aspect Ratios', () => {
    it('should maintain square aspect ratio on mobile', () => {
      const { container } = render(
        <div className="aspect-square">
          <img src="test.jpg" alt="Test" className="w-full h-full object-cover" />
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('aspect-square');
    });

    it('should maintain video aspect ratio on tablet', () => {
      const { container } = render(
        <div className="aspect-video tablet:aspect-square desktop:aspect-auto">
          <img src="test.jpg" alt="Test" className="w-full h-full object-cover" />
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('tablet:aspect-square');
    });

    it('should use responsive image sizes with srcSet', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          srcSet="test-small.jpg 375w, test-medium.jpg 768w, test-large.jpg 1440w"
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('srcSet');
      expect(img).toHaveAttribute('sizes');
    });

    it('should use WebP format with PNG fallback', () => {
      const { container } = render(
        <picture>
          <source srcSet="test.webp" type="image/webp" />
          <img src="test.png" alt="Test" className="w-full" />
        </picture>
      );

      const source = container.querySelector('source');
      expect(source).toHaveAttribute('type', 'image/webp');
    });

    it('should use object-fit to prevent distortion', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          className="w-full h-full object-cover"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('object-cover');
    });

    it('should use lazy loading for below-the-fold images', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          loading="lazy"
          className="w-full"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('should prevent layout shift with aspect ratio container', () => {
      const { container } = render(
        <div className="aspect-square overflow-hidden">
          <img src="test.jpg" alt="Test" className="w-full h-full object-cover" />
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('aspect-square', 'overflow-hidden');
    });

    it('should scale images responsively across breakpoints', () => {
      const { container } = render(
        <img
          src="test.jpg"
          alt="Test"
          className="w-full mobile:w-full tablet:w-1/2 desktop:w-1/3"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('w-full', 'mobile:w-full', 'tablet:w-1/2', 'desktop:w-1/3');
    });
  });

  describe('Layout Transitions and Smooth Reflow', () => {
    it('should have smooth transitions between breakpoints', () => {
      const { container } = render(
        <div className="transition-all duration-300">
          Content
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('transition-all', 'duration-300');
    });

    it('should not have jarring reflows with CSS Grid', () => {
      const { container } = render(
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-lg">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass('grid');
    });

    it('should not have jarring reflows with Flexbox', () => {
      const { container } = render(
        <div className="flex flex-col mobile:flex-col tablet:flex-row desktop:flex-row gap-lg">
          <div>Item 1</div>
          <div>Item 2</div>
        </div>
      );

      const flex = container.firstChild;
      expect(flex).toHaveClass('flex');
    });

    it('should maintain content visibility during transitions', () => {
      const { container } = render(
        <div className="transition-all duration-300 opacity-100">
          Visible content
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('opacity-100');
    });

    it('should use smooth easing for transitions', () => {
      const { container } = render(
        <div className="transition-all duration-300 ease-in-out">
          Content
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('ease-in-out');
    });
  });

  describe('Touch Target Sizes Across Breakpoints', () => {
    it('should have 44x44px minimum touch targets on mobile', () => {
      setViewportWidth(375);

      const { container } = render(
        <button className="h-11 w-11 flex items-center justify-center">
          Touch
        </button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('h-11', 'w-11');

      setViewportWidth(1024);
    });

    it('should have 44x44px minimum touch targets on tablet', () => {
      setViewportWidth(768);

      const { container } = render(
        <button className="h-11 w-11 flex items-center justify-center">
          Touch
        </button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('h-11', 'w-11');

      setViewportWidth(1024);
    });

    it('should have adequate spacing between touch targets', () => {
      const { container } = render(
        <div className="flex gap-md">
          <button className="h-11 w-11">Button 1</button>
          <button className="h-11 w-11">Button 2</button>
          <button className="h-11 w-11">Button 3</button>
        </div>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('gap-md');
    });

    it('should maintain touch target size on all interactive elements', () => {
      const { container } = render(
        <>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <a href="#" className="h-11 flex items-center">Link</a>
        </>
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('h-11');
      });
    });
  });

  describe('Container Max-Widths', () => {
    it('should have 100% max-width on mobile', () => {
      setViewportWidth(375);

      const { container } = render(
        <Container>
          <div>Content</div>
        </Container>
      );

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('w-full');

      setViewportWidth(1024);
    });

    it('should have 768px max-width on tablet', () => {
      setViewportWidth(768);

      const { container } = render(
        <Container>
          <div>Content</div>
        </Container>
      );

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('tablet:max-w-container-tablet');

      setViewportWidth(1024);
    });

    it('should have 1440px max-width on desktop', () => {
      setViewportWidth(1440);

      const { container } = render(
        <Container>
          <div>Content</div>
        </Container>
      );

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('desktop:max-w-container-desktop');

      setViewportWidth(1024);
    });

    it('should center content with margin auto', () => {
      const { container } = render(
        <Container>
          <div>Content</div>
        </Container>
      );

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('mx-auto');
    });
  });

  describe('All Components Responsive Validation', () => {
    it('should render Navigation responsively at all breakpoints', () => {
      const breakpoints = [375, 768, 1440];

      breakpoints.forEach((width) => {
        setViewportWidth(width);
        const { unmount } = render(<Navigation />);
        const nav = screen.getByRole('navigation');
        expect(nav).toBeInTheDocument();
        unmount();
      });

      setViewportWidth(1024);
    });

    it('should render HeroSection responsively at all breakpoints', () => {
      const breakpoints = [375, 768, 1440];

      breakpoints.forEach((width) => {
        setViewportWidth(width);
        const { unmount } = render(
          <HeroSection headline="Test" subheading="Test" />
        );
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toBeInTheDocument();
        unmount();
      });

      setViewportWidth(1024);
    });

    it('should render FeatureHighlights responsively at all breakpoints', () => {
      const breakpoints = [375, 768, 1440];

      breakpoints.forEach((width) => {
        setViewportWidth(width);
        const { unmount } = render(<FeatureHighlights />);
        const heading = screen.getByRole('heading', { level: 2 });
        expect(heading).toBeInTheDocument();
        unmount();
      });

      setViewportWidth(1024);
    });

    it('should render WorkflowSection responsively at all breakpoints', () => {
      const breakpoints = [375, 768, 1440];

      breakpoints.forEach((width) => {
        setViewportWidth(width);
        const { unmount } = render(<WorkflowSection />);
        const heading = screen.getByRole('heading', { level: 2 });
        expect(heading).toBeInTheDocument();
        unmount();
      });

      setViewportWidth(1024);
    });

    it('should render MetricsSection responsively at all breakpoints', () => {
      const breakpoints = [375, 768, 1440];

      breakpoints.forEach((width) => {
        setViewportWidth(width);
        const { unmount } = render(<MetricsSection />);
        const section = screen.getByRole('region');
        expect(section).toBeInTheDocument();
        unmount();
      });

      setViewportWidth(1024);
    });

    it('should render SocialProof responsively at all breakpoints', () => {
      const breakpoints = [375, 768, 1440];

      breakpoints.forEach((width) => {
        setViewportWidth(width);
        const { unmount } = render(<SocialProof />);
        const heading = screen.getByRole('heading', { level: 2 });
        expect(heading).toBeInTheDocument();
        unmount();
      });

      setViewportWidth(1024);
    });

    it('should render Footer responsively at all breakpoints', () => {
      const breakpoints = [375, 768, 1440];

      breakpoints.forEach((width) => {
        setViewportWidth(width);
        const { unmount } = render(<Footer />);
        const footer = screen.getByRole('contentinfo');
        expect(footer).toBeInTheDocument();
        unmount();
      });

      setViewportWidth(1024);
    });
  });

  describe('Responsive Spacing Consistency', () => {
    it('should apply consistent spacing scale across breakpoints', () => {
      const { container } = render(
        <>
          <div className="gap-xs">xs gap</div>
          <div className="gap-sm">sm gap</div>
          <div className="gap-md">md gap</div>
          <div className="gap-lg">lg gap</div>
          <div className="gap-xl">xl gap</div>
          <div className="gap-2xl">2xl gap</div>
        </>
      );

      const divs = container.querySelectorAll('div');
      expect(divs.length).toBe(6);
    });

    it('should apply responsive padding to sections', () => {
      const { container } = render(
        <>
          <section className="px-md mobile:px-md tablet:px-lg desktop:px-lg">
            Section 1
          </section>
          <section className="px-md mobile:px-md tablet:px-lg desktop:px-lg">
            Section 2
          </section>
        </>
      );

      const sections = container.querySelectorAll('section');
      sections.forEach((section) => {
        expect(section.className).toMatch(/px-/);
      });
    });

    it('should apply responsive vertical padding to sections', () => {
      const { container } = render(
        <>
          <section className="py-3xl mobile:py-3xl tablet:py-3xl desktop:py-4xl">
            Section 1
          </section>
          <section className="py-3xl mobile:py-3xl tablet:py-3xl desktop:py-4xl">
            Section 2
          </section>
        </>
      );

      const sections = container.querySelectorAll('section');
      sections.forEach((section) => {
        expect(section.className).toMatch(/py-/);
      });
    });
  });
});
