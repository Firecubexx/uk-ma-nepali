import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

/**
 * Smart time formatter:
 * - < 1 min  → "just now"
 * - today    → "2:34 PM"
 * - yesterday→ "Yesterday"
 * - < 7 days → "3 days ago"
 * - older    → "12 Jan 2024"
 */
export function formatTime(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now  = new Date();
  const diff = now - date; // ms

  if (diff < 60_000)           return 'just now';
  if (diff < 3_600_000)        return `${Math.floor(diff / 60_000)}m ago`;
  if (isToday(date))           return format(date, 'h:mm a');
  if (isYesterday(date))       return 'Yesterday';
  if (diff < 7 * 86_400_000)  return formatDistanceToNow(date, { addSuffix: true });
  return format(date, 'd MMM yyyy');
}

/**
 * Format a chat timestamp — used in conversation list
 */
export function formatChatTime(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isToday(date))     return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'd/M/yy');
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncate(str = '', max = 100) {
  return str.length <= max ? str : str.slice(0, max).trimEnd() + '…';
}

/**
 * Format price in GBP
 */
export function formatGBP(amount) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(amount);
}

/**
 * Validate email address
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Get initials from full name
 */
export function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Get a consistent colour index from a string (for avatar backgrounds)
 */
export function stringToColourIndex(str = '', total = 12) {
  return [...str].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % total;
}

/**
 * Build FormData from a plain object + optional file fields
 * Usage: buildFormData({ title: 'Hello' }, { image: fileObject })
 */
export function buildFormData(fields = {}, files = {}) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
  Object.entries(files).forEach(([k, file]) => {
    if (Array.isArray(file)) file.forEach((f) => fd.append(k, f));
    else if (file)           fd.append(k, file);
  });
  return fd;
}

/**
 * Readable file size
 */
export function readableSize(bytes) {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1_048_576)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

export function getApiOrigin() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;

    if (host === 'uk-ma-nepali-1.onrender.com') {
      return 'https://uk-ma-nepali-3.onrender.com';
    }
  }

  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) return window.location.origin;

  if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
    return apiUrl.replace(/\/api\/?$/, '');
  }

  return window.location.origin;
}

export function getApiBaseUrl() {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (apiUrl) {
    return apiUrl;
  }

  return `${getApiOrigin()}/api`;
}

export function resolveMediaUrl(src = '') {
  if (!src) return '';
  if (src.startsWith('data:') || src.startsWith('blob:')) return src;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;

  const normalizedSrc = src.startsWith('/') ? src : `/${src}`;
  return `${getApiOrigin()}${normalizedSrc}`;
}
