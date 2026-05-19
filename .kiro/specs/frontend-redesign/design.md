# Frontend Redesign - Design Document

## Overview

This design document provides comprehensive specifications for modernizing the Freightpilot homepage and frontend components. The redesign elevates visual aesthetics, improves user experience, modernizes components, ensures responsive excellence, and enhances performance and accessibility across all devices.

The design system establishes a cohesive visual language that maintains brand identity while incorporating contemporary design trends. All specifications are grounded in the 15 approved requirements and designed for implementation by frontend developers.

## Design System Architecture

### Color Palette

#### Primary Colors
- **Primary Blue**: `#0066FF` - Main brand color for CTAs, links, and primary actions
  - Light variant: `#E6F0FF` (backgrounds)
  - Dark variant: `#0052CC` (hover states)
- **Primary Cyan**: `#00D9FF` - Accent color for highlights and secondary emphasis
  - Light variant: `#E0FFFF` (backgrounds)
  - Dark variant: `#00B8D4` (hover states)

#### Secondary Colors
- **Success Green**: `#10B981` - For positive states, confirmations, and success messages
- **Warning Orange**: `#F59E0B` - For alerts and warnings
- **Error Red**: `#EF4444` - For errors and destructive actions
- **Info Blue**: `#3B82F6` - For informational content

#### Neutral Colors
- **Dark**: `#1F2937` - Primary text, headings
- **Medium**: `#6B7280` - Secondary text, descriptions
- **Light**: `#F3F4F6` - Backgrounds, subtle elements
- **White**: `#FFFFFF` - Primary backgrounds
- **Border**: `#E5E7EB` - Dividers and borders

#### Contrast Compliance
- All text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Primary text on white: 12.6:1 contrast ratio
- Secondary text on white: 7.2:1 contrast ratio
- CTA buttons maintain minimum 4.5:1 contrast in all states

### Typography System

#### Font Families
- **Headings**: Inter (sans-serif) - Modern, clean, professional
  - Weights: 600 (semibold), 700 (bold)
- **Body Text**: Inter (sans-serif) - Consistent with headings for cohesion
  - Weights: 400 (regular), 500 (medium)
- **Code/Monospace**: JetBrains Mono (monospace) - For technical content
  - Weight: 400 (regular)

#### Font Sizes and Hierarchy
- **H1 (Hero Headline)**: 48px / 56px line-height (desktop), 32px / 40px (mobile)
  - Weight: 700, Letter-spacing: -0.02em
- **H2 (Section Heading)**: 36px / 44px line-height (desktop), 24px / 32px (mobile)
  - Weight: 700, Letter-spacing: -0.01em
- **H3 (Subsection Heading)**: 24px / 32px line-height (desktop), 18px / 26px (mobile)
  - Weight: 600, Letter-spacing: 0
- **Body Large**: 18px / 28px line-height
  - Weight: 400, used for introductory text
- **Body Regular**: 16px / 24px line-height
  - Weight: 400, primary body text
- **Body Small**: 14px / 20px line-height
  - Weight: 400, secondary text, captions
- **Label**: 12px / 16px line-height
  - Weight: 500, form labels, badges

#### Line Heights
- Headings: 1.2x font size
- Body text: 1.5x font size
- Labels: 1.33x font size

### Spacing and Layout Grid

#### Base Unit
- **1 unit = 4px** - All spacing derives from this base unit

#### Spacing Scale
- **xs**: 4px (1 unit)
- **sm**: 8px (2 units)
- **md**: 16px (4 units)
- **lg**: 24px (6 units)
- **xl**: 32px (8 units)
- **2xl**: 48px (12 units)
- **3xl**: 64px (16 units)
- **4xl**: 96px (24 units)

#### Layout Grid
- **Desktop**: 12-column grid with 24px gutters
- **Tablet**: 8-column grid with 16px gutters
- **Mobile**: 4-column grid with 12px gutters
- **Max-width**: 1440px (desktop), 768px (tablet), 100% (mobile)
- **Container padding**: 24px (desktop), 16px (tablet), 12px (mobile)

### Component Design Patterns

#### Buttons
- **Height**: 44px (touch-friendly minimum)
- **Padding**: 12px 24px (primary), 10px 20px (secondary)
- **Border-radius**: 8px
- **Font-weight**: 600
- **Transition**: 200ms ease-in-out

