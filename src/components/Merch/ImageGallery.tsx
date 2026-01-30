import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageGalleryProps {
  images: string[]
  alt: string
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})

  useEffect(() => {
    setSelectedIndex(0)
    setImageErrors({})
  }, [images])

  const displayImages = images.slice(0, 10) // Max 10 images
  const selectedImage = imageErrors[selectedIndex]
    ? '/images/placeholder.jpg'
    : displayImages[selectedIndex]

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)
  }

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % displayImages.length)
  }

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }))
  }

  return (
    <>
      {/* Main image */}
      <div className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden group">
        <img
          src={selectedImage}
          alt={alt}
          onClick={() => setLightboxOpen(true)}
          className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
          onError={() => handleImageError(selectedIndex)}
        />

        {/* Navigation arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/75 rounded-full text-white transition-colors"
            >
              <iconify-icon icon="solar:alt-arrow-left-linear" width="20" height="20"></iconify-icon>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/75 rounded-full text-white transition-colors"
            >
              <iconify-icon icon="solar:alt-arrow-right-linear" width="20" height="20"></iconify-icon>
            </button>
          </>
        )}

        {/* Image counter */}
        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded">
          {selectedIndex + 1}/{displayImages.length}
        </div>
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded border-2 transition-colors ${
                selectedIndex === index
                  ? 'border-cyan-500'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <img
                src={imageErrors[index] ? '/images/placeholder.jpg' : image}
                alt={`${alt} ${index + 1}`}
                className="w-full h-full object-cover rounded"
                onError={() => handleImageError(index)}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <div className="relative max-w-4xl w-full h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
              <img src={selectedImage} alt={alt} className="max-w-full max-h-full object-contain" />

              {/* Close button */}
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/75 rounded-full text-white transition-colors"
              >
                <iconify-icon icon="solar:close-circle-linear" width="24" height="24"></iconify-icon>
              </button>

              {/* Lightbox navigation */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePrevious()
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/75 rounded-full text-white transition-colors"
                  >
                    <iconify-icon icon="solar:alt-arrow-left-linear" width="24" height="24"></iconify-icon>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNext()
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/75 rounded-full text-white transition-colors"
                  >
                    <iconify-icon icon="solar:alt-arrow-right-linear" width="24" height="24"></iconify-icon>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
