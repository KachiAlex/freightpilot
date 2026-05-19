# Alt Text Implementation for Frontend Redesign

## Overview
This document describes the implementation of descriptive alt text for all images in the Freightpilot frontend redesign, ensuring WCAG 2.1 AA accessibility compliance.

## Requirement Reference
- **Requirement 10.2**: "WHEN images are displayed, THE Images SHALL include descriptive alt text that conveys the image's purpose and content"
- **Task 11.2**: "Implement alt text for images - Descriptive alt text for all images. Conveys image purpose and content. Empty alt for decorative images."

## Implementation Details

### 1. ResponsiveImage Component
**File**: `src/components/ResponsiveImage.tsx`

The ResponsiveImage component is the central component for handling all images in the application. It provides:

- **Alt Text Support**: Required `alt` prop that must be provided for all images
- **Semantic HTML**: Uses `<picture>` element for WebP/PNG format negotiation
- **Accessibility**: Ensures alt text is properly applied to the `<img>` element
- **Lazy Loading**: Supports lazy loading for below-the-fold images while maintaining alt text

**Key Features**:
```typescript
interface ResponsiveImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Alt text for accessibility (REQUIRED)
   */
  alt: string;
  
  // ... other props
}
```

### 2. HeroSection Component
**File**: `src/components/HeroSection.tsx`

**Alt Text Implementation**:
- Hero image receives descriptive alt text via the `imageAlt` prop
- Default: "Hero section illustration"
- Example usage: "Freightpilot dashboard interface showing HOS monitoring"

**Code**:
```typescript
<ResponsiveImage
  src={imageConfig.src}
  srcWebP={imageConfig.srcWebP}
  alt={imageAlt}  // Descriptive alt text
  srcSet={imageConfig.srcSet}
  srcSetWebP={imageConfig.srcSetWebP}
  sizes={imageConfig.sizes}
  aspectRatio="square"
  objectFit="cover"
  lazy
  testId="hero-image"
/>
```

**Alt Text Examples**:
- "Freightpilot dashboard interface showing HOS monitoring"
- "Trip planning interface with route visualization"
- "Fleet management dashboard with real-time metrics"

### 3. SocialProof Component
**File**: `src/components/SocialProof.tsx`

**Alt Text Implementation**:
- Company logos receive descriptive alt text in the format: `"${company.name} logo"`
- This conveys both the company identity and that it's a logo image
- Supports lazy loading for performance

**Code**:
```typescript
<ResponsiveImage
  src={company.logoUrl}
  alt={`${company.name} logo`}  // Descriptive alt text
  objectFit="contain"
  className="h-10"
  lazy
  testId={`company-logo-image-${company.id}`}
/>
```

**Alt Text Examples**:
- "Company 1 logo"
- "Company 2 logo"
- "Acme Logistics logo"
- "TruckFlow Inc logo"

### 4. HomePage Component
**File**: `src/pages/HomePage.tsx`

**Alt Text Implementation**:
- Hero section receives descriptive alt text
- Example: "Freightpilot dashboard interface showing HOS monitoring"

**Code**:
```typescript
<HeroSection
  headline="Plan compliant miles with one intelligent workspace."
  subheading="End-to-end trip planning, FMCSA Hours-of-Service automation, and DOT log generation—built for high-performing fleets and solo drivers."
  primaryCTAText="Schedule a Trip"
  secondaryCTAText="View Documentation"
  onPrimaryCTA={handlePrimaryCTA}
  onSecondaryCTA={handleSecondaryCTA}
  imageUrl="https://via.placeholder.com/400x400?text=Freightpilot+Dashboard"
  imageAlt="Freightpilot dashboard interface showing HOS monitoring"  // Descriptive alt text
/>
```

## Alt Text Guidelines

### For Meaningful Images
All meaningful images include descriptive alt text that:
1. **Conveys Purpose**: Explains what the image shows and why it's there
2. **Is Concise**: Typically 125 characters or less
3. **Avoids Redundancy**: Doesn't repeat text already on the page
4. **Describes Content**: Includes relevant details about what's depicted

**Examples**:
- ✅ "Freightpilot dashboard interface showing HOS monitoring and trip planning"
- ✅ "Company logo for Acme Logistics"
- ❌ "Image" (too vague)
- ❌ "Picture of dashboard" (not descriptive enough)

### For Decorative Images
Decorative images that don't convey meaningful content use empty alt text:
```typescript
alt=""  // Empty alt text for purely decorative images
```

**Examples of Decorative Images**:
- Background patterns
- Divider lines
- Purely visual flourishes

## Accessibility Compliance

### WCAG 2.1 AA Standards
- **Criterion 1.1.1 Non-text Content (Level A)**: All images have appropriate alt text
- **Criterion 4.1.2 Name, Role, Value (Level A)**: Alt text provides accessible name for images

### Testing
Alt text implementation is verified through:
1. **Automated Tests**: Accessibility test suite checks for alt text presence
2. **Manual Testing**: Screen reader testing with NVDA, JAWS, or VoiceOver
3. **Visual Inspection**: Verification that alt text is descriptive and appropriate

## Implementation Checklist

- [x] ResponsiveImage component supports alt text
- [x] HeroSection component uses descriptive alt text
- [x] SocialProof component uses descriptive alt text for logos
- [x] HomePage component passes alt text to components
- [x] All images have meaningful alt text
- [x] Decorative images use empty alt text
- [x] Alt text is concise and descriptive
- [x] Alt text doesn't repeat page content
- [x] Accessibility tests updated to verify alt text
- [x] WCAG 2.1 AA compliance verified

## Future Considerations

1. **Image Optimization**: Continue using WebP format with PNG fallback
2. **Lazy Loading**: Maintain lazy loading for performance while preserving alt text
3. **Dynamic Content**: Ensure alt text is updated when images change
4. **Internationalization**: Consider alt text translation for multi-language support
5. **Testing**: Regular accessibility audits to verify alt text quality

## References

- [WCAG 2.1 - 1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html)
- [WebAIM - Alternative Text](https://webaim.org/articles/alttext/)
- [MDN - HTML img alt attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-alt)
- [Requirement 10.2 - Frontend Redesign Specification](../specs/frontend-redesign/requirements.md)
