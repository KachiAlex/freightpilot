import React from 'react';
import { Container } from './Container';
import { ResponsiveImage } from './ResponsiveImage';

interface CompanyLogo {
  id: string;
  name: string;
  logoUrl: string;
}

interface SocialProofProps {
  heading?: string;
  companies?: CompanyLogo[];
  testId?: string;
}

/**
 * Social Proof Section Component
 * 
 * A responsive section displaying trusted company logos.
 * 
 * Features:
 * - Padding: 48px 24px
 * - White background
 * - Logo grid: 6 columns (desktop), 3 (tablet), 2 (mobile)
 * - Logo height: 40px, grayscale filter, opacity 0.6
 * - Hover: opacity 1.0, 200ms transition
 * 
 * @example
 * <SocialProof
 *   heading="Trusted by leading logistics companies"
 *   companies={[
 *     {
 *       id: '1',
 *       name: 'Company 1',
 *       logoUrl: 'https://example.com/logo1.png'
 *     }
 *   ]}
 * />
 */
export const SocialProof: React.FC<SocialProofProps> = ({
  heading = 'Trusted by leading logistics companies',
  companies = [
    {
      id: '1',
      name: 'Company 1',
      logoUrl: 'https://via.placeholder.com/120x40?text=Company+1',
    },
    {
      id: '2',
      name: 'Company 2',
      logoUrl: 'https://via.placeholder.com/120x40?text=Company+2',
    },
    {
      id: '3',
      name: 'Company 3',
      logoUrl: 'https://via.placeholder.com/120x40?text=Company+3',
    },
    {
      id: '4',
      name: 'Company 4',
      logoUrl: 'https://via.placeholder.com/120x40?text=Company+4',
    },
    {
      id: '5',
      name: 'Company 5',
      logoUrl: 'https://via.placeholder.com/120x40?text=Company+5',
    },
    {
      id: '6',
      name: 'Company 6',
      logoUrl: 'https://via.placeholder.com/120x40?text=Company+6',
    },
  ],
  testId,
}) => {
  return (
    <section
      className="py-2xl mobile:py-2xl tablet:py-2xl desktop:py-3xl px-sm mobile:px-sm tablet:px-md desktop:px-lg bg-neutral-white border-t border-neutral-border"
      data-testid={testId}
      aria-label="Trusted companies"
    >
      <Container>
        {/* Heading */}
        <div className="mb-2xl mobile:mb-2xl tablet:mb-2xl desktop:mb-2xl text-center">
          <h2 className="text-h2 text-neutral-dark">
            {heading}
          </h2>
        </div>

        {/* Logo Grid */}
        <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-6 gap-sm mobile:gap-sm tablet:gap-md desktop:gap-lg items-center justify-items-center">
          {companies.map((company, index) => (
            <article
              key={company.id}
              className="transition-opacity duration-200 hover:opacity-100 w-full flex justify-center animate-fade-in focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue rounded-sm"
              style={{ opacity: 0.6, animationDelay: `${index * 0.05}s` }}
              data-testid={`company-logo-${company.id}`}
              tabIndex={0}
              role="region"
              aria-label={`${company.name} logo`}
            >
              <ResponsiveImage
                src={company.logoUrl}
                alt={`${company.name} logo`}
                objectFit="contain"
                className="h-10"
                lazy
                testId={`company-logo-image-${company.id}`}
              />
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default SocialProof;
