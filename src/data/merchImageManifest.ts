export const merchImageManifest = {
  "jacket1": {
    "category": "jackets",
    "variations": {
      "1": [
        "/merch/jackets/jacket1/jacket1-1-1.png",
        "/merch/jackets/jacket1/jacket1-2-1.png",
        "/merch/jackets/jacket1/jacket1-3-1.png",
        "/merch/jackets/jacket1/jacket1-4-1.png"
      ]
    }
  },
  "jacket2": {
    "category": "jackets",
    "variations": {
      "1": [
        "/merch/jackets/jacket2/jacket2-1-1.png",
        "/merch/jackets/jacket2/jacket2-2-1.png",
        "/merch/jackets/jacket2/jacket2-3-1.png",
        "/merch/jackets/jacket2/jacket2-4-1.png"
      ]
    }
  },
  "jacket3": {
    "category": "jackets",
    "variations": {
      "1": [
        "/merch/jackets/jacket3/jacket3-1-1.png",
        "/merch/jackets/jacket3/jacket3-2-1.png",
        "/merch/jackets/jacket3/jacket3-3-1.png",
        "/merch/jackets/jacket3/jacket3-4-1.png"
      ]
    }
  },
  "jacket4": {
    "category": "jackets",
    "variations": {
      "1": [
        "/merch/jackets/jacket4/jacket4-1-1.png",
        "/merch/jackets/jacket4/jacket4-2-1.png",
        "/merch/jackets/jacket4/jacket4-3-1.png"
      ]
    }
  },
  "jeans1": {
    "category": "jeans",
    "variations": {
      "1": [
        "/merch/jeans/jeans1/jeans1-1-1.jpeg",
        "/merch/jeans/jeans1/jeans1-2-1.jpeg"
      ]
    }
  },
  "jeans2": {
    "category": "jeans",
    "variations": {
      "1": [
        "/merch/jeans/jeans2/jeans2-1-1.jpeg",
        "/merch/jeans/jeans2/jeans2-2-1.jpeg"
      ]
    }
  },
  "jeans3": {
    "category": "jeans",
    "variations": {
      "1": [
        "/merch/jeans/jeans3/jeans3-1-1.jpeg",
        "/merch/jeans/jeans3/jeans3-2-1.jpeg"
      ]
    }
  },
  "disk1": {
    "category": "music",
    "variations": {
      "1": [
        "/merch/music/disk1/disk1-1-1.jpeg"
      ]
    }
  },
  "disk2": {
    "category": "music",
    "variations": {
      "1": [
        "/merch/music/disk2/disk2-1-1.jpeg"
      ]
    }
  },
  "poster1": {
    "category": "posters",
    "variations": {
      "1": [
        "/merch/posters/poster1/poster1-1-1.jpeg"
      ]
    }
  },
  "poster2": {
    "category": "posters",
    "variations": {
      "1": [
        "/merch/posters/poster2/poster2-1-1.jpeg"
      ]
    }
  },
  "shirt1": {
    "category": "shirts",
    "variations": {
      "1": [
        "/merch/shirts/shirt1/shirt1-1-1.jpeg",
        "/merch/shirts/shirt1/shirt1-2-1.jpeg",
        "/merch/shirts/shirt1/shirt1-3-1.jpeg",
        "/merch/shirts/shirt1/shirt1-4-1.jpeg"
      ]
    }
  },
  "shirt2": {
    "category": "shirts",
    "variations": {
      "1": [
        "/merch/shirts/shirt2/shirt2-1-1.jpeg",
        "/merch/shirts/shirt2/shirt2-2-1.jpeg",
        "/merch/shirts/shirt2/shirt2-3-1.jpeg",
        "/merch/shirts/shirt2/shirt2-4-1.jpeg"
      ]
    }
  }
} as const;

export const merchImageAliases = {
  "private-suit-varsity-jacket": [
    "jacket1",
    "jacket2"
  ],
  "wolfpack-bomber-jacket": [
    "jacket1",
    "jacket2"
  ],
  "windbreaker": [
    "jacket3",
    "jacket4"
  ],
  "private-suit-windbreaker": [
    "jacket3",
    "jacket4"
  ],
  "wolfpack-windbreaker": [
    "jacket3",
    "jacket4"
  ],
  "elite-fit-denim": [
    "jeans1",
    "jeans3"
  ],
  "coated-stack-denim": [
    "jeans1",
    "jeans3"
  ],
  "jeans1": [
    "jeans1",
    "jeans3"
  ],
  "cargo-jeans": "jeans2",
  "signature-wolf-logo-t-shirt": [
    "shirt1",
    "shirt2"
  ],
  "jetski-motion-tee": [
    "shirt1",
    "shirt2"
  ],
  "wolfpack-world-tour-poster": "poster1",
  "ppc-vinyl": "disk1",
  "ppc-poster": "poster1",
  "private-suite-vol-2-vinyl": "disk2",
  "private-suite-vol-2-poster": "poster2"
} as const;

export type MerchImageManifest = typeof merchImageManifest;
export type MerchImageAliases = typeof merchImageAliases;
