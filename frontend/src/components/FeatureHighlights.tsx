import React from 'react';
import { Card } from './Card';
import { Container } from './Container';
import { ResponsiveImage, ResponsiveImageContainer } from './ResponsiveImage';

interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeatureHighlightsProps {
  heading?: string;
  features?: Feature[];
  testId?: string;
}

/**
 * Feature Highlights Section Component
 * 
 * A responsive section displaying product features in a grid layout.
 * 
 * Features:
 * - Padding: 96px 24px (desktop), 64px 16px (tablet), 48px 12px (mobile)
 * - Background: #F3F4F6
 * - 3-column grid (desktop), 2-column (tablet), 1-column (mobile)
 * - Feature cards with icons, titles, and descriptions
 * - Hover animations with shadow and translateY effects
 * 
 * @example
 * <FeatureHighlights
 *   heading="Key Features"
 *   features={[
 *     {
 *       id: '1',
 *       icon: <IconComponent />,
 *       title: 'Feature 1',
 *       description: 'Description of feature 1'
 *     }
 *   ]}
 * />
 */
export const FeatureHighlights: React.FC<FeatureHighlightsProps> = ({
  heading = 'Why Choose Freightpilot',
  features = [
    {
      id: '1',
      icon: '🚚',
      title: 'Fleet Orchestration',
      description: 'Intelligently manage and optimize your entire fleet operations in real-time.',
    },
    {
      id: '2',
      icon: '✓',
      title: 'Compliance Assurance',
      description: 'Ensure all operations meet regulatory requirements and industry standards.',
    },
    {
      id: '3',
      icon: '📊',
      title: 'Data-Driven Insights',
      description: 'Make informed decisions with comprehensive analytics and reporting.',
    },
  ],
  testId,
}) => {
  return (
    <section
      className="py-2xl mobile:py-2xl tablet:py-3xl desktop:py-4xl bg-neutral-light"
      data-testid={testId}
      aria-label="Feature highlights"
    >
      <Container>
        {/* Section Heading */}
        <div className="mb-2xl mobile:mb-2xl tablet:mb-3xl desktop:mb-3xl text-center">
          <h2 className="text-h2 text-neutral-dark">
            {heading}
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-sm mobile:gap-sm tablet:gap-md desktop:gap-lg">
          {features.map((feature, index) => (
            <article
              key={feature.id}
              className="flex flex-col h-full animate-scale-in focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-blue focus-within:ring-offset-2 rounded-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
              data-testid={`feature-card-${feature.id}`}
              tabIndex={0}
              role="region"
              aria-label={`Feature: ${feature.title}`}
            >
              <Card className="flex flex-col h-full">
                {/* Icon */}
                <div className="text-4xl mobile:text-4xl tablet:text-5xl desktop:text-5xl mb-md mobile:mb-md tablet:mb-lg desktop:mb-lg text-primary-blue" aria-hidden="true">
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-h3 text-neutral-dark font-semibold mb-md mobile:mb-md tablet:mb-lg desktop:mb-lg">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-body text-neutral-medium flex-grow" style={{ lineHeight: '1.6' }}>
                  {feature.description}
                </p>
              </Card>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default FeatureHighlights;
