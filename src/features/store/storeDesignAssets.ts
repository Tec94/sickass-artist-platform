export const STORE_DESIGN_HERO_IMAGE = new URL('../../../images/generated-1773896624768.png', import.meta.url).href

export const STORE_DESIGN_PRODUCT_IMAGES = [
  new URL('../../../images/generated-1773896644095.png', import.meta.url).href,
  new URL('../../../images/generated-1773896660228.png', import.meta.url).href,
  new URL('../../../images/generated-1773896673245.png', import.meta.url).href,
]

export function getStoreDesignImage(index: number) {
  return STORE_DESIGN_PRODUCT_IMAGES[index % STORE_DESIGN_PRODUCT_IMAGES.length]
}
