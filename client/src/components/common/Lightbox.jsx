import { useEffect, useState } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import { resolveMediaUrl } from '../../utils/helpers';

/**
 * Lightbox — full-screen image viewer
 * Props:
 *   images: string[]   – array of image URLs
 *   startIndex: number – which image to open on
 *   onClose: () => void
 */
export default function Lightbox({ images, startIndex = 0, onClose }) {
  const [index, setIndex]   = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, images.length - 1));
      if (e.key === 'ArrowLeft')  setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images.length, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!images?.length) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all z-10"
      >
        <FiX size={22} />
      </button>

      {/* Zoom toggle */}
      <button
        onClick={() => setZoomed((z) => !z)}
        className="absolute top-4 right-16 text-white/80 hover:text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all z-10"
      >
        {zoomed ? <FiZoomOut size={20} /> : <FiZoomIn size={20} />}
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/40 px-3 py-1 rounded-full">
          {index + 1} / {images.length}
        </div>
      )}

      {/* Image */}
      <div
        className={`flex items-center justify-center w-full h-full p-4 ${zoomed ? 'overflow-auto' : 'overflow-hidden'}`}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <img
          src={resolveMediaUrl(images[index])}
          alt={`Image ${index + 1}`}
          className={`rounded-xl shadow-2xl transition-transform duration-200 ${
            zoomed
              ? 'max-w-none max-h-none w-auto h-auto cursor-zoom-out'
              : 'max-w-full max-h-full object-contain cursor-zoom-in'
          }`}
          onClick={() => setZoomed((z) => !z)}
          draggable={false}
        />
      </div>

      {/* Prev button */}
      {index > 0 && (
        <button
          onClick={() => setIndex((i) => i - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
        >
          <FiChevronLeft size={24} />
        </button>
      )}

      {/* Next button */}
      {index < images.length - 1 && (
        <button
          onClick={() => setIndex((i) => i + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
        >
          <FiChevronRight size={24} />
        </button>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-12 h-12 rounded-lg overflow-hidden transition-all ${
                i === index ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-80'
              }`}
            >
              <img src={resolveMediaUrl(img)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
