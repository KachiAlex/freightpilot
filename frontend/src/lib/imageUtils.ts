/**
 * Image Utility Functions
 * 
 * Provides utilities for responsive image handling including:
 * - Generating responsive image URLs for different viewports
 * - Converting images to WebP format
 * - Creating srcset and sizes attributes
 * - Calculating optimal image dimensions
 */

/**
 * Viewport sizes for responsive images
 * Mobile: 375px, Tablet: 768px, Desktop: 1440px
 */
export const VIEWPORT_SIZES = {
  mobile: 375,
  tablet: 768,
  desktop: 1440,
} as const;

/**
 * Standard viewport widths for responsive images
 */
export const RESPONSIVE_WIDTHS = [375, 768, 1440] as const;

/**
 * Aspect ratio presets
 */
export const ASPECT_RATIOS = {
  square: { width: 1, height: 1 },
  video: { width: 16, height: 9 },
  auto: { width: 0, height: 0 },
} as const;

/**
 * Generate responsive image URLs for different viewports
 * 
 * @param baseUrl - Base image URL (e.g., "image.png")
 * @param widths - Array of widths to generate (default: [375, 768, 1440])
 * @returns Object with URLs for each viewport
 * 
 * @example
 * const urls = generateResponsiveImageUrls('hero.png');
 * // Returns: { mobile: 'hero-375w.png', tablet: 'hero-768w.png', desktop: 'hero-1440w.png' }
 */
export function generateResponsiveImageUrls(
  baseUrl: string,
  widths: number[] = RESPONSIVE_WIDTHS
): Record<string, string> {
  const ext = baseUrl.substring(baseUrl.lastIndexOf('.'));
  const baseName = baseUrl.substring(0, baseUrl.lastIndexOf('.'));

  const result: Record<string, string> = {};
  const viewportNames = ['mobile', 'tablet', 'desktop'];

  widths.forEach((width, index) => {
    result[viewportNames[index]] = `${baseName}-${width}w${ext}`;
  });

  return result;
}

/**
 * Generate WebP URLs from PNG URLs
 * 
 * @param pngUrl - PNG image URL
 * @returns WebP image URL
 * 
 * @example
 * const webpUrl = generateWebPUrl('image.png');
 * // Returns: 'image.webp'
 */
export function generateWebPUrl(pngUrl: string): string {
  return pngUrl.replace(/\.(png|jpg|jpeg)$/i, '.webp');
}

/**
 * Generate srcset attribute for responsive images
 * 
 * @param baseUrl - Base image URL
 * @param widths - Array of widths (default: [375, 768, 1440])
 * @returns srcset attribute string
 * 
 * @example
 * const srcset = generateSrcSet('image.png');
 * // Returns: 'image-375w.png 375w, image-768w.png 768w, image-1440w.png 1440w'
 */
export function generateSrcSet(
  baseUrl: string,
  widths: number[] = RESPONSIVE_WIDTHS
): string {
  const ext = baseUrl.substring(baseUrl.lastIndexOf('.'));
  const baseName = baseUrl.substring(0, baseUrl.lastIndexOf('.'));

  return widths
    .map(width => `${baseName}-${width}w${ext} ${width}w`)
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 * 
 * @param mobileSize - Size on mobile (default: '100vw')
 * @param tabletSize - Size on tablet (default: '50vw')
 * @param desktopSize - Size on desktop (default: '33vw')
 * @returns sizes attribute string
 * 
 * @example
 * const sizes = generateSizes();
 * // Returns: '(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw'
 */
export function generateSizes(
  mobileSize: string = '100vw',
  tabletSize: string = '50vw',
  desktopSize: string = '33vw'
): string {
  return `(max-width: 767px) ${mobileSize}, (max-width: 1023px) ${tabletSize}, ${desktopSize}`;
}

/**
 * Calculate optimal image dimensions based on aspect ratio and container width
 * 
 * @param containerWidth - Width of the container
 * @param aspectRatio - Aspect ratio (width:height)
 * @returns Object with width and height
 * 
 * @example
 * const dims = calculateImageDimensions(375, { width: 1, height: 1 });
 * // Returns: { width: 375, height: 375 }
 */
export function calculateImageDimensions(
  containerWidth: number,
  aspectRatio: { width: number; height: number }
): { width: number; height: number } {
  if (aspectRatio.width === 0 || aspectRatio.height === 0) {
    return { width: containerWidth, height: 0 };
  }

  const height = (containerWidth * aspectRatio.height) / aspectRatio.width;
  return { width: containerWidth, height };
}

/**
 * Get optimal image width for a given viewport
 * 
 * @param viewport - Viewport name ('mobile', 'tablet', 'desktop')
 * @returns Optimal image width in pixels
 * 
 * @example
 * const width = getOptimalImageWidth('mobile');
 * // Returns: 375
 */
export function getOptimalImageWidth(
  viewport: 'mobile' | 'tablet' | 'desktop'
): number {
  return VIEWPORT_SIZES[viewport];
}

/**
 * Generate complete responsive image configuration
 * 
 * @param baseUrl - Base image URL
 * @param options - Configuration options
 * @returns Complete responsive image configuration
 * 
 * @example
 * const config = generateResponsiveImageConfig('hero.png', {
 *   aspectRatio: 'square',
 *   objectFit: 'cover',
 *   lazy: true,
 * });
 */
export function generateResponsiveImageConfig(
  baseUrl: string,
  options: {
    aspectRatio?: 'square' | 'video' | 'auto';
    objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
    lazy?: boolean;
    mobileSize?: string;
    tabletSize?: string;
    desktopSize?: string;
  } = {}
) {
  const {
    aspectRatio = 'auto',
    objectFit = 'cover',
    lazy = false,
    mobileSize = '100vw',
    tabletSize = '50vw',
    desktopSize = '33vw',
  } = options;

  const srcSet = generateSrcSet(baseUrl);
  const srcSetWebP = generateSrcSet(generateWebPUrl(baseUrl));
  const sizes = generateSizes(mobileSize, tabletSize, desktopSize);

  return {
    src: baseUrl,
    srcWebP: generateWebPUrl(baseUrl),
    srcSet,
    srcSetWebP,
    sizes,
    aspectRatio,
    objectFit,
    lazy,
  };
}

/**
 * Check if WebP is supported by the browser
 * 
 * @returns Promise that resolves to true if WebP is supported
 * 
 * @example
 * const isSupported = await isWebPSupported();
 * if (isSupported) {
 *   // Use WebP images
 * }
 */
export async function isWebPSupported(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAADwAQCdASoBIAEADsAcJaACdLoB/gAA/v8A/v8A';
  });
}

/**
 * Get image dimensions from URL
 * 
 * @param url - Image URL
 * @returns Promise that resolves to image dimensions
 * 
 * @example
 * const dims = await getImageDimensions('image.jpg');
 * console.log(dims); // { width: 1440, height: 960 }
 */
export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };
    img.src = url;
  });
}

/**
 * Format file size in human-readable format
 * 
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 * 
 * @example
 * const size = formatFileSize(1024000);
 * // Returns: '1.0 MB'
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i];
}
