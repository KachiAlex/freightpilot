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
      className="py-12 md:py-16 px-4 md:px-8 border-t border-white/10"
      data-testid={testId}
      aria-label="Trusted companies"
    >
      <Container>
        {/* Heading */}
        <div className="mb-8 md:mb-12 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            {heading}
          </h2>
        </div>

        {/* Logo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 items-center justify-items-center">
          {companies.map((company, index) => (
            <article
              key={company.id}
              className="transition-opacity duration-200 hover:opacity-100 w-full flex justify-center animate-fade-in focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky rounded-lg"
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
