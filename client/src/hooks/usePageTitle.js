import { useEffect } from 'react';

/**
 * usePageTitle — sets the browser tab title
 * Usage: usePageTitle('Feed');  // → "Feed · UK ma Nepali"
 */
export function usePageTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} · UK ma Nepali 🇳🇵` : 'UK ma Nepali 🇳🇵';
    return () => { document.title = prev; };
  }, [title]);
}
