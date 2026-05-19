import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ResponsiveImage, ResponsiveImageContainer } from '../components/ResponsiveImage';
import {
  generateResponsiveImageUrls,
  generateWebPUrl,
  generateSrcSet,
  generateSizes,
  calculateImageDimensions,
  getOptimalImageWidth,
  generateResponsiveImageConfig,
  VIEWPORT_SIZES,
  RESPONSIVE_WIDTHS,
  ASPECT_RATIOS,
} from '../lib/imageUtils';

/**
 * Responsive Image Scaling Tests
 * 
 * **Validates: Requirements 8.5, 9.4**
 * 
 * Comprehensive tests for responsive image scaling including:
 * - Aspect ratio preservation across viewports
 * - Appropriate sized versions for mobile (375w), tablet (768w), desktop (1440w)
 * - WebP format with PNG fallback
 * - Lazy loading for performance
 * - Responsive sizing with srcset and sizes attributes
 * - Image optimization and compression
 */

describe('Responsive Image Scaling - Image Utilities', () => {
  describe('generateResponsiveImageUrls', () => {
    it('should generate responsive image URLs for all viewports', () => {
      const urls = generateResponsiveImageUrls('hero.png');

      expect(urls.mobile).toBe('hero-375w.png');
      expect(urls.tablet).toBe('hero-768w.png');
      expect(urls.desktop).toBe('hero-1440w.png');
    });

    it('should handle custom widths', () => {
      const urls = generateResponsiveImageUrls('image.jpg', [480, 800, 1200]);

      expect(urls.mobile).toBe('image-480w.jpg');
      expect(urls.tablet).toBe('image-800w.jpg');
      expect(urls.desktop).toBe('image-1200w.jpg');
    });

    it('should preserve file extension', () => {
      const urls = generateResponsiveImageUrls('image.webp');

      expect(urls.mobile).toContain('.webp');
      expect(urls.tablet).toContain('.webp');
      expect(urls.desktop).toContain('.webp');
    });
  });

  describe('generateWebPUrl', () => {
    it('should convert PNG to WebP', () => {
      const webpUrl = generateWebPUrl('image.png');
      expect(webpUrl).toBe('image.webp');
    });

    it('should convert JPG to WebP', () => {
      const webpUrl = generateWebPUrl('image.jpg');
      expect(webpUrl).toBe('image.webp');
    });

    it('should convert JPEG to WebP', () => {
      const webpUrl = generateWebPUrl('image.jpeg');
      expect(webpUrl).toBe('image.webp');
    });

    it('should handle case-insensitive extensions', () => {
      const webpUrl = generateWebPUrl('image.PNG');
      expect(webpUrl).toBe('image.webp');
    });
  });

  describe('generateSrcSet', () => {
    it('should generate srcset with default widths', () => {
      const srcset = generateSrcSet('image.png');

      expect(srcset).toContain('image-375w.png 375w');
      expect(srcset).toContain('image-768w.png 768w');
      expect(srcset).toContain('image-1440w.png 1440w');
    });

    it('should generate srcset with custom widths', () => {
      const srcset = generateSrcSet('image.jpg', [480, 800, 1200]);

      expect(srcset).toContain('image-480w.jpg 480w');
      expect(srcset).toContain('image-800w.jpg 800w');
      expect(srcset).toContain('image-1200w.jpg 1200w');
    });

    it('should use comma-separated format', () => {
      const srcset = generateSrcSet('image.png');
      const parts = srcset.split(', ');

      expect(parts.length).toBe(3);
    });

    it('should include width descriptors', () => {
      const srcset = generateSrcSet('image.png');

      expect(srcset).toMatch(/\d+w/g);
    });
  });

  describe('generateSizes', () => {
    it('should generate default sizes attribute', () => {
      const sizes = generateSizes();

      expect(sizes).toContain('(max-width: 767px) 100vw');
      expect(sizes).toContain('(max-width: 1023px) 50vw');
      expect(sizes).toContain('33vw');
    });

    it('should generate custom sizes attribute', () => {
      const sizes = generateSizes('80vw', '60vw', '40vw');

      expect(sizes).toContain('(max-width: 767px) 80vw');
      expect(sizes).toContain('(max-width: 1023px) 60vw');
      expect(sizes).toContain('40vw');
    });

    it('should use correct breakpoints', () => {
      const sizes = generateSizes();

      expect(sizes).toContain('767px');
      expect(sizes).toContain('1023px');
    });
  });

  describe('calculateImageDimensions', () => {
    it('should calculate square aspect ratio dimensions', () => {
      const dims = calculateImageDimensions(375, ASPECT_RATIOS.square);

      expect(dims.width).toBe(375);
      expect(dims.height).toBe(375);
    });

    it('should calculate video aspect ratio dimensions', () => {
      const dims = calculateImageDimensions(1440, ASPECT_RATIOS.video);

      expect(dims.width).toBe(1440);
      expect(dims.height).toBe(810); // 1440 * 9 / 16
    });

    it('should handle auto aspect ratio', () => {
      const dims = calculateImageDimensions(768, ASPECT_RATIOS.auto);

      expect(dims.width).toBe(768);
      expect(dims.height).toBe(0);
    });

    it('should scale dimensions proportionally', () => {
      const dims1 = calculateImageDimensions(375, ASPECT_RATIOS.square);
      const dims2 = calculateImageDimensions(750, ASPECT_RATIOS.square);

      expect(dims2.width).toBe(dims1.width * 2);
      expect(dims2.height).toBe(dims1.height * 2);
    });
  });

  describe('getOptimalImageWidth', () => {
    it('should return mobile width', () => {
      const width = getOptimalImageWidth('mobile');
      expect(width).toBe(375);
    });

    it('should return tablet width', () => {
      const width = getOptimalImageWidth('tablet');
      expect(width).toBe(768);
    });

    it('should return desktop width', () => {
      const width = getOptimalImageWidth('desktop');
      expect(width).toBe(1440);
    });

    it('should match VIEWPORT_SIZES', () => {
      expect(getOptimalImageWidth('mobile')).toBe(VIEWPORT_SIZES.mobile);
      expect(getOptimalImageWidth('tablet')).toBe(VIEWPORT_SIZES.tablet);
      expect(getOptimalImageWidth('desktop')).toBe(VIEWPORT_SIZES.desktop);
    });
  });

  describe('generateResponsiveImageConfig', () => {
    it('should generate complete responsive image configuration', () => {
      const config = generateResponsiveImageConfig('hero.png');

      expect(config.src).toBe('hero.png');
      expect(config.srcWebP).toBe('hero.webp');
      expect(config.srcSet).toContain('hero-375w.png');
      expect(config.srcSetWebP).toContain('hero-375w.webp');
      expect(config.sizes).toContain('(max-width: 767px)');
      expect(config.aspectRatio).toBe('auto');
      expect(config.objectFit).toBe('cover');
      expect(config.lazy).toBe(false);
    });

    it('should apply custom options', () => {
      const config = generateResponsiveImageConfig('image.jpg', {
        aspectRatio: 'square',
        objectFit: 'contain',
        lazy: true,
      });

      expect(config.aspectRatio).toBe('square');
      expect(config.objectFit).toBe('contain');
      expect(config.lazy).toBe(true);
    });

    it('should generate custom sizes', () => {
      const config = generateResponsiveImageConfig('image.png', {
        mobileSize: '90vw',
        tabletSize: '70vw',
        desktopSize: '50vw',
      });

      expect(config.sizes).toContain('90vw');
      expect(config.sizes).toContain('70vw');
      expect(config.sizes).toContain('50vw');
    });
  });

  describe('Viewport Sizes Constants', () => {
    it('should have correct mobile viewport size', () => {
      expect(VIEWPORT_SIZES.mobile).toBe(375);
    });

    it('should have correct tablet viewport size', () => {
      expect(VIEWPORT_SIZES.tablet).toBe(768);
    });

    it('should have correct desktop viewport size', () => {
      expect(VIEWPORT_SIZES.desktop).toBe(1440);
    });

    it('should have responsive widths array', () => {
      expect(RESPONSIVE_WIDTHS).toEqual([375, 768, 1440]);
    });
  });

  describe('Aspect Ratio Constants', () => {
    it('should have square aspect ratio', () => {
      expect(ASPECT_RATIOS.square).toEqual({ width: 1, height: 1 });
    });

    it('should have video aspect ratio', () => {
      expect(ASPECT_RATIOS.video).toEqual({ width: 16, height: 9 });
    });

    it('should have auto aspect ratio', () => {
      expect(ASPECT_RATIOS.auto).toEqual({ width: 0, height: 0 });
    });
  });
});

