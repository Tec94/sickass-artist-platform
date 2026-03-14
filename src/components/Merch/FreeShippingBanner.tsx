interface FreeShippingBannerProps {
  className?: string
}

export const FreeShippingBanner = ({ className = '' }: FreeShippingBannerProps) => {
  return (
    <div className={`border-y border-rose-300/30 bg-gradient-to-r from-[#5F1923] via-[#8A2633] to-[#5F1923] text-white h-[36px] flex justify-center items-center px-4 ${className}`}>
      <span className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold uppercase tracking-[0.16em]">
        <iconify-icon icon="solar:truck-linear" width="14" height="14"></iconify-icon>
        Free shipping on orders over $50
      </span>
    </div>
  )
}
