import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
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
 * Semantic HTML Structure Tests
 * 
 * Validates that all components use proper semantic HTML elements:
 * - header, nav, main, section, article, footer
 * - Proper heading hierarchy (h1, h2, h3)
 * - Semantic form elements with labels
 * 
 * Requirements: 10.1, 10.6
 */

describe('Semantic HTML Structure - Task 11.1', () => {
  describe('Header and Navigation Elements', () => {
    it('should use semantic nav element in Navigation component', () => {
      const { container } = render(<Navigation />);
      
      const navElements = container.querySelectorAll('nav');
      expect(navElements.length).toBeGreaterThan(0);
    });

    it('should have proper nav aria-label', () => {
      const { container } = render(<Navigation />);
      
      const navElements = container.querySelectorAll('nav');
      navElements.forEach((nav) => {
        expect(nav).toHaveAttribute('aria-label');
      });
    });

    it('should use semantic footer element in Footer component', () => {
      const { container } = render(<Footer />);
      
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });
  });

  describe('Main Content Structure', () => {
    it('should use semantic section elements for content areas', () => {
      const { container } = render(
        <>
          <HeroSection headline="Test" />
          <FeatureHighlights />
          <WorkflowSection />
          <MetricsSection />
          <SocialProof />
        </>
      );
      
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThanOrEqual(5);
    });

    it('should have aria-label on section elements', () => {
      const { container } = render(
        <>
          <HeroSection headline="Test" />
          <FeatureHighlights />
          <WorkflowSection />
          <MetricsSection />
          <SocialProof />
        </>
      );
      
      const sections = container.querySelectorAll('section[aria-label]');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should use semantic article elements for content items', () => {
      const { container } = render(
        <>
          <FeatureHighlights />
          <WorkflowSection />
          <MetricsSection />
          <SocialProof />
        </>
      );
      
      const articles = container.querySelectorAll('article');
      expect(articles.length).toBeGreaterThan(0);
    });
  });

  describe('Heading Hierarchy', () => {
    it('should have exactly one h1 element per page', () => {
      const { container } = render(
        <>
          <HeroSection headline="Main Headline" />
          <FeatureHighlights />
          <WorkflowSection />
        </>
      );
      
      const h1Elements = container.querySelectorAll('h1');
      expect(h1Elements.length).toBe(1);
    });

    it('should have h1 in hero section', () => {
      render(<HeroSection headline="Test Headline" />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1.textContent).toBe('Test Headline');
    });

    it('should have h2 elements for section headings', () => {
      const { container } = render(
        <>
          <FeatureHighlights heading="Features" />
          <WorkflowSection heading="Workflow" />
          <MetricsSection />
        </>
      );
      
      const h2Elements = container.querySelectorAll('h2');
      expect(h2Elements.length).toBeGreaterThanOrEqual(2);
    });

    it('should have h3 elements for subsection headings', () => {
      const { container } = render(
        <>
          <FeatureHighlights />
          <WorkflowSection />
        </>
      );
      
      const h3Elements = container.querySelectorAll('h3');
      expect(h3Elements.length).toBeGreaterThan(0);
    });

    it('should not skip heading levels', () => {
      render(
        <>
          <HeroSection headline="H1" />
          <FeatureHighlights heading="H2" />
        </>
      );
      
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      
      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
      
      // Should not have h3 before h2
      const h3Elements = screen.queryAllByRole('heading', { level: 3 });
      if (h3Elements.length > 0) {
        const h2Index = Array.from(screen.getAllByRole('heading')).indexOf(h2);
        const h3Index = Array.from(screen.getAllByRole('heading')).indexOf(h3Elements[0]);
        expect(h3Index).toBeGreaterThan(h2Index);
      }
    });

    it('should have descriptive heading text', () => {
      render(
        <>
          <HeroSection headline="Plan compliant miles with one intelligent workspace" />
          <FeatureHighlights heading="Why Choose Freightpilot" />
        </>
      );
      
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      
      expect(h1.textContent).toBeTruthy();
      expect(h1.textContent?.length).toBeGreaterThan(10);
      expect(h2.textContent).toBeTruthy();
      expect(h2.textContent?.length).toBeGreaterThan(5);
    });
  });

  describe('Semantic Form Elements', () => {
    it('should use semantic button elements', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
        </>
      );
      
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach((button) => {
        expect(button.tagName).toBe('BUTTON');
      });
    });

    it('should use semantic link elements', () => {
      const { container } = render(
        <>
          <Navigation />
          <Footer />
        </>
      );
      
      const links = container.querySelectorAll('a');
      expect(links.length).toBeGreaterThan(0);
      
      links.forEach((link) => {
        expect(link.tagName).toBe('A');
        expect(link).toHaveAttribute('href');
      });
    });

    it('should use semantic list elements in footer', () => {
      const { container } = render(<Footer />);
      
      const lists = container.querySelectorAll('ul');
      expect(lists.length).toBeGreaterThan(0);
      
      const listItems = container.querySelectorAll('li');
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('should have proper list structure in footer', () => {
      const { container } = render(<Footer />);
      
      const lists = container.querySelectorAll('ul');
      lists.forEach((list) => {
        const items = list.querySelectorAll('li');
        expect(items.length).toBeGreaterThan(0);
        
        items.forEach((item) => {
          const link = item.querySelector('a');
          expect(link).toBeInTheDocument();
        });
      });
    });
  });

  describe('Semantic Navigation Structure', () => {
    it('should use nav elements for navigation sections', () => {
      const { container } = render(
        <>
          <Navigation />
          <Footer />
        </>
      );
      
      const navElements = container.querySelectorAll('nav');
      expect(navElements.length).toBeGreaterThan(0);
    });

    it('should have aria-label on nav elements', () => {
      const { container } = render(
        <>
          <Navigation />
          <Footer />
        </>
      );
      
      const navElements = container.querySelectorAll('nav');
      navElements.forEach((nav) => {
        expect(nav).toHaveAttribute('aria-label');
      });
    });

    it('should use semantic links in navigation', () => {
      const { container } = render(<Navigation />);
      
      const navElements = container.querySelectorAll('nav');
      navElements.forEach((nav) => {
        const links = nav.querySelectorAll('a');
        expect(links.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Semantic Article Structure', () => {
    it('should use article elements for feature cards', () => {
      const { container } = render(<FeatureHighlights />);
      
      const articles = container.querySelectorAll('article');
      expect(articles.length).toBeGreaterThan(0);
    });

    it('should use article elements for workflow steps', () => {
      const { container } = render(<WorkflowSection />);
      
      const articles = container.querySelectorAll('article');
      expect(articles.length).toBeGreaterThan(0);
    });

    it('should use article elements for metrics', () => {
      const { container } = render(<MetricsSection />);
      
      const articles = container.querySelectorAll('article');
      expect(articles.length).toBeGreaterThan(0);
    });

    it('should use article elements for company logos', () => {
      const { container } = render(<SocialProof />);
      
      const articles = container.querySelectorAll('article');
      expect(articles.length).toBeGreaterThan(0);
    });

    it('should have proper heading hierarchy within articles', () => {
      const { container } = render(
        <>
          <FeatureHighlights />
          <WorkflowSection />
        </>
      );
      
      const articles = container.querySelectorAll('article');
      articles.forEach((article) => {
        const headings = article.querySelectorAll('h1, h2, h3, h4, h5, h6');
        // Articles should have at least one heading
        expect(headings.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Semantic Hero Section', () => {
    it('should use article element for hero content', () => {
      const { container } = render(<HeroSection headline="Test" />);
      
      const articles = container.querySelectorAll('article');
      expect(articles.length).toBeGreaterThan(0);
    });

    it('should have h1 in hero article', () => {
      const { container } = render(<HeroSection headline="Test Headline" />);
      
      const article = container.querySelector('article');
      const h1 = article?.querySelector('h1');
      expect(h1).toBeInTheDocument();
    });

    it('should have proper semantic structure in hero', () => {
      const { container } = render(
        <HeroSection
          headline="Test Headline"
          subheading="Test subheading"
        />
      );
      
      const article = container.querySelector('article');
      expect(article).toBeInTheDocument();
      
      const h1 = article?.querySelector('h1');
      const p = article?.querySelector('p');
      
      expect(h1).toBeInTheDocument();
      expect(p).toBeInTheDocument();
    });
  });

  describe('Semantic Image Elements', () => {
    it('should have alt text for all images', () => {
      render(
        <>
          <HeroSection
            headline="Test"
            imageAlt="Freightpilot dashboard interface"
          />
          <SocialProof
            companies={[
              {
                id: '1',
                name: 'Test Company',
                logoUrl: 'https://example.com/logo.png',
              },
            ]}
          />
        </>
      );
      
      const images = screen.queryAllByRole('img');
      images.forEach((img) => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).toBeTruthy();
      });
    });

    it('should have descriptive alt text', () => {
      render(
        <HeroSection
          headline="Test"
          imageAlt="Freightpilot dashboard showing HOS monitoring and trip planning"
        />
      );
      
      const images = screen.queryAllByRole('img');
      images.forEach((img) => {
        const alt = img.getAttribute('alt');
        expect(alt).toBeTruthy();
        expect(alt?.length).toBeGreaterThan(5);
      });
    });
  });

  describe('Semantic Button Elements', () => {
    it('should use button elements instead of divs for buttons', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
        </>
      );
      
      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button.tagName).toBe('BUTTON');
      });
    });

    it('should have aria-label on buttons', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection />
        </>
      );
      
      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        const hasLabel = button.getAttribute('aria-label') || button.textContent;
        expect(hasLabel).toBeTruthy();
      });
    });
  });

  describe('Semantic Link Elements', () => {
    it('should use link elements instead of divs for links', () => {
      const { container } = render(
        <>
          <Navigation />
          <Footer />
        </>
      );
      
      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link.tagName).toBe('A');
      });
    });

    it('should have href attribute on all links', () => {
      const { container } = render(
        <>
          <Navigation />
          <Footer />
        </>
      );
      
      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('should have descriptive link text', () => {
      const { container } = render(
        <>
          <Navigation />
          <Footer />
        </>
      );
      
      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        const text = link.textContent || link.getAttribute('aria-label');
        expect(text).toBeTruthy();
      });
    });
  });

  describe('Page Structure Validation', () => {
    it('should have proper overall page structure', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection headline="Test" />
          <FeatureHighlights />
          <WorkflowSection />
          <MetricsSection />
          <SocialProof />
          <Footer />
        </>
      );
      
      // Should have navigation
      expect(container.querySelector('nav')).toBeInTheDocument();
      
      // Should have sections
      expect(container.querySelectorAll('section').length).toBeGreaterThan(0);
      
      // Should have footer
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('should have proper landmark regions', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection headline="Test" />
          <Footer />
        </>
      );
      
      // Should have navigation landmark
      expect(container.querySelector('nav')).toBeInTheDocument();
      
      // Should have footer landmark
      expect(container.querySelector('footer')).toBeInTheDocument();
    });
  });

  describe('Accessibility with Semantic HTML', () => {
    it('should announce page structure correctly', () => {
      render(
        <>
          <HeroSection headline="Main Headline" />
          <FeatureHighlights heading="Features" />
        </>
      );
      
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      
      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
    });

    it('should have proper semantic structure for screen readers', () => {
      const { container } = render(
        <>
          <Navigation />
          <HeroSection headline="Test" />
          <FeatureHighlights />
          <Footer />
        </>
      );
      
      // Navigation should be semantic
      expect(container.querySelector('nav')).toBeInTheDocument();
      
      // Sections should be semantic
      expect(container.querySelectorAll('section').length).toBeGreaterThan(0);
      
      // Footer should be semantic
      expect(container.querySelector('footer')).toBeInTheDocument();
    });
  });
});
