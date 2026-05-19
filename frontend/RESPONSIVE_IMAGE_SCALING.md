# Responsive Image Scaling Implementation

## Overview

This document describes the responsive image scaling implementation for the Freightpilot frontend redesign. The implementation ensures images maintain aspect ratios, provide appropriate sized versions for each viewport (mobile: 375px, tablet: 768px, desktop: 1440px), and use WebP format with PNG fallback for optimal performance.

**Validates: Requirements 8.5, 9.4**

## Features

### 1. Aspect Ratio Preservation

Images maintain their aspect ratios across all viewports using CSS aspect-ratio containers:

- **Square (1:1)**: Used for feature cards, profile images, and hero sections
- **Video (16:9)**: Used for video thumbnails and wide content
- **Auto**: Preserves original image aspect ratio

```tsx
<ResponsiveImageContainer aspectRatio="square">
  <ResponsiveImage
    src="image.png"
    alt="Description"
    objectFit="cover"
  />
</ResponsiveImageContainer>
```

### 2. Viewport-Specific Image Sizes

The implementation provides optimized image sizes for each viewport:

- **Mobile (375px)**: 375w - Full width on mobile devices
- **Tablet (768px)**: 768w - Half width on tablet devices
- **Desktop (1440px)**: 1440w - One-third width on desktop

Images are automatically generated with width descriptors in the srcset:

```
image-375w.png 375w, image-768w.png 768w, image-1440w.png 1440w
```

### 3. WebP Format with PNG Fallback

The implementation uses the `<picture>` element to provide WebP format with PNG fallback:

```tsx
<ResponsiveImage
  src="image.png"
  srcWebP="image.webp"
  alt="Description"
/>
```

This renders as:

```html
<picture>
  <source srcSet="image.webp" type="image/webp" sizes="..." />
  <img src="image.png" srcSet="image-375w.png 375w, ..." sizes="..." />
</picture>
```

### 4. Lazy Loading for Performance

Below-the-fold images use lazy loading to improve page load performance:

```tsx
<ResponsiveImage
  src="image.png"
  alt="Description"
  lazy
/>
```

This sets `loading="lazy"` on the image element, deferring load until the image is near the viewport.

### 5. Responsive Sizing with Sizes Attribute

The `sizes` attribute tells the browser which image size to use at different breakpoints:

```
(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw
```

This means:
- On mobile (≤767px): Use 100% of viewport width
- On tablet (≤1023px): Use 50% of viewport width
- On desktop (>1023px): Use 33% of viewport width

## Components

### ResponsiveImage

The main component for rendering responsive images with WebP support.

**Props:**

```typescript
interface ResponsiveImageProps {
  src: string;                    // PNG fallback URL
  alt: string;                    // Alt text for accessibility
  srcWebP?: string;               // WebP format URL
  srcSet?: string;                // Responsive image srcset
  srcSetWebP?: string;            // WebP responsive srcset
  sizes?: string;                 // Sizes attribute for responsive sizing
  aspectRatio?: 'square' | 'video' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  objectPosition?: string;        // Default: 'center'
  lazy?: boolean;                 // Enable lazy loading
  className?: string;             // Additional CSS classes
  testId?: string;                // Test ID for testing
  viewportSizes?: number[];       // Custom viewport sizes
  autoGenerateWebP?: boolean;     // Auto-generate WebP srcset
}
```

**Example:**

```tsx
<ResponsiveImage
  src="hero.png"
  srcWebP="hero.webp"
  alt="Hero section illustration"
  srcSet="hero-375w.png 375w, hero-768w.png 768w, hero-1440w.png 1440w"
  srcSetWebP="hero-375w.webp 375w, hero-768w.webp 768w, hero-1440w.webp 1440w"
  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
  aspectRatio="square"
  objectFit="cover"
  lazy
/>
```

### ResponsiveImageContainer

Wrapper component that handles aspect ratio and prevents layout shift.

**Props:**

```typescript
interface ResponsiveImageContainerProps {
  aspectRatio?: 'square' | 'video' | 'auto';
  children: React.ReactNode;
  className?: string;
  testId?: string;
}
```

**Example:**

