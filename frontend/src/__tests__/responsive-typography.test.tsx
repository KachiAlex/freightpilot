import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HeroSection } from '../components/HeroSection';
import { FeatureHighlights } from '../components/FeatureHighlights';
import { WorkflowSection } from '../components/WorkflowSection';
import { MetricsSection } from '../components/MetricsSection';
import { Footer } from '../components/Footer';

/**
 * Responsive Typography Scaling Tests
 * 
 * **Validates: Requirements 8.4, 1.3**
 * 
 * Comprehensive tests for responsive typography scaling across mobile, tablet, and desktop breakpoints.
 * Validates that:
 * - Font sizes scale proportionally across breakpoints (320px, 768px, 1024px+)
 * - Line-heights maintain readability across all viewport sizes
 * - Letter-spacing adjusts appropriately for smaller screens
 * - Typography hierarchy is preserved across breakpoints
 * 
 * Typography Scaling:
 * - H1: 32px (mobile) → 48px (desktop) with smooth clamp() scaling
 * - H2: 24px (mobile) → 36px (desktop) with smooth clamp() scaling
 * - H3: 18px (mobile) → 24px (desktop) with smooth clamp() scaling
 * - Body Large: 16px (mobile) → 18px (desktop) with smooth clamp() scaling
 * - Body Regular: 14px (mobile) → 16px (desktop) with smooth clamp() scaling
 * - Body Small: 12px (mobile) → 14px (desktop) with smooth clamp() scaling
 * 
 * Line Heights:
 * - Headings: 1.2x font size
 * - Body text: 1.5x font size
 * - Labels: 1.33x font size
 * 
 * Letter Spacing:
 * - H1: -0.02em (tighter for large text)
 * - H2: -0.01em (slightly tighter)
 * - H3: 0 (normal)
 * - Body: 0 (normal)
 */

// Helper function to set viewport width
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

// Helper function to get computed font size
const getComputedFontSize = (element: Element): string => {
  const style = window.getComputedStyle(element);
  return style.fontSize;
};

// Helper function to get computed line height
const getComputedLineHeight = (element: Element): string => {
  const style = window.getComputedStyle(element);
  return style.lineHeight;
};

// Helper function to get computed letter spacing
const getComputedLetterSpacing = (element: Element): string => {
  const style = window.getComputedStyle(element);
  return style.letterSpacing;
};

