export type MerchImageManifestEntry = {
  category: string
  variations: Record<string, string[]>
}

export type MerchImageManifest = Record<string, MerchImageManifestEntry>

export type MerchImageAliases = Record<string, string | string[]>
