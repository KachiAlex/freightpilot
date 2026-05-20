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
      className="py-16 md:py-24"
      data-testid={testId}
      aria-label="Feature highlights"
    >
      <Container>
        {/* Section Heading */}
        <div className="mb-12 md:mb-16 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {heading}
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <article
              key={feature.id}
              className="flex flex-col h-full animate-scale-in focus-within:outline-none focus-within:ring-2 focus-within:ring-sky focus-within:ring-offset-2 rounded-2xl"
              style={{ animationDelay: `${index * 0.1}s` }}
              data-testid={`feature-card-${feature.id}`}
              tabIndex={0}
              role="region"
              aria-label={`Feature: ${feature.title}`}
            >
              <Card className="flex flex-col h-full border border-white/10 bg-white/5 backdrop-blur-lg hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                {/* Icon */}
                <div className="text-4xl md:text-5xl mb-4 md:mb-6 text-sky" aria-hidden="true">
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-3 md:mb-4">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-base md:text-lg text-slate-300 flex-grow" style={{ lineHeight: '1.6' }}>
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
