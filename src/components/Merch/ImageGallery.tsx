import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageGalleryProps {
  images: string[]
  alt: string
}

const FALLBACK_IMAGE = '/images/placeholder.jpg'

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})

  useEffect(() => {
    setSelectedIndex(0)
    setImageErrors({})
  }, [images])

  const displayImages = images.length > 0 ? images.slice(0, 10) : [FALLBACK_IMAGE]
  const safeSelectedIndex = Math.min(selectedIndex, displayImages.length - 1)
  const selectedImage = imageErrors[safeSelectedIndex] ? FALLBACK_IMAGE : displayImages[safeSelectedIndex]

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)
  }

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % displayImages.length)
  }

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }))
  }

  return (
    <>
      <div className="store-v2-gallery">
        <div className="store-v2-gallery__stage">
          <img
            src={selectedImage}
            alt={alt}
            onClick={() => setLightboxOpen(true)}
            className="store-v2-gallery__stage-image"
            onError={() => handleImageError(safeSelectedIndex)}
          />

          {displayImages.length > 1 ? (
            <>
              <button
                type="button"
                onClick={handlePrevious}
                className="store-v2-gallery__nav store-v2-gallery__nav--prev"
                aria-label="Previous image"
              >
                <iconify-icon icon="solar:alt-arrow-left-linear" width="18" height="18"></iconify-icon>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="store-v2-gallery__nav store-v2-gallery__nav--next"
                aria-label="Next image"
              >
                <iconify-icon icon="solar:alt-arrow-right-linear" width="18" height="18"></iconify-icon>
              </button>
            </>
          ) : null}

          <div className="store-v2-gallery__counter">
            {safeSelectedIndex + 1}/{displayImages.length}
          </div>
        </div>

        {displayImages.length > 1 ? (
          <div className="store-v2-gallery__thumb-row">
            {displayImages.map((image, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`store-v2-gallery__thumb ${safeSelectedIndex === index ? 'store-v2-gallery__thumb--active' : ''}`}
                aria-label={`View image ${index + 1}`}
              >
                <img
                  src={imageErrors[index] ? FALLBACK_IMAGE : image}
                  alt={`${alt} ${index + 1}`}
                  className="h-full w-full rounded-[inherit] object-cover"
                  onError={() => handleImageError(index)}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {lightboxOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="store-v2-gallery__lightbox"
            onClick={() => setLightboxOpen(false)}
          >
            <div className="store-v2-gallery__lightbox-frame" onClick={(event) => event.stopPropagation()}>
              <img src={selectedImage} alt={alt} className="store-v2-gallery__lightbox-image" />

              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="store-v2-gallery__nav store-v2-gallery__nav--close"
                aria-label="Close gallery"
              >
                <iconify-icon icon="solar:close-circle-linear" width="24" height="24"></iconify-icon>
              </button>

              {displayImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      handlePrevious()
                    }}
                    className="store-v2-gallery__nav store-v2-gallery__nav--prev"
                    aria-label="Previous image"
                  >
                    <iconify-icon icon="solar:alt-arrow-left-linear" width="24" height="24"></iconify-icon>
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleNext()
                    }}
                    className="store-v2-gallery__nav store-v2-gallery__nav--next"
                    aria-label="Next image"
                  >
                    <iconify-icon icon="solar:alt-arrow-right-linear" width="24" height="24"></iconify-icon>
                  </button>
                </>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
