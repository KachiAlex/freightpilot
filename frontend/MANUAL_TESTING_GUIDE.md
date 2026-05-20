# Manual Testing Guide

## Task 17.3: Manual Accessibility Testing

### Keyboard Navigation Testing
1. **Tab Navigation**
   - Press Tab to navigate through all interactive elements
   - Verify focus moves in logical order: Navigation → Hero CTAs → Feature cards → Workflow steps → Metrics → Footer links
   - Ensure all buttons, links, and form controls are reachable via keyboard
   - Check that focus indicators are visible (2px outline with 2px offset)

2. **Keyboard Shortcuts**
   - Test Enter/Space to activate buttons
   - Test Escape to close mobile menu (if open)
   - Test arrow keys within navigation menu
   - Verify Home/End keys work in scrollable areas

3. **Focus Management**
   - Verify focus is trapped in modals (if any)
   - Check that focus returns to trigger after closing modals
   - Ensure focus is visible on all interactive elements
   - Test focus with reduced-motion preference enabled

### Screen Reader Testing (NVDA/JAWS)
1. **Semantic Structure**
   - Navigate by headings (H key in NVDA)
   - Verify heading hierarchy is logical (H1 → H2 → H3)
   - Navigate by landmarks (regions, navigation, main, footer)
   - Check that all images have descriptive alt text

2. **Interactive Elements**
   - Verify all buttons have accessible names
   - Check that links have descriptive text (not "click here")
   - Ensure form fields have associated labels
   - Test that ARIA labels are announced correctly

3. **Dynamic Content**
   - Verify announcements for dynamic changes
   - Check that error messages are announced
   - Test that loading states are communicated
   - Ensure status updates are announced

### Visual Accessibility Testing
1. **Color Contrast**
   - Test with Chrome DevTools contrast checker
   - Verify all text meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
   - Check focus indicators have minimum 3:1 contrast
   - Test with color blindness simulators

2. **Text Scaling**
   - Test at 200% zoom
   - Verify layout doesn't break
   - Check that text remains readable
   - Ensure no horizontal scrolling at 400% zoom

3. **Reduced Motion**
   - Enable prefers-reduced-motion in OS settings
   - Verify animations are disabled or reduced
   - Check that functionality remains intact
   - Test smooth scroll behavior is disabled

### Mobile Accessibility
1. **Touch Targets**
   - Verify all touch targets are minimum 44x44px
   - Test with different finger sizes
   - Check spacing between interactive elements
   - Ensure no accidental activations

2. **Screen Rotation**
   - Test in portrait and landscape
   - Verify layout adapts correctly
   - Check that content remains accessible
   - Test keyboard navigation in both orientations

---

## Task 17.4: Cross-Browser Manual Testing

### Browser Testing Checklist

#### Chrome (Latest)
- [ ] Homepage loads correctly
- [ ] All sections display properly
- [ ] Animations play smoothly
- [ ] Navigation works (desktop and mobile)
- [ ] Forms submit correctly
- [ ] Links navigate to correct sections
- [ ] Images load with proper alt text
- [ ] Responsive design works at all breakpoints
- [ ] Console shows no errors

#### Firefox (Latest)
- [ ] Homepage loads correctly
- [ ] All sections display properly
- [ ] Animations play smoothly
- [ ] Navigation works (desktop and mobile)
- [ ] Forms submit correctly
- [ ] Links navigate to correct sections
- [ ] Images load with proper alt text
- [ ] Responsive design works at all breakpoints
- [ ] Console shows no errors

#### Safari (macOS/iOS)
- [ ] Homepage loads correctly
- [ ] All sections display properly
- [ ] Animations play smoothly
- [ ] Navigation works (desktop and mobile)
- [ ] Forms submit correctly
- [ ] Links navigate to correct sections
- [ ] Images load with proper alt text
- [ ] Responsive design works at all breakpoints
- [ ] Console shows no errors

#### Edge (Latest)
- [ ] Homepage loads correctly
- [ ] All sections display properly
- [ ] Animations play smoothly
- [ ] Navigation works (desktop and mobile)
- [ ] Forms submit correctly
- [ ] Links navigate to correct sections
- [ ] Images load with proper alt text
- [ ] Responsive design works at all breakpoints
- [ ] Console shows no errors

### Responsive Breakpoints
- **Mobile (320px - 767px)**
  - Navigation collapses to hamburger menu
  - Single column layout for all sections
  - Touch-friendly spacing
  - Readable text sizes

- **Tablet (768px - 1023px)**
  - Navigation adapts to tablet layout
  - Two-column grid for features/metrics
  - Optimized spacing and sizing

- **Desktop (1024px+)**
  - Full navigation menu visible
  - Three-column grid for features/metrics
  - Optimal use of screen space

### Feature-Specific Testing
1. **Navigation**
   - Logo links to home
   - Mobile menu opens/closes correctly
   - Anchor links scroll to sections
   - Active state indicators work

2. **Hero Section**
   - CTA buttons function correctly
   - Image loads and displays
   - Text is readable at all sizes
   - Animations play on load

3. **Feature Highlights**
   - Cards display correctly
   - Hover effects work
   - Icons render properly
   - Grid layout adapts

4. **Workflow Section**
   - Steps display in correct order
   - Connectors render properly
   - Responsive layout works
   - Animations play smoothly

5. **Metrics Section**
   - Glassmorphism effect displays
   - Numbers are readable
   - Gradient background renders
   - Cards align correctly

6. **Social Proof**
   - Company logos load
   - Hover effects work
   - Grid layout adapts
   - Grayscale filter applies

7. **Footer**
   - Links navigate correctly
   - Social links open in new tabs
   - Layout adapts responsively
   - Copyright displays

---

## Testing Tools

### Accessibility Tools
- **Chrome DevTools**: Lighthouse accessibility audit
- **axe DevTools**: Detailed accessibility scanning
- **WAVE**: Visual accessibility feedback
- **NVDA/JAWS**: Screen reader testing
- **Color Contrast Analyzer**: Contrast verification

### Browser Testing Tools
- **BrowserStack**: Cross-browser testing platform
- **LambdaTest**: Browser compatibility testing
- **Chrome DevTools Device Mode**: Responsive testing
- **Firefox Responsive Design Mode**: Mobile simulation

### Performance Tools
- **Lighthouse**: Performance auditing
- **WebPageTest**: Detailed performance analysis
- **Chrome DevTools Performance**: Runtime profiling
- **Network throttling**: Slow connection simulation

---

## Reporting Issues

When reporting issues, include:
1. Browser name and version
2. Operating system
3. Screen resolution
4. Steps to reproduce
5. Expected behavior
6. Actual behavior
7. Screenshots or screen recordings
8. Console errors (if any)