```tsx
<ResponsiveImageContainer aspectRatio="square">
  <ResponsiveImage
    src="image.png"
    alt="Description"
    objectFit="cover"
  />
</ResponsiveImageContainer>
```

## Utility Functions

### Image Utilities (`lib/imageUtils.ts`)

#### generateResponsiveImageUrls

Generates responsive image URLs for different viewports.

```typescript
const urls = generateResponsiveImageUrls('hero.png');
// Returns: { mobile: 'hero-375w.png', tablet: 'hero-768w.png', desktop: 'hero-1440w.png' }
```

#### generateWebPUrl

Converts PNG/JPG URLs to WebP format.

```typescript
const webpUrl = generateWebPUrl('image.png');
// Returns: 'image.webp'
```

#### generateSrcSet

Generates srcset attribute for responsive images.

```typescript
const srcset = generateSrcSet('image.png');
// Returns: 'image-375w.png 375w, image-768w.png 768w, image-1440w.png 1440w'
```

#### generateSizes

Generates sizes attribute for responsive images.

```typescript
const sizes = generateSizes();
// Returns: '(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw'
```

#### calculateImageDimensions

Calculates optimal image dimensions based on aspect ratio.

```typescript
const dims = calculateImageDimensions(375, { width: 1, height: 1 });
// Returns: { width: 375, height: 375 }
```

#### generateResponsiveImageConfig

Generates complete responsive image configuration.

```typescript
const config = generateResponsiveImageConfig('hero.png', {
  aspectRatio: 'square',
  objectFit: 'cover',
  lazy: true,
});
```

### useResponsiveImage Hook

Custom hook for managing responsive image loading and optimization.

```typescript
const {
  src,
  srcWebP,
  srcSet,
  srcSetWebP,
  sizes,
  isLoaded,
  dimensions,
  optimalWidth,
  optimalHeight,
} = useResponsiveImage({
  src: 'hero.png',
  aspectRatio: 'square',
  lazy: true,
});
```

## Usage Examples

### Hero Section with Responsive Images

```tsx
import { HeroSection } from './components/HeroSection';

export function HomePage() {
  return (
    <HeroSection
      headline="Orchestrate Your Fleet Operations"
      subheading="Manage your fleet operations efficiently"
      imageUrl="hero.png"
      imageAlt="Hero section illustration"
    />
  );
}
```

### Feature Card with Responsive Image

```tsx
import { ResponsiveImage, ResponsiveImageContainer } from './components/ResponsiveImage';
import { generateResponsiveImageConfig } from './lib/imageUtils';

export function FeatureCard() {
  const imageConfig = generateResponsiveImageConfig('feature.png', {
    aspectRatio: 'square',
    objectFit: 'cover',
    lazy: true,
  });

  return (
    <div className="card">
      <ResponsiveImageContainer aspectRatio="square">
        <ResponsiveImage
          src={imageConfig.src}
          srcWebP={imageConfig.srcWebP}
          alt="Feature illustration"
          srcSet={imageConfig.srcSet}
          srcSetWebP={imageConfig.srcSetWebP}
          sizes={imageConfig.sizes}
          objectFit="cover"
          lazy
        />
      </ResponsiveImageContainer>
      <h3>Feature Title</h3>
      <p>Feature description</p>
    </div>
  );
}
```

### Custom Responsive Image with Hook

```tsx
import { useResponsiveImage } from './hooks/useResponsiveImage';

export function CustomImage() {
  const {
    src,
    srcWebP,
    srcSet,
    srcSetWebP,
    sizes,
    isLoaded,
    dimensions,
  } = useResponsiveImage({
    src: 'image.png',
    aspectRatio: 'video',
    lazy: true,
  });

  return (
    <div>
      {!isLoaded && <div>Loading...</div>}
      <picture>
        <source srcSet={srcSetWebP} type="image/webp" sizes={sizes} />
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt="Description"
          className="w-full h-auto"
        />
      </picture>
      {dimensions && <p>Image: {dimensions.width}x{dimensions.height}</p>}
    </div>
  );
}
```

## Image Optimization Guidelines

### 1. Image Preparation

Before using images in the application:

1. **Resize images** to the required viewport sizes:
   - Mobile: 375px width
   - Tablet: 768px width
   - Desktop: 1440px width

