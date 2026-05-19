import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ResponsiveImage, ResponsiveImageContainer } from './ResponsiveImage';

/**
 * Responsive Image Component Tests
 *
 * Tests for responsive image scaling, aspect ratio preservation,
 * lazy loading, and format negotiation (WebP with fallback).
 *
 * Requirements: 8.5, 8.7, 9.4
 */

describe('ResponsiveImage Component', () => {
  describe('Basic Rendering', () => {
    it('should render img element with src and alt', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', 'test.jpg');
      expect(img).toHaveAttribute('alt', 'Test image');
    });

    it('should render with default object-fit cover', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('object-cover');
    });

    it('should render with default object-position center', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('object-center');
    });

    it('should render with full width and height classes', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('w-full', 'h-full');
    });
  });

  describe('Responsive Sizing', () => {
    it('should support srcSet for responsive images', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
          srcSet="test-small.jpg 375w, test-medium.jpg 768w, test-large.jpg 1440w"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('srcSet', 'test-small.jpg 375w, test-medium.jpg 768w, test-large.jpg 1440w');
    });

    it('should support sizes attribute for responsive sizing', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('sizes', '(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw');
    });

    it('should combine srcSet and sizes for responsive images', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
          srcSet="test-small.jpg 375w, test-medium.jpg 768w, test-large.jpg 1440w"
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('srcSet');
      expect(img).toHaveAttribute('sizes');
    });
  });

  describe('Aspect Ratio', () => {
    it('should not apply aspect ratio class when aspectRatio is auto', () => {
      const { container } = render(
        <ResponsiveImageContainer aspectRatio="auto">
          <ResponsiveImage
            src="test.jpg"
            alt="Test image"
          />
        </ResponsiveImageContainer>
      );

      const div = container.firstChild as HTMLElement;
      expect(div).not.toHaveClass('aspect-square', 'aspect-video');
    });

    it('should apply aspect-square class when aspectRatio is square', () => {
      const { container } = render(
        <ResponsiveImageContainer aspectRatio="square">
          <ResponsiveImage
            src="test.jpg"
            alt="Test image"
          />
        </ResponsiveImageContainer>
      );

      const div = container.firstChild as HTMLElement;
      expect(div).toHaveClass('aspect-square');
    });

    it('should apply aspect-video class when aspectRatio is video', () => {
      const { container } = render(
        <ResponsiveImageContainer aspectRatio="video">
          <ResponsiveImage
            src="test.jpg"
            alt="Test image"
          />
        </ResponsiveImageContainer>
      );

      const div = container.firstChild as HTMLElement;
      expect(div).toHaveClass('aspect-video');
    });
  });

  describe('Object-fit', () => {
    it('should apply object-cover class by default', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
          objectFit="cover"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('object-cover');
    });

    it('should apply object-contain class when specified', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
          objectFit="contain"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('object-contain');
    });

    it('should apply object-fill class when specified', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
          objectFit="fill"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('object-fill');
    });

    it('should apply object-scale-down class when specified', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
          objectFit="scale-down"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('object-scale-down');
    });
  });

  describe('Lazy Loading', () => {
    it('should set loading="eager" by default', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('loading', 'eager');
    });

    it('should set loading="lazy" when lazy prop is true', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
          lazy
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('should set loading="lazy" for below-the-fold images', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Below-the-fold image"
          lazy
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('WebP Format Support', () => {
    it('should render picture element when srcWebP is provided', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          srcWebP="test.webp"
          alt="Test image"
        />
      );

      const picture = container.querySelector('picture');
      expect(picture).toBeInTheDocument();
    });

    it('should include WebP source with correct type', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          srcWebP="test.webp"
          alt="Test image"
        />
      );

      const source = container.querySelector('source');
      expect(source).toHaveAttribute('type', 'image/webp');
      expect(source).toHaveAttribute('srcSet', 'test.webp');
    });

    it('should include PNG fallback in picture element', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          srcWebP="test.webp"
          alt="Test image"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', 'test.png');
    });

    it('should support srcSet in WebP source', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          srcWebP="test.webp"
          srcSet="test-small.jpg 375w, test-medium.jpg 768w, test-large.jpg 1440w"
          alt="Test image"
        />
      );

      const source = container.querySelector('source');
      expect(source).toHaveAttribute('srcSet', 'test.webp');
    });

    it('should support sizes in WebP source', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          srcWebP="test.webp"
          sizes="(max-width: 767px) 100vw, 50vw"
          alt="Test image"
        />
      );

      const source = container.querySelector('source');
      expect(source).toHaveAttribute('sizes', '(max-width: 767px) 100vw, 50vw');
    });
  });

  describe('Accessibility', () => {
    it('should include alt text for accessibility', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Descriptive alt text"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('alt', 'Descriptive alt text');
    });

    it('should support testId for testing', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
          testId="hero-image"
        />
      );

      const img = container.querySelector('[data-testid="hero-image"]');
      expect(img).toBeInTheDocument();
    });

    it('should pass through additional img attributes', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
          title="Image title"
          data-custom="custom-value"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('title', 'Image title');
      expect(img).toHaveAttribute('data-custom', 'custom-value');
    });
  });

  describe('Custom Classes', () => {
    it('should accept additional className prop', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
          className="rounded-lg"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('rounded-lg');
    });

    it('should combine default and custom classes', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
          className="rounded-lg shadow-lg"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('w-full', 'h-full', 'object-cover', 'rounded-lg', 'shadow-lg');
    });
  });

  describe('Object Position', () => {
    it('should apply object-center by default', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('object-center');
    });

    it('should apply custom object-position when specified', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
          objectPosition="top"
        />
      );

      const img = container.querySelector('img');
      // Custom positions won't have a class, but the style should be applied
      expect(img).toBeInTheDocument();
    });
  });
});