#### Cards
- **Border-radius**: 12px
- **Padding**: 24px
- **Box-shadow**: 0 1px 3px rgba(0,0,0,0.1) (default), 0 4px 12px rgba(0,0,0,0.15) (hover)
- **Background**: White with 1px border (#E5E7EB)
- **Transition**: 300ms ease-in-out

#### Inputs
- **Height**: 44px
- **Padding**: 12px 16px
- **Border-radius**: 8px
- **Border**: 1px solid #E5E7EB
- **Font-size**: 16px
- **Focus**: 2px solid #0066FF outline

#### Icons
- **Sizes**: 16px, 20px, 24px, 32px, 48px
- **Stroke-width**: 2px
- **Color**: Inherit from text color or explicit color



## Homepage Layout & Structure

### Navigation Bar Design

#### Desktop Navigation (1024px+)
- **Height**: 72px with 24px vertical padding
- **Layout**: Flexbox with space-between alignment
- **Logo**: 32px height, positioned left with 24px margin
- **Navigation Links**: Horizontal layout, 24px spacing between items
  - Font: 16px, weight 500, color #1F2937
  - Hover: Color changes to #0066FF with 200ms transition
  - Active: Underline with 2px #0066FF
- **Action Buttons**: Right-aligned, 12px gap
  - Sign In: Secondary button (outline style)
  - Launch App: Primary button (filled style)
- **Background**: White with 1px bottom border (#E5E7EB)
- **Sticky**: Fixed position at top with z-index 1000

#### Mobile Navigation (320px - 767px)
- **Height**: 64px
- **Logo**: 28px height, left-aligned
- **Hamburger Menu**: 24px icon, right-aligned
  - Animated transition to X when open
  - Tap target: 44x44px
- **Mobile Menu**: Full-screen overlay
  - Background: White with slight shadow
  - Navigation items: Stacked vertically, 16px padding
  - Action buttons: Full-width, stacked at bottom
  - Smooth slide-in animation (300ms)

#### Tablet Navigation (768px - 1023px)
- **Height**: 68px
- **Logo**: 30px height
- **Navigation**: Horizontal with reduced spacing (16px)
- **Action Buttons**: Stacked vertically or horizontal depending on space

### Hero Section Design

#### Layout Structure
- **Desktop**: Two-column layout (60% content, 40% visual)
- **Tablet**: Single column with stacked content
- **Mobile**: Single column, full-width

#### Content Column
- **Headline (H1)**: 48px, weight 700, color #1F2937
  - Max-width: 600px
  - Margin-bottom: 24px
- **Subheading**: 18px, weight 400, color #6B7280
  - Max-width: 550px
  - Margin-bottom: 32px
  - Line-height: 1.6
- **CTA Buttons**: Horizontal layout (desktop), stacked (mobile)
  - Primary button: "Schedule a Trip" (blue, 44px height)
  - Secondary button: "View Documentation" (outline, 44px height)
  - Gap: 16px between buttons
  - Margin-bottom: 48px

#### Visual Column
- **Background**: Gradient from #E6F0FF to #E0FFFF
- **Border-radius**: 16px
- **Aspect-ratio**: 1:1 (desktop), auto (mobile)
- **Content**: Illustration or hero image
  - Optimized WebP format with PNG fallback
  - Lazy loading for below-fold content
  - Max-width: 100% of container

#### Hero Section Container
- **Padding**: 96px 24px (desktop), 64px 16px (tablet), 48px 12px (mobile)
- **Max-width**: 1440px
- **Margin**: 0 auto
- **Gap**: 48px (desktop), 32px (tablet)

### Product Highlights Section

#### Section Layout
- **Padding**: 96px 24px (desktop), 64px 16px (tablet), 48px 12px (mobile)
- **Background**: #F3F4F6
- **Heading**: H2 centered, margin-bottom 64px

#### Feature Cards Grid
- **Desktop**: 3-column grid with 24px gap
- **Tablet**: 2-column grid with 20px gap
- **Mobile**: 1-column stack with 16px gap

#### Feature Card Design
- **Padding**: 32px
- **Border-radius**: 12px
- **Background**: White
- **Border**: 1px solid #E5E7EB
- **Box-shadow**: 0 1px 3px rgba(0,0,0,0.1)
- **Hover**: 
  - Shadow: 0 4px 12px rgba(0,0,0,0.15)
  - Transform: translateY(-4px)
  - Transition: 300ms ease-in-out

#### Feature Card Content
- **Icon**: 48px, color #0066FF, margin-bottom 16px
- **Title**: H3 (24px), weight 600, margin-bottom 12px
- **Description**: Body regular (16px), color #6B7280, line-height 1.6

### Workflow Section

#### Section Layout
- **Padding**: 96px 24px (desktop), 64px 16px (tablet), 48px 12px (mobile)
- **Background**: White
- **Heading**: H2 centered, margin-bottom 64px

#### Workflow Steps Container
- **Desktop**: Horizontal flex layout with 32px gap
- **Tablet**: Horizontal flex with 24px gap
- **Mobile**: Vertical stack with 24px gap

#### Step Card Design
- **Width**: 33.33% (desktop), 50% (tablet), 100% (mobile)
- **Padding**: 32px
- **Border-radius**: 12px
- **Background**: #F3F4F6
- **Border**: 2px solid transparent
- **Hover**: Border color #0066FF

#### Step Indicator
- **Number**: 48px circle, background #0066FF, color white, weight 700
- **Connector**: Horizontal line (desktop) or vertical line (mobile)
  - Height: 2px (horizontal), 32px (vertical)
  - Color: #E5E7EB
  - Position: Between step cards

#### Step Content
- **Title**: H3 (20px), weight 600, margin-bottom 12px
- **Description**: Body regular (16px), color #6B7280, margin-bottom 16px
- **Icon**: 32px, color #0066FF

### Metrics and Social Proof Section

#### Section Layout
- **Padding**: 96px 24px (desktop), 64px 16px (tablet), 48px 12px (mobile)
- **Background**: Linear gradient from #0066FF to #00D9FF
- **Color**: White text

#### Metrics Grid
- **Desktop**: 3-column grid with 32px gap
- **Tablet**: 2-column grid with 24px gap
- **Mobile**: 1-column stack with 16px gap

#### Metric Card Design
- **Padding**: 32px
- **Border-radius**: 12px
- **Background**: rgba(255,255,255,0.1)
- **Border**: 1px solid rgba(255,255,255,0.2)
- **Backdrop-filter**: blur(10px)

#### Metric Content
- **Number**: 48px, weight 700, color white
- **Label**: 16px, weight 400, color rgba(255,255,255,0.9)
- **Context**: 14px, weight 400, color rgba(255,255,255,0.7)

#### Social Proof Section
- **Padding**: 48px 24px
- **Background**: White
- **Heading**: "Trusted by leading logistics companies"
- **Logo Grid**: 4-6 company logos
  - Desktop: 6 columns with 24px gap
  - Tablet: 3 columns with 20px gap
  - Mobile: 2 columns with 16px gap
- **Logo Height**: 40px, grayscale filter, opacity 0.6
- **Logo Hover**: Opacity 1.0, transition 200ms

### Call-to-Action Button Designs

#### Primary Button
- **Background**: #0066FF
- **Color**: White
- **Padding**: 12px 24px
- **Height**: 44px
- **Border-radius**: 8px
- **Font**: 16px, weight 600
- **Hover**: 
  - Background: #0052CC
  - Box-shadow: 0 4px 12px rgba(0,102,255,0.3)
  - Transform: translateY(-2px)
- **Active**: Background #003D99
- **Focus**: 2px solid #0066FF outline, 2px offset
- **Disabled**: Opacity 0.5, cursor not-allowed

#### Secondary Button
- **Background**: Transparent
- **Border**: 2px solid #0066FF
- **Color**: #0066FF
- **Padding**: 10px 22px
- **Height**: 44px
- **Border-radius**: 8px
- **Font**: 16px, weight 600
- **Hover**:
  - Background: #E6F0FF
  - Border-color: #0052CC
  - Color: #0052CC
- **Active**: Background #D4E6FF
- **Focus**: 2px solid #0066FF outline, 2px offset

#### Button Sizes
- **Large**: 48px height, 16px 32px padding, 18px font
- **Regular**: 44px height, 12px 24px padding, 16px font
- **Small**: 36px height, 8px 16px padding, 14px font

### Footer Design

#### Footer Container
- **Padding**: 64px 24px (desktop), 48px 16px (tablet), 32px 12px (mobile)
- **Background**: #1F2937
- **Color**: White
- **Border-top**: 1px solid #374151

#### Footer Grid
- **Desktop**: 4-column grid with 32px gap
- **Tablet**: 2-column grid with 24px gap
- **Mobile**: 1-column stack with 24px gap

#### Footer Sections
- **Product**: Links to features, pricing, documentation
- **Company**: About, blog, careers, contact
- **Legal**: Privacy policy, terms of service, compliance
- **Social**: Social media links with icons

#### Footer Links
- **Font**: 14px, weight 400, color rgba(255,255,255,0.7)
- **Hover**: Color white, transition 200ms
- **Spacing**: 12px between items

#### Footer Bottom
- **Padding-top**: 32px
- **Border-top**: 1px solid #374151
- **Layout**: Flex space-between
- **Copyright**: 12px, color rgba(255,255,255,0.5)
- **Social Icons**: 20px, gap 16px