2. **Create WebP versions** of all images:
   - Use tools like Squoosh, ImageMagick, or ffmpeg
   - Maintain 80% quality for WebP
   - Keep PNG as lossless fallback

3. **Optimize file sizes**:
   - Use ImageOptim or similar tools
   - Compress PNG files
   - Aim for <100KB per image

### 2. File Naming Convention

Use consistent naming for responsive images:

```
image-375w.png    (mobile)
image-375w.webp   (mobile WebP)
image-768w.png    (tablet)
image-768w.webp   (tablet WebP)
image-1440w.png   (desktop)
image-1440w.webp  (desktop WebP)
```

### 3. Asset Organization

Store images in organized directories:

```
src/assets/
├── hero/
│   ├── hero-375w.png
│   ├── hero-375w.webp
│   ├── hero-768w.png
│   ├── hero-768w.webp
│   ├── hero-1440w.png
│   └── hero-1440w.webp
├── features/
│   ├── feature-1-375w.png
│   ├── feature-1-375w.webp
│   └── ...
└── ...
```

## Performance Considerations

### 1. Lazy Loading

Use lazy loading for below-the-fold images:

```tsx
<ResponsiveImage
  src="image.png"
  alt="Description"
  lazy  // Defers loading until image is near viewport
/>
```

### 2. Image Compression

- WebP format reduces file size by 25-35% compared to PNG
- Use appropriate quality settings (80% for WebP, lossless for PNG)
- Compress images before deployment

### 3. Aspect Ratio Containers

Use aspect ratio containers to prevent layout shift:

```tsx
<ResponsiveImageContainer aspectRatio="square">
  <ResponsiveImage src="image.png" alt="Description" />
</ResponsiveImageContainer>
```

This reserves space for the image before it loads, preventing CLS (Cumulative Layout Shift).

### 4. Sizes Attribute

Use appropriate sizes for different contexts:

```typescript
// Full-width images
sizes="(max-width: 767px) 100vw, (max-width: 1023px) 100vw, 100vw"

// Half-width images
sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 50vw"

// One-third width images
sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
```

## Browser Support

- **WebP**: Supported in Chrome, Edge, Firefox (90+), Safari (16+)
- **Fallback**: PNG/JPG for older browsers
- **Aspect Ratio**: Supported in all modern browsers
- **Lazy Loading**: Supported in all modern browsers

## Testing

Comprehensive tests are provided in `src/__tests__/responsive-image-scaling.test.tsx`:

```bash
npm run test responsive-image-scaling.test.tsx
```

Tests cover:
- Image utility functions
- ResponsiveImage component rendering
- WebP format support
- Responsive sizing with srcset and sizes
- Aspect ratio preservation
- Lazy loading
- Accessibility features

## Accessibility

### Alt Text

Always provide descriptive alt text:

```tsx
<ResponsiveImage
  src="image.png"
  alt="Hero section showing fleet management dashboard"
/>
```

### Decorative Images

For decorative images, use empty alt text:

```tsx
<ResponsiveImage
  src="decoration.png"
  alt=""  // Empty alt for decorative images
/>
```

### Image Dimensions

Include image dimensions in alt text when relevant:

```tsx
<ResponsiveImage
  src="chart.png"
  alt="Chart showing 50% increase in efficiency"
/>
```

## Troubleshooting

### Images Not Loading

1. Check file paths are correct
2. Verify WebP files exist if using srcWebP
3. Check browser console for 404 errors
4. Ensure image files are in the correct directory

### Layout Shift

1. Use ResponsiveImageContainer with aspectRatio
2. Ensure aspect ratio matches actual image dimensions
3. Check for missing sizes attribute

### WebP Not Working

1. Verify WebP files are properly formatted
2. Check browser support (use fallback for older browsers)
3. Ensure srcWebP prop is provided

### Performance Issues

1. Reduce image file sizes
2. Use lazy loading for below-the-fold images
3. Verify WebP compression is working
4. Check image dimensions match viewport sizes

## References

- [MDN: Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [WebP Format](https://developers.google.com/speed/webp)
- [CSS Aspect Ratio](https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio)
- [Lazy Loading](https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading)
- [Core Web Vitals](https://web.dev/vitals/)
