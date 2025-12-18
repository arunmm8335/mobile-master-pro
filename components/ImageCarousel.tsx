import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Play } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  title?: string;
  className?: string;
  showThumbnails?: boolean;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  title,
  className = '',
  showThumbnails = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center">
          <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-500 dark:text-slate-400">No images available</p>
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const isVideo = (url: string) => {
    const u = (url || '').toLowerCase();
    if (u.includes('/video/upload/')) return true; // Cloudinary video URLs
    return u.endsWith('.mp4') || u.endsWith('.mov') || u.endsWith('.avi') || u.includes('.mp4?') || u.includes('.mov?') || u.includes('.avi?');
  };

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className={`relative bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden ${className}`}>
        {isVideo(images[currentIndex]) ? (
          <video
            src={images[currentIndex]}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            src={images[currentIndex]}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="w-full h-full object-contain"
          />
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-shrink-0 relative rounded-lg border-2 overflow-hidden transition-all ${
                currentIndex === idx
                  ? 'border-blue-500 ring-2 ring-blue-300 dark:ring-blue-700'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              {isVideo(img) ? (
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <Play className="h-6 w-6 text-slate-400" />
                </div>
              ) : (
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-20 h-20 object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
