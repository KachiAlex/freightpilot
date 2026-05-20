import React from 'react';
import { Container } from './Container';

interface Metric {
  id: string;
  number: string;
  label: string;
  context: string;
}

interface MetricsSectionProps {
  metrics?: Metric[];
  testId?: string;
}

/**
 * Metrics Section Component
 * 
 * A responsive section displaying key metrics with glassmorphism design.
 * 
 * Features:
 * - Padding: 96px 24px (desktop), 64px 16px (tablet), 48px 12px (mobile)
 * - Linear gradient background from #0066FF to #00D9FF
 * - White text color
 * - 3-column grid (desktop), 2-column (tablet), 1-column (mobile)
 * - Glassmorphism effect with backdrop blur
 * 
 * @example
 * <MetricsSection
 *   metrics={[
 *     {
 *       id: '1',
 *       number: '10K+',
 *       label: 'Drivers',
 *       context: 'Orchestrated'
 *     }
 *   ]}
 * />
 */
export const MetricsSection: React.FC<MetricsSectionProps> = ({
  metrics = [
    {
      id: '1',
      number: '10K+',
      label: 'Drivers',
      context: 'Orchestrated',
    },
    {
      id: '2',
      number: '50M+',
      label: 'Violations',
      context: 'Prevented',
    },
    {
      id: '3',
      number: '100K+',
      label: 'Hours',
      context: 'Saved',
    },
  ],
  testId,
}) => {
  return (
    <section
      className="py-16 md:py-24"
      style={{
        background: 'linear-gradient(135deg, #0066FF 0%, #00D9FF 100%)',
      }}
      data-testid={testId}
      role="region"
      aria-label="Key metrics"
    >
      <Container>
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {metrics.map((metric, index) => (
            <article
              key={metric.id}
              className="p-6 md:p-8 rounded-2xl animate-scale-in focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                animationDelay: `${index * 0.1}s`,
              }}
              data-testid={`metric-card-${metric.id}`}
              tabIndex={0}
              role="region"
              aria-label={`${metric.label}: ${metric.number} ${metric.context}`}
            >
              {/* Number */}
              <div className="text-5xl md:text-6xl font-bold text-white mb-4 md:mb-6">
                {metric.number}
              </div>

              {/* Label */}
              <div
                className="text-lg md:text-xl font-normal mb-2 md:mb-3"
                style={{ color: 'rgba(255, 255, 255, 0.9)' }}
              >
                {metric.label}
              </div>

              {/* Context */}
              <div
                className="text-base md:text-lg font-normal"
                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                {metric.context}
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default MetricsSection;
