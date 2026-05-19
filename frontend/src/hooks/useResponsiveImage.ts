/**
 * useResponsiveImage Hook
 * 
 * Custom hook for managing responsive image loading and optimization
 */

import { useEffect, useState, useCallback } from 'react';
import {
  generateResponsiveImageConfig,
  isWebPSupported,
  getImageDimensions,
  VIEWPORT_SIZES,
} from '../lib/imageUtils';

interface UseResponsiveImageOptions {
  /**
   * Base image URL
   */
  src: string;

  /**
   * Aspect ratio for the image
   */
  aspectRatio?: 'square' | 'video' | 'auto';

  /**
   * Object-fit CSS property
   */
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';

  /**
   * Enable lazy loading
   */
  lazy?: boolean;

  /**
   * Custom sizes attribute
   */
  sizes?: string;

  /**
   * Callback when image loads
   */
  onLoad?: () => void;

  /**
   * Callback when image fails to load
   */
  onError?: (error: Error) => void;
}

interface UseResponsiveImageResult {
  /**
   * Primary image source (PNG)
   */
  src: string;

  /**
   * WebP image source
   */
  srcWebP: string;

  /**
   * Responsive image srcset (PNG)
   */
  srcSet: string;

  /**
   * Responsive image srcset (WebP)
   */
  srcSetWebP: string;

  /**
   * Sizes attribute for responsive images
   */
  sizes: string;

  /**
   * Aspect ratio
   */
  aspectRatio: 'square' | 'video' | 'auto';

  /**
   * Object-fit CSS property
   */
  objectFit: 'cover' | 'contain' | 'fill' | 'scale-down';

  /**
   * Whether WebP is supported
   */
  webPSupported: boolean;

  /**
   * Image dimensions
   */
  dimensions: { width: number; height: number } | null;

  /**
   * Whether image is loading
   */
  isLoading: boolean;

  /**
   * Whether image has loaded
   */
  isLoaded: boolean;

  /**
   * Error message if image failed to load
   */
  error: Error | null;

  /**
   * Optimal image width for current viewport
   */
  optimalWidth: number;

  /**
   * Optimal image height for current viewport
   */
  optimalHeight: number;
}

/**
 * Hook for managing responsive image loading and optimization
 * 
 * Handles:
 * - WebP format detection and fallback
 * - Responsive image srcset generation
 * - Image dimension calculation
 * - Lazy loading
 * - Error handling
 * 
 * @param options - Configuration options
 * @returns Responsive image configuration and state
 * 
 * @example
 * const {
 *   src,
 *   srcWebP,
 *   srcSet,
 *   srcSetWebP,
 *   sizes,
 *   isLoaded,
 *   dimensions,
 * } = useResponsiveImage({
 *   src: 'hero.png',
 *   aspectRatio: 'square',
 *   lazy: true,
 * });
 */
export function useResponsiveImage(options: UseResponsiveImageOptions): UseResponsiveImageResult {
  const {
    src,
    aspectRatio = 'auto',
    objectFit = 'cover',
    lazy = false,
    sizes,
    onLoad,
    onError,
  } = options;

  const [webPSupported, setWebPSupported] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [optimalWidth, setOptimalWidth] = useState<number>(VIEWPORT_SIZES.desktop);
  const [optimalHeight, setOptimalHeight] = useState(0);

  // Check WebP support on mount
  useEffect(() => {
    isWebPSupported().then(setWebPSupported);
  }, []);

  // Get image dimensions
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    getImageDimensions(src)
      .then((dims) => {
        setDimensions(dims);
        setIsLoaded(true);
        setIsLoading(false);
        onLoad?.();
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
        onError?.(err);
      });
  }, [src, onLoad, onError]);

  // Calculate optimal dimensions based on viewport
  const updateOptimalDimensions = useCallback(() => {
    if (!dimensions) return;

    const viewport = window.innerWidth;
    let width: number = VIEWPORT_SIZES.desktop;

    if (viewport < 768) {
      width = VIEWPORT_SIZES.mobile;
    } else if (viewport < 1024) {
      width = VIEWPORT_SIZES.tablet;
    }

    setOptimalWidth(width);

    // Calculate height based on aspect ratio
    if (aspectRatio === 'square') {
      setOptimalHeight(width);
    } else if (aspectRatio === 'video') {
      setOptimalHeight(Math.round((width * 9) / 16));
    } else {
      // Auto: use original aspect ratio
      const ratio = dimensions.height / dimensions.width;
      setOptimalHeight(Math.round(width * ratio));
    }
  }, [dimensions, aspectRatio]);

  // Update optimal dimensions on mount and resize
  useEffect(() => {
    updateOptimalDimensions();
    window.addEventListener('resize', updateOptimalDimensions);
    return () => window.removeEventListener('resize', updateOptimalDimensions);
  }, [updateOptimalDimensions]);

  // Generate responsive image configuration
  const config = generateResponsiveImageConfig(src, {
    aspectRatio,
    objectFit,
    lazy,
  });

  return {
    src: config.src,
    srcWebP: webPSupported ? config.srcWebP : config.src,
    srcSet: config.srcSet,
    srcSetWebP: webPSupported ? config.srcSetWebP : config.srcSet,
    sizes: sizes || config.sizes,
    aspectRatio,
    objectFit,
    webPSupported,
    dimensions,
    isLoading,
    isLoaded,
    error,
    optimalWidth,
    optimalHeight,
  };
}

export default useResponsiveImage;
