import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook for managing keyboard navigation in interactive components
 * 
 * Features:
 * - Trap focus within a container (for modals/menus)
 * - Handle Escape key to close modals/menus
 * - Manage focus restoration after closing
 * - Support for arrow key navigation
 * 
 * @example
 * const { containerRef, isOpen } = useKeyboardNavigation({
 *   onEscape: () => setIsOpen(false),
 *   trapFocus: true,
 * });
 */

interface UseKeyboardNavigationOptions {
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  trapFocus?: boolean;
  isOpen?: boolean;
}

export const useKeyboardNavigation = (options: UseKeyboardNavigationOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Escape key
      if (e.key === 'Escape' && options.onEscape) {
        e.preventDefault();
        options.onEscape();
        return;
      }

      // Arrow keys
      if (e.key === 'ArrowUp' && options.onArrowUp) {
        e.preventDefault();
        options.onArrowUp();
        return;
      }

      if (e.key === 'ArrowDown' && options.onArrowDown) {
        e.preventDefault();
        options.onArrowDown();
        return;
      }

      if (e.key === 'ArrowLeft' && options.onArrowLeft) {
        e.preventDefault();
        options.onArrowLeft();
        return;
      }

      if (e.key === 'ArrowRight' && options.onArrowRight) {
        e.preventDefault();
        options.onArrowRight();
        return;
      }

      // Tab key - trap focus if enabled
      if (e.key === 'Tab' && options.trapFocus && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        const activeElement = document.activeElement as HTMLElement;

        // Shift+Tab - move to previous element
        if (e.shiftKey) {
          if (activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab - move to next element
          if (activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [options]
  );

  // Set up event listeners
  useEffect(() => {
    if (options.isOpen === false) return;

    // Store the currently focused element so we can restore it later
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyDown);

    // Focus the first focusable element in the container
    if (options.trapFocus && containerRef.current) {
      const firstFocusable = containerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;

      if (firstFocusable) {
        setTimeout(() => firstFocusable.focus(), 0);
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to the previously focused element
      if (previousActiveElementRef.current && previousActiveElementRef.current.focus) {
        setTimeout(() => previousActiveElementRef.current?.focus(), 0);
      }
    };
  }, [handleKeyDown, options.isOpen, options.trapFocus]);

  return { containerRef, previousActiveElementRef };
};

export default useKeyboardNavigation;
