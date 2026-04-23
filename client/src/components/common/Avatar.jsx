import { useState } from 'react';
import { resolveMediaUrl } from '../../utils/helpers';

const SIZES = {
  xs:   'w-8 h-8 text-xs',
  sm:   'w-10 h-10 text-sm',
  md:   'w-12 h-12 text-base',
  lg:   'w-16 h-16 text-xl',
  xl:   'w-24 h-24 text-3xl',
  '2xl':'w-32 h-32 text-4xl',
};

const DOT_SIZES = {
  xs:   'w-2 h-2',
  sm:   'w-2.5 h-2.5 border',
  md:   'w-3 h-3 border-2',
  lg:   'w-3.5 h-3.5 border-2',
  xl:   'w-4 h-4 border-2',
  '2xl':'w-5 h-5 border-2',
};

const PALETTE = [
  'bg-red-400','bg-orange-400','bg-amber-400','bg-lime-500',
  'bg-emerald-400','bg-teal-400','bg-cyan-400','bg-blue-400',
  'bg-indigo-400','bg-violet-400','bg-purple-400','bg-pink-400',
];

/**
 * Avatar — user avatar with image, fallback initials, and online dot.
 */
export default function Avatar({ src, name = '?', size = 'md', className = '', online = false }) {
  const [imgError, setImgError] = useState(false);

  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  const colorClass = PALETTE[(name.charCodeAt(0) || 0) % PALETTE.length];
  const imageSrc = resolveMediaUrl(src);
  const showImage  = imageSrc && !imgError;

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {showImage ? (
        <img
          src={imageSrc}
          alt={name}
          onError={() => setImgError(true)}
          className={`${SIZES[size]} rounded-full object-cover ring-2 ring-white dark:ring-gray-900 bg-gray-100`}
        />
      ) : (
        <div className={`${SIZES[size]} ${colorClass} rounded-full flex items-center justify-center font-bold text-white ring-2 ring-white dark:ring-gray-900 select-none`}>
          {initials}
        </div>
      )}

      {online && (
        <span className={`absolute bottom-0 right-0 ${DOT_SIZES[size]} rounded-full bg-green-400 border-white dark:border-gray-900`} />
      )}
    </div>
  );
}
