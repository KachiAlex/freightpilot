import React from 'react';
import {
  Navigation,
  HeroSection,
  FeatureHighlights,
  WorkflowSection,
  MetricsSection,
  SocialProof,
  Footer,
} from '../components';

/**
 * HomePage Component
 * 
 * The main landing page that integrates all redesigned components.
 * Features responsive design across mobile, tablet, and desktop viewports.
 * 
 * Layout:
 * - Navigation (fixed at top)
 * - Hero Section
 * - Feature Highlights
 * - Workflow Section
 * - Metrics Section
 * - Social Proof
 * - Footer
 * 
 * Responsive Breakpoints:
 * - Mobile: 320px - 767px (single-column stacked layout)
 * - Tablet: 768px - 1023px (two-column layouts)
 * - Desktop: 1024px+ (multi-column grids)
 */
export const HomePage: React.FC = () => {
  const handlePrimaryCTA = () => {
    window.location.href = '/auth/register';
  };

  const handleSecondaryCTA = () => {
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-neutral-white">
      {/* Header with Navigation */}
      <header className="fixed top-0 left-0 right-0 z-1000">
        <Navigation />
      </header>

      {/* Main content with top padding to account for fixed navigation */}
      <main className="pt-72 desktop:pt-72 tablet:pt-64 mobile:pt-64">
        {/* Hero Section */}
        <section>
          <HeroSection
            headline="Plan compliant miles with one intelligent workspace."
            subheading="End-to-end trip planning, FMCSA Hours-of-Service automation, and DOT log generation—built for high-performing fleets and solo drivers."
            primaryCTAText="Schedule a Trip"
            secondaryCTAText="View Documentation"
            onPrimaryCTA={handlePrimaryCTA}
            onSecondaryCTA={handleSecondaryCTA}
            imageUrl="https://via.placeholder.com/400x400?text=Freightpilot+Dashboard"
            imageAlt="Freightpilot dashboard interface showing HOS monitoring"
          />
        </section>

        {/* Feature Highlights Section */}
        <section>
          <FeatureHighlights />
        </section>

        {/* Workflow Section */}
        <section>
          <WorkflowSection />
        </section>

        {/* Metrics Section */}
        <section>
          <MetricsSection />
        </section>

        {/* Social Proof Section */}
        <section>
          <SocialProof />
        </section>
      </main>

      {/* Footer */}
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default HomePage;
