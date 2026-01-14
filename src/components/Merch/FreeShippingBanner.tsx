interface FreeShippingBannerProps {
  className?: string
}

export const FreeShippingBanner = ({ className = '' }: FreeShippingBannerProps) => {
  return (
    <div className={`bg-red-600 text-white h-[32px] flex justify-center items-center px-4 ${className}`}>
      <span className="text-sm md:text-base font-medium tracking-[0.15em]">
        Free shipping on orders over $50
      </span>
    </div>
  )
}
