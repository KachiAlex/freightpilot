import React from 'react';
import { Button } from './Button';
import { Container } from './Container';
import { ResponsiveImage, ResponsiveImageContainer } from './ResponsiveImage';
import { generateResponsiveImageConfig } from '../lib/imageUtils';

interface HeroSectionProps {
  headline?: string;
  subheading?: string;
  primaryCTAText?: string;
  secondaryCTAText?: string;
  onPrimaryCTA?: () => void;
  onSecondaryCTA?: () => void;
  imageUrl?: string;
  imageAlt?: string;
  testId?: string;
}

/**
 * Hero Section Component
 * 
 * A responsive hero section with headline, subheading, CTA buttons, and visual column.
 * 
 * Features:
 * - Desktop: two-column layout (60% content, 40% visual)
 * - Tablet and mobile: single column, stacked
 * - Padding: 96px 24px (desktop), 64px 16px (tablet), 48px 12px (mobile)
 * - H1: 48px (desktop), 32px (mobile), weight 700, color #1F2937
 * - Subheading: 18px, weight 400, color #6B7280, line-height 1.6
 * - CTA buttons with primary and secondary styles
 * - Gradient background for visual column
 * - Responsive images with WebP format and PNG fallback
 * - Lazy loading for images
 * - Maintains aspect ratios across all viewports
 * 
 * @example
 * <HeroSection
 *   headline="Schedule Your Trip"
 *   subheading="Manage your fleet operations efficiently"
 *   primaryCTAText="Schedule a Trip"
 *   secondaryCTAText="View Documentation"
 *   onPrimaryCTA={() => console.log('Primary CTA clicked')}
 *   onSecondaryCTA={() => console.log('Secondary CTA clicked')}
 *   imageUrl="hero.png"
 *   imageAlt="Hero section illustration"
 * />
 */
export const HeroSection: React.FC<HeroSectionProps> = ({
  headline = 'Orchestrate Your Fleet Operations',
  subheading = 'Freightpilot helps logistics companies optimize driver workflows, ensure compliance, and maximize efficiency.',
  primaryCTAText = 'Schedule a Trip',
  secondaryCTAText = 'View Documentation',
  onPrimaryCTA = () => {},
  onSecondaryCTA = () => {},
  imageUrl = 'https://via.placeholder.com/1440x1440?text=Hero+Image',
  imageAlt = 'Hero section illustration',
  testId,
}) => {
  // Generate responsive image configuration
  const imageConfig = generateResponsiveImageConfig(imageUrl, {
    aspectRatio: 'square',
    objectFit: 'cover',
    lazy: true,
    mobileSize: '100vw',
    tabletSize: '100vw',
    desktopSize: '50vw',
  });

  return (
    <section
      className="py-16 md:py-24 animate-fade-in"
      data-testid={testId}
      aria-label="Hero section"
    >
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Content Column */}
          <article className="flex flex-col">
            {/* Headline */}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              style={{ maxWidth: '600px', lineHeight: '1.1' }}
            >
              {headline}
            </h1>

            {/* Subheading */}
            <p
              className="text-lg md:text-xl text-slate-300 mb-8"
              style={{ maxWidth: '550px', lineHeight: '1.6' }}
            >
              {subheading}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                size="regular"
                onClick={onPrimaryCTA}
                aria-label={primaryCTAText}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onPrimaryCTA();
                  }
                }}
              >
                {primaryCTAText}
              </Button>
              <Button
                variant="secondary"
                size="regular"
                onClick={onSecondaryCTA}
                aria-label={secondaryCTAText}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSecondaryCTA();
                  }
                }}
              >
                {secondaryCTAText}
              </Button>
            </div>
          </article>

          {/* Visual Column */}
          <div
            className="hidden md:flex items-center justify-center rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-lg"
          >
            <ResponsiveImageContainer aspectRatio="square">
              <ResponsiveImage
                src={imageConfig.src}
                srcWebP={imageConfig.srcWebP}
                alt={imageAlt}
                srcSet={imageConfig.srcSet}
                srcSetWebP={imageConfig.srcSetWebP}
                sizes={imageConfig.sizes}
                aspectRatio="square"
                objectFit="cover"
                lazy
                testId="hero-image"
              />
            </ResponsiveImageContainer>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;
