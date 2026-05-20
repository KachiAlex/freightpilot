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
 * The main landing page with modern dark theme design.
 * Features responsive design across mobile, tablet, and desktop viewports.
 * 
 * Layout:
 * - Navigation (fixed at top)
 * - Hero Section with gradient background
 * - Feature Highlights with glassmorphism cards
 * - Workflow Section with step indicators
 * - Metrics Section with animated counters
 * - Social Proof with company logos
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
    <div className="relative min-h-screen bg-[#02040d] text-white overflow-hidden">
      {/* Background gradient effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 top-[-10%] h-96 w-96 rounded-full bg-sky/30 blur-[140px]" />
        <div className="absolute left-0 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-horizon/20 blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
      </div>

      {/* Header with Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <Navigation />
      </header>

      {/* Main content with top padding to account for fixed navigation */}
      <main className="relative z-10 pt-20 md:pt-24">
        {/* Hero Section */}
        <section className="px-4 md:px-8 py-16 md:py-24">
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
        <section id="product" className="px-4 md:px-8 py-16 md:py-24">
          <FeatureHighlights />
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="px-4 md:px-8 py-16 md:py-24">
          <WorkflowSection />
        </section>

        {/* Metrics Section */}
        <section id="compliance" className="px-4 md:px-8 py-16 md:py-24">
          <MetricsSection />
        </section>

        {/* Social Proof Section */}
        <section className="px-4 md:px-8 py-16 md:py-24">
          <SocialProof />
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10">
        <Footer />
      </footer>
    </div>
  );
};

export default HomePage;