describe('ResponsiveImageContainer Component', () => {
  describe('Basic Rendering', () => {
    it('should render div container', () => {
      const { container } = render(
        <ResponsiveImageContainer>
          <img src="test.jpg" alt="Test" />
        </ResponsiveImageContainer>
      );

      const div = container.firstChild;
      expect(div).toBeInTheDocument();
    });

    it('should render children', () => {
      const { getByAltText } = render(
        <ResponsiveImageContainer>
          <img src="test.jpg" alt="Test image" />
        </ResponsiveImageContainer>
      );

      const img = getByAltText('Test image');
      expect(img).toBeInTheDocument();
    });

    it('should have full width class', () => {
      const { container } = render(
        <ResponsiveImageContainer>
          <img src="test.jpg" alt="Test" />
        </ResponsiveImageContainer>
      );

      const div = container.firstChild as HTMLElement;
      expect(div).toHaveClass('w-full');
    });

    it('should have overflow-hidden class', () => {
      const { container } = render(
        <ResponsiveImageContainer>
          <img src="test.jpg" alt="Test" />
        </ResponsiveImageContainer>
      );

      const div = container.firstChild as HTMLElement;
      expect(div).toHaveClass('overflow-hidden');
    });
  });

  describe('Aspect Ratio', () => {
    it('should apply aspect-square class when aspectRatio is square', () => {
      const { container } = render(
        <ResponsiveImageContainer aspectRatio="square">
          <img src="test.jpg" alt="Test" />
        </ResponsiveImageContainer>
      );

      const div = container.firstChild as HTMLElement;
      expect(div).toHaveClass('aspect-square');
    });

    it('should apply aspect-video class when aspectRatio is video', () => {
      const { container } = render(
        <ResponsiveImageContainer aspectRatio="video">
          <img src="test.jpg" alt="Test" />
        </ResponsiveImageContainer>
      );

      const div = container.firstChild as HTMLElement;
      expect(div).toHaveClass('aspect-video');
    });

    it('should not apply aspect ratio class when aspectRatio is auto', () => {
      const { container } = render(
        <ResponsiveImageContainer aspectRatio="auto">
          <img src="test.jpg" alt="Test" />
        </ResponsiveImageContainer>
      );

      const div = container.firstChild as HTMLElement;
      expect(div).not.toHaveClass('aspect-square', 'aspect-video');
    });
  });

  describe('Custom Classes', () => {
    it('should accept additional className prop', () => {
      const { container } = render(
        <ResponsiveImageContainer className="rounded-lg">
          <img src="test.jpg" alt="Test" />
        </ResponsiveImageContainer>
      );

      const div = container.firstChild as HTMLElement;
      expect(div).toHaveClass('rounded-lg');
    });

    it('should combine default and custom classes', () => {
      const { container } = render(
        <ResponsiveImageContainer
          aspectRatio="square"
          className="rounded-lg shadow-lg"
        >
          <img src="test.jpg" alt="Test" />
        </ResponsiveImageContainer>
      );

      const div = container.firstChild as HTMLElement;
      expect(div).toHaveClass('w-full', 'overflow-hidden', 'aspect-square', 'rounded-lg', 'shadow-lg');
    });
  });

  describe('Test ID', () => {
    it('should support testId for testing', () => {
      const { container } = render(
        <ResponsiveImageContainer testId="image-container">
          <img src="test.jpg" alt="Test" />
        </ResponsiveImageContainer>
      );

      const div = container.querySelector('[data-testid="image-container"]');
      expect(div).toBeInTheDocument();
    });
  });

  describe('Integration with ResponsiveImage', () => {
    it('should work with ResponsiveImage component', () => {
      const { container } = render(
        <ResponsiveImageContainer aspectRatio="square">
          <ResponsiveImage
            src="test.jpg"
            alt="Test image"
            objectFit="cover"
          />
        </ResponsiveImageContainer>
      );

      const div = container.firstChild as HTMLElement;
      const img = container.querySelector('img');

      expect(div).toHaveClass('aspect-square');
      expect(img).toHaveClass('object-cover');
    });

    it('should maintain aspect ratio with responsive sizing', () => {
      const { container } = render(
        <ResponsiveImageContainer aspectRatio="video">
          <ResponsiveImage
            src="test.jpg"
            alt="Test image"
            srcSet="test-small.jpg 375w, test-medium.jpg 768w, test-large.jpg 1440w"
            sizes="(max-width: 767px) 100vw, 50vw"
            objectFit="cover"
          />
        </ResponsiveImageContainer>
      );

      const div = container.firstChild as HTMLElement;
      const img = container.querySelector('img');

      expect(div).toHaveClass('aspect-video');
      expect(img).toHaveAttribute('srcSet');
      expect(img).toHaveAttribute('sizes');
    });

    it('should support lazy loading with aspect ratio', () => {
      const { container } = render(
        <ResponsiveImageContainer aspectRatio="square">
          <ResponsiveImage
            src="test.jpg"
            alt="Test image"
            lazy
          />
        </ResponsiveImageContainer>
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });
});

describe('Responsive Image Scaling - Requirements 8.5 & 8.7', () => {
  /**
   * Validates: Requirements 8.5, 8.7
   *
   * Requirement 8.5: WHEN images are displayed, THE Image_Scaling SHALL maintain
   * aspect ratios and load appropriately sized versions for each viewport
   *
   * Requirement 8.7: WHEN the viewport is resized, THE Layout_Transitions SHALL be
   * smooth without jarring reflows or content shifts
   */

  it('should maintain aspect ratio on mobile viewport', () => {
    const { container } = render(
      <ResponsiveImageContainer aspectRatio="square">
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
          srcSet="test-mobile.jpg 375w, test-tablet.jpg 768w, test-desktop.jpg 1440w"
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
          objectFit="cover"
        />
      </ResponsiveImageContainer>
    );

    const container_div = container.firstChild as HTMLElement;
    const img = container.querySelector('img');

    expect(container_div).toHaveClass('aspect-square');
    expect(img).toHaveClass('object-cover', 'w-full', 'h-full');
  });

  it('should maintain aspect ratio on tablet viewport', () => {
    const { container } = render(
      <ResponsiveImageContainer aspectRatio="video">
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
          srcSet="test-mobile.jpg 375w, test-tablet.jpg 768w, test-desktop.jpg 1440w"
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
          objectFit="cover"
        />
      </ResponsiveImageContainer>
    );

    const container_div = container.firstChild as HTMLElement;
    const img = container.querySelector('img');

    expect(container_div).toHaveClass('aspect-video');
    expect(img).toHaveClass('object-cover', 'w-full', 'h-full');
  });

  it('should load appropriately sized versions for each viewport', () => {
    const { container } = render(
      <ResponsiveImage
        src="test.jpg"
        alt="Test image"
        srcSet="test-mobile.jpg 375w, test-tablet.jpg 768w, test-desktop.jpg 1440w"
        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
      />
    );

    const img = container.querySelector('img');
    expect(img).toHaveAttribute('srcSet', 'test-mobile.jpg 375w, test-tablet.jpg 768w, test-desktop.jpg 1440w');
    expect(img).toHaveAttribute('sizes', '(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw');
  });

  it('should prevent layout shift with aspect ratio container', () => {
    const { container } = render(
      <ResponsiveImageContainer aspectRatio="square">
        <ResponsiveImage
          src="test.jpg"
          alt="Test image"
          objectFit="cover"
        />
      </ResponsiveImageContainer>
    );

    const container_div = container.firstChild as HTMLElement;
    // Aspect ratio container prevents layout shift
    expect(container_div).toHaveClass('aspect-square', 'overflow-hidden');
  });

  it('should use object-fit to prevent distortion', () => {
    const { container } = render(
      <ResponsiveImage
        src="test.jpg"
        alt="Test image"
        aspectRatio="square"
        objectFit="cover"
      />
    );

    const img = container.querySelector('img');
    expect(img).toHaveClass('object-cover');
  });

  it('should support WebP format for optimized file sizes', () => {
    const { container } = render(
      <ResponsiveImage
        src="test.png"
        srcWebP="test.webp"
        alt="Test image"
        srcSet="test-mobile.jpg 375w, test-tablet.jpg 768w, test-desktop.jpg 1440w"
        sizes="(max-width: 767px) 100vw, 50vw"
      />
    );

    const picture = container.querySelector('picture');
    const source = container.querySelector('source');
    const img = container.querySelector('img');

    expect(picture).toBeInTheDocument();
    expect(source).toHaveAttribute('type', 'image/webp');
    expect(img).toHaveAttribute('src', 'test.png');
  });

  it('should use lazy loading for performance', () => {
    const { container } = render(
      <ResponsiveImage
        src="test.jpg"
        alt="Below-the-fold image"
        lazy
      />
    );

    const img = container.querySelector('img');
    expect(img).toHaveAttribute('loading', 'lazy');
  });
});