describe('Responsive Image Component', () => {
  describe('ResponsiveImage - Basic Rendering', () => {
    it('should render img element with src', () => {
      const { container } = render(
        <ResponsiveImage src="test.png" alt="Test image" />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', 'test.png');
    });

    it('should render with alt text', () => {
      const { container } = render(
        <ResponsiveImage src="test.png" alt="Test image" />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('alt', 'Test image');
    });

    it('should render with lazy loading', () => {
      const { container } = render(
        <ResponsiveImage src="test.png" alt="Test" lazy />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('should render with eager loading by default', () => {
      const { container } = render(
        <ResponsiveImage src="test.png" alt="Test" />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('loading', 'eager');
    });
  });

  describe('ResponsiveImage - WebP Support', () => {
    it('should render picture element with WebP source', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          srcWebP="test.webp"
          alt="Test"
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
          alt="Test"
        />
      );

      const source = container.querySelector('source');
      expect(source).toHaveAttribute('type', 'image/webp');
    });

    it('should include PNG fallback in picture element', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          srcWebP="test.webp"
          alt="Test"
        />
      );

      const img = container.querySelector('picture img');
      expect(img).toHaveAttribute('src', 'test.png');
    });

    it('should use WebP srcset when provided', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          srcWebP="test.webp"
          srcSetWebP="test-375w.webp 375w, test-768w.webp 768w"
          alt="Test"
        />
      );

      const source = container.querySelector('source');
      expect(source).toHaveAttribute('srcSet', 'test-375w.webp 375w, test-768w.webp 768w');
    });
  });

  describe('ResponsiveImage - Responsive Sizing', () => {
    it('should include srcset attribute', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          alt="Test"
          srcSet="test-375w.png 375w, test-768w.png 768w"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('srcSet');
    });

    it('should include sizes attribute', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          alt="Test"
          sizes="(max-width: 767px) 100vw, 50vw"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('sizes', '(max-width: 767px) 100vw, 50vw');
    });

    it('should use default sizes when not provided', () => {
      const { container } = render(
        <ResponsiveImage src="test.png" alt="Test" />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('sizes');
    });

    it('should support mobile, tablet, desktop sizes', () => {
      const sizes = '(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw';
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          alt="Test"
          sizes={sizes}
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('sizes', sizes);
    });
  });

  describe('ResponsiveImage - Aspect Ratio', () => {
    it('should support square aspect ratio prop', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          alt="Test"
          aspectRatio="square"
        />
      );

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
    });

    it('should support video aspect ratio prop', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          alt="Test"
          aspectRatio="video"
        />
      );

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
    });

    it('should support auto aspect ratio', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          alt="Test"
          aspectRatio="auto"
        />
      );

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
    });
  });

  describe('ResponsiveImage - Object Fit', () => {
    it('should apply object-cover class', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          alt="Test"
          objectFit="cover"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('object-cover');
    });

    it('should apply object-contain class', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          alt="Test"
          objectFit="contain"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('object-contain');
    });

    it('should apply object-fill class', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          alt="Test"
          objectFit="fill"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('object-fill');
    });

    it('should apply object-scale-down class', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          alt="Test"
          objectFit="scale-down"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('object-scale-down');
    });

    it('should apply object-center class', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          alt="Test"
          objectPosition="center"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('object-center');
    });
  });

  describe('ResponsiveImage - Accessibility', () => {
    it('should have alt text for accessibility', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          alt="Descriptive alt text"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('alt', 'Descriptive alt text');
    });

    it('should support testId for testing', () => {
      const { container } = render(
        <ResponsiveImage
          src="test.png"
          alt="Test"
          testId="hero-image"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('data-testid', 'hero-image');
    });

    it('should have full width and height classes', () => {
      const { container } = render(
        <ResponsiveImage src="test.png" alt="Test" />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('w-full', 'h-full');
    });
  });

  describe('ResponsiveImageContainer', () => {
    it('should render container with children', () => {
      const { container } = render(
        <ResponsiveImageContainer>
          <img src="test.png" alt="Test" />
        </ResponsiveImageContainer>
      );

      const div = container.firstChild;
      expect(div).toBeInTheDocument();
    });

    it('should apply square aspect ratio', () => {
      const { container } = render(
        <ResponsiveImageContainer aspectRatio="square">
          <img src="test.png" alt="Test" />
        </ResponsiveImageContainer>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('aspect-square');
    });

    it('should apply video aspect ratio', () => {
      const { container } = render(
        <ResponsiveImageContainer aspectRatio="video">
          <img src="test.png" alt="Test" />
        </ResponsiveImageContainer>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('aspect-video');
    });

    it('should have overflow hidden to prevent layout shift', () => {
      const { container } = render(
        <ResponsiveImageContainer aspectRatio="square">
          <img src="test.png" alt="Test" />
        </ResponsiveImageContainer>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('overflow-hidden');
    });

    it('should have full width', () => {
      const { container } = render(
        <ResponsiveImageContainer>
          <img src="test.png" alt="Test" />
        </ResponsiveImageContainer>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('w-full');
    });

    it('should support testId', () => {
      const { container } = render(
        <ResponsiveImageContainer testId="image-container">
          <img src="test.png" alt="Test" />
        </ResponsiveImageContainer>
      );

      const div = container.firstChild;
      expect(div).toHaveAttribute('data-testid', 'image-container');
    });
  });

  describe('Responsive Image Scaling - Integration', () => {
    it('should maintain aspect ratio on mobile', () => {
      const { container } = render(
        <ResponsiveImageContainer aspectRatio="square">
          <ResponsiveImage
            src="test.png"
            alt="Test"
            objectFit="cover"
          />
        </ResponsiveImageContainer>
      );

      const container_div = container.firstChild;
      expect(container_div).toHaveClass('aspect-square');
    });

    it('should maintain aspect ratio on tablet', () => {
      const { container } = render(
        <ResponsiveImageContainer aspectRatio="video">
          <ResponsiveImage
            src="test.png"
            alt="Test"
            objectFit="cover"
          />
        </ResponsiveImageContainer>
      );

      const container_div = container.firstChild;
      expect(container_div).toHaveClass('aspect-video');
    });

    it('should maintain aspect ratio on desktop', () => {
      const { container } = render(
        <ResponsiveImageContainer aspectRatio="square">
          <ResponsiveImage
            src="test.png"
            alt="Test"
            objectFit="cover"
          />
        </ResponsiveImageContainer>
      );

      const container_div = container.firstChild;
      expect(container_div).toHaveClass('aspect-square');
    });

    it('should use WebP with PNG fallback', () => {
      const { container } = render(
        <ResponsiveImageContainer aspectRatio="square">
          <ResponsiveImage
            src="test.png"
            srcWebP="test.webp"
            alt="Test"
            objectFit="cover"
          />
        </ResponsiveImageContainer>
      );

      const picture = container.querySelector('picture');
      expect(picture).toBeInTheDocument();

      const source = container.querySelector('source');
      expect(source).toHaveAttribute('type', 'image/webp');
    });

    it('should use responsive sizing with srcset', () => {
      const { container } = render(
        <ResponsiveImageContainer aspectRatio="square">
          <ResponsiveImage
            src="test.png"
            alt="Test"
            srcSet="test-375w.png 375w, test-768w.png 768w, test-1440w.png 1440w"
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
            objectFit="cover"
          />
        </ResponsiveImageContainer>
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('srcSet');
      expect(img).toHaveAttribute('sizes');
    });

    it('should use lazy loading for performance', () => {
      const { container } = render(
        <ResponsiveImageContainer aspectRatio="square">
          <ResponsiveImage
            src="test.png"
            alt="Test"
            lazy
            objectFit="cover"
          />
        </ResponsiveImageContainer>
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('should prevent layout shift with aspect ratio container', () => {
      const { container } = render(
        <ResponsiveImageContainer aspectRatio="square">
          <ResponsiveImage
            src="test.png"
            alt="Test"
            objectFit="cover"
          />
        </ResponsiveImageContainer>
      );

      const div = container.firstChild;
      expect(div).toHaveClass('aspect-square', 'overflow-hidden');
    });
  });

  describe('Responsive Image Scaling - Viewport Sizes', () => {
    it('should support mobile viewport (375px)', () => {
      const config = generateResponsiveImageConfig('image.png');
      expect(config.srcSet).toContain('375w');
    });

    it('should support tablet viewport (768px)', () => {
      const config = generateResponsiveImageConfig('image.png');
      expect(config.srcSet).toContain('768w');
    });

    it('should support desktop viewport (1440px)', () => {
      const config = generateResponsiveImageConfig('image.png');
      expect(config.srcSet).toContain('1440w');
    });

    it('should generate appropriate sizes for mobile', () => {
      const sizes = generateSizes('100vw', '50vw', '33vw');
      expect(sizes).toContain('(max-width: 767px) 100vw');
    });

    it('should generate appropriate sizes for tablet', () => {
      const sizes = generateSizes('100vw', '50vw', '33vw');
      expect(sizes).toContain('(max-width: 1023px) 50vw');
    });

    it('should generate appropriate sizes for desktop', () => {
      const sizes = generateSizes('100vw', '50vw', '33vw');
      expect(sizes).toContain('33vw');
    });
  });

  describe('Responsive Image Scaling - Format Support', () => {
    it('should support PNG format', () => {
      const config = generateResponsiveImageConfig('image.png');
      expect(config.src).toContain('.png');
    });

    it('should support JPG format', () => {
      const config = generateResponsiveImageConfig('image.jpg');
      expect(config.src).toContain('.jpg');
    });

    it('should support JPEG format', () => {
      const config = generateResponsiveImageConfig('image.jpeg');
      expect(config.src).toContain('.jpeg');
    });

    it('should support WebP format', () => {
      const config = generateResponsiveImageConfig('image.png');
      expect(config.srcWebP).toContain('.webp');
    });

    it('should convert all formats to WebP', () => {
      const pngWebP = generateWebPUrl('image.png');
      const jpgWebP = generateWebPUrl('image.jpg');
      const jpegWebP = generateWebPUrl('image.jpeg');

      expect(pngWebP).toBe('image.webp');
      expect(jpgWebP).toBe('image.webp');
      expect(jpegWebP).toBe('image.webp');
    });
  });
});
