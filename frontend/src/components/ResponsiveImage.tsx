import React, { ImgHTMLAttributes, useMemo } from 'react';

interface ResponsiveImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Source URL for the image (PNG fallback)
   */
  src: string;

  /**
   * Alt text for accessibility
   */
  alt: string;

  /**
   * WebP format source URL (optional)
   * If not provided, will attempt to derive from src
   */
  srcWebP?: string;

  /**
   * Responsive image sizes for different viewports
   * Format: "mobile-url tablet-url desktop-url" or srcset format
   * Example: "image-375w.jpg 375w, image-768w.jpg 768w, image-1440w.jpg 1440w"
   */
  srcSet?: string;

  /**
   * WebP srcset for responsive images
   * Format: "image-375w.webp 375w, image-768w.webp 768w, image-1440w.webp 1440w"
   */
  srcSetWebP?: string;

  /**
   * Sizes attribute for responsive images
   * Tells browser which image size to use at different breakpoints
   * Example: "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
   */
  sizes?: string;

  /**
   * Aspect ratio for the image container
   * Options: 'square' (1:1), 'video' (16:9), 'auto'
   */
  aspectRatio?: 'square' | 'video' | 'auto';

  /**
   * Object-fit CSS property
   * Options: 'cover', 'contain', 'fill', 'scale-down'
   */
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';

  /**
   * Object-position CSS property
   * Default: 'center'
   */
  objectPosition?: string;

  /**
   * Enable lazy loading for below-the-fold images
   */
  lazy?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Test ID for testing
   */
  testId?: string;

  /**
   * Viewport sizes for responsive image generation
   * Used to generate srcset if not provided
   * Default: [375, 768, 1440]
   */
  viewportSizes?: number[];

  /**
   * Whether to auto-generate WebP srcset from src
   * Default: true
   */
  autoGenerateWebP?: boolean;
}

/**
 * Responsive Image Component
 *
 * Provides responsive image handling with:
 * - WebP format support with PNG fallback
 * - Responsive sizing using srcset and sizes
 * - Aspect ratio preservation
 * - CSS object-fit for proper scaling
 * - Lazy loading for performance
 * - Proper alt text for accessibility
 * - Automatic viewport-based srcset generation
 *
 * @example
 * // Basic usage with WebP and PNG fallback
 * <ResponsiveImage
 *   src="image.png"
 *   srcWebP="image.webp"
 *   alt="Hero section illustration"
 *   aspectRatio="square"
 *   objectFit="cover"
 *   lazy
 * />
 *
 * @example
 * // With responsive sizing for different viewports
 * <ResponsiveImage
 *   src="image-1440w.png"
 *   srcWebP="image-1440w.webp"
 *   alt="Feature image"
 *   srcSet="image-375w.png 375w, image-768w.png 768w, image-1440w.png 1440w"
 *   srcSetWebP="image-375w.webp 375w, image-768w.webp 768w, image-1440w.webp 1440w"
 *   sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
 *   aspectRatio="square"
 *   objectFit="cover"
 *   lazy
 * />
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  srcWebP,
  srcSet,
  srcSetWebP,
  sizes,
  aspectRatio = 'auto',
  objectFit = 'cover',
  objectPosition = 'center',
  lazy = false,
  className = '',
  testId,
  viewportSizes = [375, 768, 1440],
  autoGenerateWebP = true,
  ...imgProps
}) => {
  // Build aspect ratio class
  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: '',
  }[aspectRatio];

  // Build object-fit class
  const objectFitClass = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    'scale-down': 'object-scale-down',
  }[objectFit];

  // Build object-position class
  const objectPositionClass = objectPosition === 'center' ? 'object-center' : '';

  // Combine all classes
  const combinedClassName = `
    w-full h-full
    ${objectFitClass}
    ${objectPositionClass}
    ${className}
  `.trim();

  // Memoize srcset generation to avoid unnecessary recalculations
  const generatedSrcSet = useMemo(() => {
    if (srcSet) return srcSet;
    
    // If no srcSet provided, generate one based on viewport sizes
    // This assumes the src URL can be modified to include width parameter
    // For example: image.png -> image-375w.png, image-768w.png, image-1440w.png
    const ext = src.substring(src.lastIndexOf('.'));
    const baseName = src.substring(0, src.lastIndexOf('.'));
    
    return viewportSizes
      .map(size => `${baseName}-${size}w${ext} ${size}w`)
      .join(', ');
  }, [srcSet, src, viewportSizes]);

  // Generate WebP srcset if not provided
  const generatedSrcSetWebP = useMemo(() => {
    if (srcSetWebP) return srcSetWebP;
    
    if (!autoGenerateWebP || !srcWebP) return undefined;
    
    // Generate WebP srcset from PNG srcset
    const ext = '.webp';
    const baseName = srcWebP.substring(0, srcWebP.lastIndexOf('.'));
    
    return viewportSizes
      .map(size => `${baseName}-${size}w${ext} ${size}w`)
      .join(', ');
  }, [srcSetWebP, srcWebP, viewportSizes, autoGenerateWebP]);

  // Default sizes if not provided
  const defaultSizes = '(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw';
  const finalSizes = sizes || defaultSizes;

  // If WebP is supported, use picture element for format negotiation
  if (srcWebP || generatedSrcSetWebP) {
    return (
      <picture data-testid={testId}>
        {/* WebP source with responsive sizing */}
        <source
          srcSet={generatedSrcSetWebP || srcWebP}
          type="image/webp"
          sizes={finalSizes}
        />
        {/* PNG fallback with responsive sizing */}
        <img
          src={src}
          alt={alt}
          srcSet={generatedSrcSet}
          sizes={finalSizes}
          loading={lazy ? 'lazy' : 'eager'}
          className={combinedClassName}
          data-testid={testId ? `${testId}-img` : undefined}
          {...imgProps}
        />
      </picture>
    );
  }

  // Standard img element with responsive attributes
  return (
    <img
      src={src}
      alt={alt}
      srcSet={generatedSrcSet}
      sizes={finalSizes}
      loading={lazy ? 'lazy' : 'eager'}
      className={combinedClassName}
      data-testid={testId}
      {...imgProps}
    />
  );
};

/**
 * Responsive Image Container Component
 *
 * Wrapper component that handles aspect ratio and responsive sizing
 * Use this to wrap ResponsiveImage for proper aspect ratio handling
 *
 * @example
 * <ResponsiveImageContainer aspectRatio="square">
 *   <ResponsiveImage
 *     src="image.png"
 *     alt="Description"
 *     objectFit="cover"
 *   />
 * </ResponsiveImageContainer>
 */
interface ResponsiveImageContainerProps {
  /**
   * Aspect ratio for the container
   */
  aspectRatio?: 'square' | 'video' | 'auto';

  /**
   * Children (typically ResponsiveImage component)
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Test ID for testing
   */
  testId?: string;
}

export const ResponsiveImageContainer: React.FC<ResponsiveImageContainerProps> = ({
  aspectRatio = 'auto',
  children,
  className = '',
  testId,
}) => {
  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: '',
  }[aspectRatio];

  return (
    <div
      className={`
        w-full overflow-hidden
        ${aspectRatioClass}
        ${className}
      `.trim()}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

export default ResponsiveImage;