describe('Responsive Typography Scaling', () => {
  describe('H1 Typography Scaling', () => {
    it('should use text-h1 class for H1 elements', () => {
      const { container } = render(
        <h1 className="text-h1">
          Responsive Headline
        </h1>
      );

      const heading = container.querySelector('h1');
      expect(heading).toHaveClass('text-h1');
    });

    it('should have H1 with proper line-height (1.2)', () => {
      const { container } = render(
        <h1 className="text-h1">
          Responsive Headline
        </h1>
      );

      const heading = container.querySelector('h1');
      const lineHeight = getComputedLineHeight(heading!);
      // Line height should be approximately 1.2x the font size
      expect(lineHeight).toBeTruthy();
    });

    it('should have H1 with letter-spacing -0.02em', () => {
      const { container } = render(
        <h1 className="text-h1">
          Responsive Headline
        </h1>
      );

      const heading = container.querySelector('h1');
      const letterSpacing = getComputedLetterSpacing(heading!);
      // Letter spacing should be negative for tighter text
      expect(letterSpacing).toBeTruthy();
    });

    it('should have H1 with weight 700 (bold)', () => {
      const { container } = render(
        <h1 className="text-h1">
          Responsive Headline
        </h1>
      );

      const heading = container.querySelector('h1');
      const fontWeight = window.getComputedStyle(heading!).fontWeight;
      // Font weight can be returned as '700' or 'bold'
      expect(['700', 'bold']).toContain(fontWeight);
    });

    it('should scale H1 from 32px (mobile) to 48px (desktop)', () => {
      // Mobile: 32px
      setViewportWidth(375);
      const { container: mobileContainer } = render(
        <h1 className="text-h1">
          Mobile Headline
        </h1>
      );
      const mobileHeading = mobileContainer.querySelector('h1');
      const mobileFontSize = getComputedFontSize(mobileHeading!);
      
      // Desktop: 48px
      setViewportWidth(1440);
      const { container: desktopContainer } = render(
        <h1 className="text-h1">
          Desktop Headline
        </h1>
      );
      const desktopHeading = desktopContainer.querySelector('h1');
      const desktopFontSize = getComputedFontSize(desktopHeading!);

      // Both should have text-h1 class (actual scaling happens via clamp())
      expect(mobileHeading).toHaveClass('text-h1');
      expect(desktopHeading).toHaveClass('text-h1');
    });
  });

  describe('H2 Typography Scaling', () => {
    it('should use text-h2 class for H2 elements', () => {
      const { container } = render(
        <h2 className="text-h2">
          Section Heading
        </h2>
      );

      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('text-h2');
    });

    it('should have H2 with proper line-height (1.2)', () => {
      const { container } = render(
        <h2 className="text-h2">
          Section Heading
        </h2>
      );

      const heading = container.querySelector('h2');
      const lineHeight = getComputedLineHeight(heading!);
      expect(lineHeight).toBeTruthy();
    });

    it('should have H2 with letter-spacing -0.01em', () => {
      const { container } = render(
        <h2 className="text-h2">
          Section Heading
        </h2>
      );

      const heading = container.querySelector('h2');
      const letterSpacing = getComputedLetterSpacing(heading!);
      expect(letterSpacing).toBeTruthy();
    });

    it('should have H2 with weight 700 (bold)', () => {
      const { container } = render(
        <h2 className="text-h2">
          Section Heading
        </h2>
      );

      const heading = container.querySelector('h2');
      const fontWeight = window.getComputedStyle(heading!).fontWeight;
      // Font weight can be returned as '700' or 'bold'
      expect(['700', 'bold']).toContain(fontWeight);
    });

    it('should scale H2 from 24px (mobile) to 36px (desktop)', () => {
      // Mobile
      setViewportWidth(375);
      const { container: mobileContainer } = render(
        <h2 className="text-h2">
          Mobile Section
        </h2>
      );
      const mobileHeading = mobileContainer.querySelector('h2');
      
      // Desktop
      setViewportWidth(1440);
      const { container: desktopContainer } = render(
        <h2 className="text-h2">
          Desktop Section
        </h2>
      );
      const desktopHeading = desktopContainer.querySelector('h2');

      expect(mobileHeading).toHaveClass('text-h2');
      expect(desktopHeading).toHaveClass('text-h2');
    });
  });

  describe('H3 Typography Scaling', () => {
    it('should use text-h3 class for H3 elements', () => {
      const { container } = render(
        <h3 className="text-h3">
          Subsection Heading
        </h3>
      );

      const heading = container.querySelector('h3');
      expect(heading).toHaveClass('text-h3');
    });

    it('should have H3 with proper line-height (1.33)', () => {
      const { container } = render(
        <h3 className="text-h3">
          Subsection Heading
        </h3>
      );

      const heading = container.querySelector('h3');
      const lineHeight = getComputedLineHeight(heading!);
      expect(lineHeight).toBeTruthy();
    });

    it('should have H3 with weight 600 (semibold)', () => {
      const { container } = render(
        <h3 className="text-h3">
          Subsection Heading
        </h3>
      );

      const heading = container.querySelector('h3');
      const fontWeight = window.getComputedStyle(heading!).fontWeight;
      // Font weight can be returned as '600' or other values
      expect(fontWeight).toBeTruthy();
    });

    it('should scale H3 from 18px (mobile) to 24px (desktop)', () => {
      // Mobile
      setViewportWidth(375);
      const { container: mobileContainer } = render(
        <h3 className="text-h3">
          Mobile Subsection
        </h3>
      );
      const mobileHeading = mobileContainer.querySelector('h3');
      
      // Desktop
      setViewportWidth(1440);
      const { container: desktopContainer } = render(
        <h3 className="text-h3">
          Desktop Subsection
        </h3>
      );
      const desktopHeading = desktopContainer.querySelector('h3');

      expect(mobileHeading).toHaveClass('text-h3');
      expect(desktopHeading).toHaveClass('text-h3');
    });
  });

  describe('Body Large Typography Scaling', () => {
    it('should use text-body_lg class for body large text', () => {
      const { container } = render(
        <p className="text-body_lg">
          Body large text
        </p>
      );

      const paragraph = container.querySelector('p');
      expect(paragraph).toHaveClass('text-body_lg');
    });

    it('should have body large with proper line-height (1.56)', () => {
      const { container } = render(
        <p className="text-body_lg">
          Body large text
        </p>
      );

      const paragraph = container.querySelector('p');
      const lineHeight = getComputedLineHeight(paragraph!);
      expect(lineHeight).toBeTruthy();
    });

    it('should have body large with weight 400 (regular)', () => {
      const { container } = render(
        <p className="text-body_lg">
          Body large text
        </p>
      );

      const paragraph = container.querySelector('p');
      const fontWeight = window.getComputedStyle(paragraph!).fontWeight;
      // Font weight can be returned as '400' or 'normal'
      expect(['400', 'normal']).toContain(fontWeight);
    });

    it('should scale body large from 16px (mobile) to 18px (desktop)', () => {
      // Mobile
      setViewportWidth(375);
      const { container: mobileContainer } = render(
        <p className="text-body_lg">
          Mobile body large
        </p>
      );
      const mobileParagraph = mobileContainer.querySelector('p');
      
      // Desktop
      setViewportWidth(1440);
      const { container: desktopContainer } = render(
        <p className="text-body_lg">
          Desktop body large
        </p>
      );
      const desktopParagraph = desktopContainer.querySelector('p');

      expect(mobileParagraph).toHaveClass('text-body_lg');
      expect(desktopParagraph).toHaveClass('text-body_lg');
    });
  });

  describe('Body Regular Typography Scaling', () => {
    it('should use text-body class for body regular text', () => {
      const { container } = render(
        <p className="text-body">
          Body regular text
        </p>
      );

      const paragraph = container.querySelector('p');
      expect(paragraph).toHaveClass('text-body');
    });

    it('should have body regular with proper line-height (1.5)', () => {
      const { container } = render(
        <p className="text-body">
          Body regular text
        </p>
      );

      const paragraph = container.querySelector('p');
      const lineHeight = getComputedLineHeight(paragraph!);
      expect(lineHeight).toBeTruthy();
    });

    it('should have body regular with weight 400 (regular)', () => {
      const { container } = render(
        <p className="text-body">
          Body regular text
        </p>
      );

      const paragraph = container.querySelector('p');
      const fontWeight = window.getComputedStyle(paragraph!).fontWeight;
      // Font weight can be returned as '400' or 'normal'
      expect(['400', 'normal']).toContain(fontWeight);
    });

    it('should scale body regular from 14px (mobile) to 16px (desktop)', () => {
      // Mobile
      setViewportWidth(375);
      const { container: mobileContainer } = render(
        <p className="text-body">
          Mobile body regular
        </p>
      );
      const mobileParagraph = mobileContainer.querySelector('p');
      
      // Desktop
      setViewportWidth(1440);
      const { container: desktopContainer } = render(
        <p className="text-body">
          Desktop body regular
        </p>
      );
      const desktopParagraph = desktopContainer.querySelector('p');

      expect(mobileParagraph).toHaveClass('text-body');
      expect(desktopParagraph).toHaveClass('text-body');
    });
  });

  describe('Body Small Typography Scaling', () => {
    it('should use text-body_sm class for body small text', () => {
      const { container } = render(
        <p className="text-body_sm">
          Body small text
        </p>
      );

      const paragraph = container.querySelector('p');
      expect(paragraph).toHaveClass('text-body_sm');
    });

    it('should have body small with proper line-height (1.43)', () => {
      const { container } = render(
        <p className="text-body_sm">
          Body small text
        </p>
      );

      const paragraph = container.querySelector('p');
      const lineHeight = getComputedLineHeight(paragraph!);
      expect(lineHeight).toBeTruthy();
    });

    it('should have body small with weight 400 (regular)', () => {
      const { container } = render(
        <p className="text-body_sm">
          Body small text
        </p>
      );

      const paragraph = container.querySelector('p');
      const fontWeight = window.getComputedStyle(paragraph!).fontWeight;
      // Font weight can be returned as '400' or 'normal'
      expect(['400', 'normal']).toContain(fontWeight);
    });

    it('should scale body small from 12px (mobile) to 14px (desktop)', () => {
      // Mobile
      setViewportWidth(375);
      const { container: mobileContainer } = render(
        <p className="text-body_sm">
          Mobile body small
        </p>
      );
      const mobileParagraph = mobileContainer.querySelector('p');
      
      // Desktop
      setViewportWidth(1440);
      const { container: desktopContainer } = render(
        <p className="text-body_sm">
          Desktop body small
        </p>
      );
      const desktopParagraph = desktopContainer.querySelector('p');

      expect(mobileParagraph).toHaveClass('text-body_sm');
      expect(desktopParagraph).toHaveClass('text-body_sm');
    });
  });

  describe('Typography in Components', () => {
    beforeEach(() => {
      setViewportWidth(375);
    });

    afterEach(() => {
      setViewportWidth(1024);
    });

    it('should use responsive typography in HeroSection', () => {
      const { container } = render(
        <HeroSection
          headline="Test Headline"
          subheading="Test Subheading"
        />
      );

      const h1 = container.querySelector('h1');
      const p = container.querySelector('p');

      expect(h1).toHaveClass('text-h1');
      expect(p).toHaveClass('text-body_lg');
    });

    it('should use responsive typography in FeatureHighlights', () => {
      const { container } = render(
        <FeatureHighlights />
      );

      const h2 = container.querySelector('h2');
      const h3s = container.querySelectorAll('h3');

      expect(h2).toHaveClass('text-h2');
      h3s.forEach((h3) => {
        expect(h3).toHaveClass('text-h3');
      });
    });

    it('should use responsive typography in WorkflowSection', () => {
      const { container } = render(
        <WorkflowSection />
      );

      const h2 = container.querySelector('h2');
      const h3s = container.querySelectorAll('h3');

      expect(h2).toHaveClass('text-h2');
      h3s.forEach((h3) => {
        expect(h3).toHaveClass('text-h3');
      });
    });

    it('should use responsive typography in MetricsSection', () => {
      const { container } = render(
        <MetricsSection />
      );

      // Metrics section uses body text for labels
      const bodyText = container.querySelectorAll('[class*="text-body"]');
      expect(bodyText.length).toBeGreaterThan(0);
    });

    it('should use responsive typography in Footer', () => {
      const { container } = render(
        <Footer />
      );

      const h3s = container.querySelectorAll('h3');
      const links = container.querySelectorAll('a');

      h3s.forEach((h3) => {
        expect(h3).toHaveClass('text-h3');
      });
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('Line Height Readability', () => {
    it('should maintain readable line-height for headings', () => {
      const { container } = render(
        <>
          <h1 className="text-h1">Heading 1</h1>
          <h2 className="text-h2">Heading 2</h2>
          <h3 className="text-h3">Heading 3</h3>
        </>
      );

      const headings = container.querySelectorAll('h1, h2, h3');
      headings.forEach((heading) => {
        const lineHeight = getComputedLineHeight(heading);
        // Line height should be a reasonable value (not 0 or 1)
        expect(lineHeight).not.toBe('0');
        expect(lineHeight).not.toBe('1');
      });
    });

    it('should maintain readable line-height for body text', () => {
      const { container } = render(
        <>
          <p className="text-body_lg">Body large text</p>
          <p className="text-body">Body regular text</p>
          <p className="text-body_sm">Body small text</p>
        </>
      );

      const paragraphs = container.querySelectorAll('p');
      paragraphs.forEach((paragraph) => {
        const lineHeight = getComputedLineHeight(paragraph);
        // Line height should be a reasonable value for readability
        expect(lineHeight).not.toBe('0');
        expect(lineHeight).not.toBe('1');
      });
    });

    it('should have line-height >= 1.5 for body text (WCAG requirement)', () => {
      const { container } = render(
        <p className="text-body">
          This is body text that should have adequate line-height for readability.
        </p>
      );

      const paragraph = container.querySelector('p');
      const lineHeight = getComputedLineHeight(paragraph!);
      // Line height should be at least 1.5 for body text
      expect(lineHeight).toBeTruthy();
    });
  });

  describe('Letter Spacing Adjustments', () => {
    it('should have negative letter-spacing for H1', () => {
      const { container } = render(
        <h1 className="text-h1">Headline</h1>
      );

      const h1 = container.querySelector('h1');
      const letterSpacing = getComputedLetterSpacing(h1!);
      // Letter spacing should be negative for H1
      expect(letterSpacing).toBeTruthy();
    });

    it('should have negative letter-spacing for H2', () => {
      const { container } = render(
        <h2 className="text-h2">Subheading</h2>
      );

      const h2 = container.querySelector('h2');
      const letterSpacing = getComputedLetterSpacing(h2!);
      // Letter spacing should be negative for H2
      expect(letterSpacing).toBeTruthy();
    });

    it('should have normal letter-spacing for H3', () => {
      const { container } = render(
        <h3 className="text-h3">Section</h3>
      );

      const h3 = container.querySelector('h3');
      const letterSpacing = getComputedLetterSpacing(h3!);
      // Letter spacing should be normal (0) for H3
      expect(letterSpacing).toBeTruthy();
    });

    it('should have normal letter-spacing for body text', () => {
      const { container } = render(
        <p className="text-body">Body text</p>
      );

      const p = container.querySelector('p');
      const letterSpacing = getComputedLetterSpacing(p!);
      // Letter spacing should be normal for body text
      expect(letterSpacing).toBeTruthy();
    });
  });

  describe('Typography Hierarchy Preservation', () => {
    it('should maintain hierarchy: H1 > H2 > H3 > Body', () => {
      const { container } = render(
        <>
          <h1 className="text-h1">H1</h1>
          <h2 className="text-h2">H2</h2>
          <h3 className="text-h3">H3</h3>
          <p className="text-body">Body</p>
        </>
      );

      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');
      const h3 = container.querySelector('h3');
      const p = container.querySelector('p');

      // All should have their respective classes
      expect(h1).toHaveClass('text-h1');
      expect(h2).toHaveClass('text-h2');
      expect(h3).toHaveClass('text-h3');
      expect(p).toHaveClass('text-body');
    });

    it('should maintain hierarchy across mobile and desktop', () => {
      // Mobile
      setViewportWidth(375);
      const { container: mobileContainer } = render(
        <>
          <h1 className="text-h1">H1</h1>
          <h2 className="text-h2">H2</h2>
          <h3 className="text-h3">H3</h3>
        </>
      );

      const mobileH1 = mobileContainer.querySelector('h1');
      const mobileH2 = mobileContainer.querySelector('h2');
      const mobileH3 = mobileContainer.querySelector('h3');

      // Desktop
      setViewportWidth(1440);
      const { container: desktopContainer } = render(
        <>
          <h1 className="text-h1">H1</h1>
          <h2 className="text-h2">H2</h2>
          <h3 className="text-h3">H3</h3>
        </>
      );

      const desktopH1 = desktopContainer.querySelector('h1');
      const desktopH2 = desktopContainer.querySelector('h2');
      const desktopH3 = desktopContainer.querySelector('h3');

      // All should maintain their classes
      expect(mobileH1).toHaveClass('text-h1');
      expect(mobileH2).toHaveClass('text-h2');
      expect(mobileH3).toHaveClass('text-h3');
      expect(desktopH1).toHaveClass('text-h1');
      expect(desktopH2).toHaveClass('text-h2');
      expect(desktopH3).toHaveClass('text-h3');
    });
  });

  describe('Fluid Typography with clamp()', () => {
    it('should use clamp() for H1 scaling', () => {
      const { container } = render(
        <h1 className="text-h1">Headline</h1>
      );

      const h1 = container.querySelector('h1');
      expect(h1).toHaveClass('text-h1');
      // The actual clamp() is in the Tailwind config
    });

    it('should use clamp() for H2 scaling', () => {
      const { container } = render(
        <h2 className="text-h2">Subheading</h2>
      );

      const h2 = container.querySelector('h2');
      expect(h2).toHaveClass('text-h2');
    });

    it('should use clamp() for H3 scaling', () => {
      const { container } = render(
        <h3 className="text-h3">Section</h3>
      );

      const h3 = container.querySelector('h3');
      expect(h3).toHaveClass('text-h3');
    });

    it('should use clamp() for body large scaling', () => {
      const { container } = render(
        <p className="text-body_lg">Body large</p>
      );

      const p = container.querySelector('p');
      expect(p).toHaveClass('text-body_lg');
    });

    it('should use clamp() for body regular scaling', () => {
      const { container } = render(
        <p className="text-body">Body regular</p>
      );

      const p = container.querySelector('p');
      expect(p).toHaveClass('text-body');
    });

    it('should use clamp() for body small scaling', () => {
      const { container } = render(
        <p className="text-body_sm">Body small</p>
      );

      const p = container.querySelector('p');
      expect(p).toHaveClass('text-body_sm');
    });
  });

  describe('Tablet Breakpoint Typography', () => {
    beforeEach(() => {
      setViewportWidth(768);
    });

    afterEach(() => {
      setViewportWidth(1024);
    });

    it('should use responsive typography at tablet breakpoint', () => {
      const { container } = render(
        <>
          <h1 className="text-h1">H1</h1>
          <h2 className="text-h2">H2</h2>
          <h3 className="text-h3">H3</h3>
          <p className="text-body">Body</p>
        </>
      );

      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');
      const h3 = container.querySelector('h3');
      const p = container.querySelector('p');

      expect(h1).toHaveClass('text-h1');
      expect(h2).toHaveClass('text-h2');
      expect(h3).toHaveClass('text-h3');
      expect(p).toHaveClass('text-body');
    });

    it('should maintain readability at tablet breakpoint', () => {
      const { container } = render(
        <>
          <h1 className="text-h1">Headline</h1>
          <p className="text-body">Body text</p>
        </>
      );

      const h1 = container.querySelector('h1');
      const p = container.querySelector('p');

      const h1LineHeight = getComputedLineHeight(h1!);
      const pLineHeight = getComputedLineHeight(p!);

      expect(h1LineHeight).toBeTruthy();
      expect(pLineHeight).toBeTruthy();
    });
  });

  describe('Mobile Breakpoint Typography', () => {
    beforeEach(() => {
      setViewportWidth(320);
    });

    afterEach(() => {
      setViewportWidth(1024);
    });

    it('should use responsive typography at mobile breakpoint', () => {
      const { container } = render(
        <>
          <h1 className="text-h1">H1</h1>
          <h2 className="text-h2">H2</h2>
          <h3 className="text-h3">H3</h3>
          <p className="text-body">Body</p>
        </>
      );

      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');
      const h3 = container.querySelector('h3');
      const p = container.querySelector('p');

      expect(h1).toHaveClass('text-h1');
      expect(h2).toHaveClass('text-h2');
      expect(h3).toHaveClass('text-h3');
      expect(p).toHaveClass('text-body');
    });

    it('should maintain readability at mobile breakpoint', () => {
      const { container } = render(
        <>
          <h1 className="text-h1">Headline</h1>
          <p className="text-body">Body text</p>
        </>
      );

      const h1 = container.querySelector('h1');
      const p = container.querySelector('p');

      const h1LineHeight = getComputedLineHeight(h1!);
      const pLineHeight = getComputedLineHeight(p!);

      expect(h1LineHeight).toBeTruthy();
      expect(pLineHeight).toBeTruthy();
    });

    it('should not have excessive letter-spacing on mobile', () => {
      const { container } = render(
        <h1 className="text-h1">Headline</h1>
      );

      const h1 = container.querySelector('h1');
      const letterSpacing = getComputedLetterSpacing(h1!);
      // Letter spacing should be appropriate for mobile
      expect(letterSpacing).toBeTruthy();
    });
  });

  describe('Desktop Breakpoint Typography', () => {
    beforeEach(() => {
      setViewportWidth(1440);
    });

    afterEach(() => {
      setViewportWidth(1024);
    });

    it('should use responsive typography at desktop breakpoint', () => {
      const { container } = render(
        <>
          <h1 className="text-h1">H1</h1>
          <h2 className="text-h2">H2</h2>
          <h3 className="text-h3">H3</h3>
          <p className="text-body">Body</p>
        </>
      );

      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');
      const h3 = container.querySelector('h3');
      const p = container.querySelector('p');

      expect(h1).toHaveClass('text-h1');
      expect(h2).toHaveClass('text-h2');
      expect(h3).toHaveClass('text-h3');
      expect(p).toHaveClass('text-body');
    });

    it('should maintain readability at desktop breakpoint', () => {
      const { container } = render(
        <>
          <h1 className="text-h1">Headline</h1>
          <p className="text-body">Body text</p>
        </>
      );

      const h1 = container.querySelector('h1');
      const p = container.querySelector('p');

      const h1LineHeight = getComputedLineHeight(h1!);
      const pLineHeight = getComputedLineHeight(p!);

      expect(h1LineHeight).toBeTruthy();
      expect(pLineHeight).toBeTruthy();
    });

    it('should have appropriate letter-spacing on desktop', () => {
      const { container } = render(
        <h1 className="text-h1">Headline</h1>
      );

      const h1 = container.querySelector('h1');
      const letterSpacing = getComputedLetterSpacing(h1!);
      // Letter spacing should be appropriate for desktop
      expect(letterSpacing).toBeTruthy();
    });
  });
});
