import { mutation } from './_generated/server'

export const seedDemoData = mutation({
    args: {},
    handler: async (ctx) => {
        // 0. Cleanup existing demo data (including orphans and related records)
        const tables = ['merchProducts', 'merchVariants', 'events', 'venues', 'eventTickets', 'merchCart'] as const;
        for (const table of tables) {
            const records = await ctx.db.query(table).collect();
            for (const record of records) {
                await ctx.db.delete(record._id);
            }
        }

        // 1. Create a Mock Venue
        const venueId = await ctx.db.insert('venues', {
            name: 'The Arena',
            city: 'Los Angeles',
            country: 'USA',
            address: '1234 Wolfpack Blvd, Los Angeles, CA 90015',
            timezone: 'America/Los_Angeles',
            createdAt: Date.now(),
        })

        // 2. Create Mock Events
        const now = Date.now()
        const oneDay = 24 * 60 * 60 * 1000

        const events = [
            {
                title: 'Wolfpack World Tour: LA',
                description: 'The biggest night of the year. Join the pack at The Arena.',
                imageUrl: '/images/bg1.jpg',
                startAtUtc: now + oneDay * 7, // Next week
                endAtUtc: now + oneDay * 7 + (4 * 60 * 60 * 1000),
                capacity: 20000,
                ticketsSold: 15420,
                saleStatus: 'on_sale' as const,
                city: 'Los Angeles',
            },
            {
                title: 'Studio Sessions: Live',
                description: 'Intimate performance and Q&A session.',
                imageUrl: '/images/bg2.jpg', // Using provided bg
                startAtUtc: now + oneDay * 14,
                endAtUtc: now + oneDay * 14 + (2 * 60 * 60 * 1000),
                capacity: 500,
                ticketsSold: 450,
                saleStatus: 'on_sale' as const,
                city: 'Los Angeles',
            },
            {
                title: 'Album Release Party',
                description: 'Be the first to hear the new tracks.',
                imageUrl: '/images/bg3.jpg',
                startAtUtc: now + oneDay * 30,
                endAtUtc: now + oneDay * 30 + (5 * 60 * 60 * 1000),
                capacity: 1000,
                ticketsSold: 0,
                saleStatus: 'upcoming' as const,
                city: 'Los Angeles',
            },
        ]

        for (const event of events) {
            // Create user "artist" if needed, but for now we'll mock the ID or fetch one?
            // Better to fetch the first user as artist
            const artist = await ctx.db.query('users').first()
            if (!artist) {
                console.error('No users found to assign event to.')
                continue
            }

            await ctx.db.insert('events', {
                ...event,
                venueId,
                venueName: 'The Arena',
                country: 'USA',
                address: '1234 Wolfpack Blvd, Los Angeles, CA 90015',
                timezone: 'America/Los_Angeles',
                artistId: artist._id,
                searchText: `${event.title} The Arena Los Angeles`,
                dedupeKey: `${artist._id}:${venueId}:${event.startAtUtc}:${event.title}`,
                nextQueueSeq: 0,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            })
        }

        // 3. Create Mock Products
        type SeedProduct = {
            name: string
            description: string
            price: number
            category: 'apparel' | 'accessories' | 'vinyl' | 'limited' | 'other'
            image: string
            options: Array<{ size: string; color: string }>
            tags?: string[]
            model3dUrl?: string
            modelPosterUrl?: string
            modelConfig?: {
                autoRotate?: boolean
                cameraOrbit?: string
                minFov?: number
                maxFov?: number
            }
        }

        const products: SeedProduct[] = [
            {
                name: 'ROAPR Mini Figurine',
                description: 'Limited drop sculpt inspired by the tour visuals.',
                price: 12500, // $125.00
                category: 'limited' as const,
                image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1000&auto=format&fit=crop',
                tags: ['ROAPR Studio', 'Limited Drop', 'figurine'],
                model3dUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
                modelPosterUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.webp',
                modelConfig: {
                    autoRotate: true,
                    cameraOrbit: '0deg 75deg 120%',
                    minFov: 30,
                    maxFov: 80,
                },
                options: [
                    { size: 'Standard', color: 'Nebula' }
                ]
            },
            {
                name: 'ROA Elite Watch',
                description: 'Premium stainless steel chronograph with Wolfpack engraving.',
                price: 24999, // $249.99
                category: 'accessories' as const,
                image: '/images/watch.jpg',
                options: [
                    { size: '40mm', color: 'Silver' },
                    { size: '40mm', color: 'Gold' },
                    { size: '44mm', color: 'Silver' },
                    { size: '44mm', color: 'Gold' }
                ]
            },
            {
                name: 'Wolfpack Bomber Jacket',
                description: 'Classic bomber silhouette with embroidered logo on back.',
                price: 12000, // $120.00
                category: 'apparel' as const,
                image: '/images/jacket.jpg',
                options: [
                    { size: 'S', color: 'Black' },
                    { size: 'M', color: 'Black' },
                    { size: 'L', color: 'Black' },
                    { size: 'XL', color: 'Black' },
                    { size: 'S', color: 'Olive' },
                    { size: 'M', color: 'Olive' },
                    { size: 'L', color: 'Olive' }
                ]
            },
            {
                name: 'Sterling Silver Chain',
                description: 'Heavy gauge cuban link chain.',
                price: 8500, // $85.00
                category: 'accessories' as const,
                image: '/images/chain.jpg',
                options: [
                    { size: '18"', color: 'Silver' },
                    { size: '20"', color: 'Silver' },
                    { size: '22"', color: 'Silver' }
                ]
            },
            {
                name: 'Signature Wolf Logo T-Shirt',
                description: 'Soft 100% cotton tee with high-density print.',
                price: 3500, // $35.00
                category: 'apparel' as const,
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop',
                options: [
                    { size: 'S', color: 'Black' },
                    { size: 'M', color: 'Black' },
                    { size: 'L', color: 'Black' },
                    { size: 'XL', color: 'Black' },
                    { size: 'XXL', color: 'Black' },
                    { size: 'S', color: 'White' },
                    { size: 'M', color: 'White' },
                    { size: 'L', color: 'White' },
                    { size: 'XL', color: 'White' }
                ]
            },
            {
                name: 'Elite Fit Denim',
                description: 'Premium raw denim jeans with a modern slim-straight cut.',
                price: 9500, // $95.00
                category: 'apparel' as const,
                image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1000&auto=format&fit=crop',
                options: [
                    { size: '30/32', color: 'Indigo' },
                    { size: '32/32', color: 'Indigo' },
                    { size: '34/32', color: 'Indigo' },
                    { size: '36/32', color: 'Indigo' },
                    { size: '30/32', color: 'Black' },
                    { size: '32/32', color: 'Black' },
                    { size: '34/32', color: 'Black' }
                ]
            },
            {
                name: 'Wolfpack World Tour Poster',
                description: 'Limited edition high-quality print from the World Tour.',
                price: 2500, // $25.00
                category: 'limited' as const,
                image: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?q=80&w=1000&auto=format&fit=crop',
                options: [
                    { size: '18x24"', color: 'Soft Poster' },
                    { size: '18x24"', color: 'Hard Poster' },
                    { size: '24x36"', color: 'Soft Poster' },
                    { size: '24x36"', color: 'Hard Poster' }
                ]
            }
        ]

        // Create a dummy creator for products
        const creator = await ctx.db.query('users').first()

        if (creator) {
            for (const p of products) {
                const productTags = p.tags ?? ['demo', 'new']
                const searchText = [p.name, p.description, p.category, ...productTags].join(' ').toLowerCase()
                const productId = await ctx.db.insert('merchProducts', {
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    totalStock: 100,
                    lowStockThreshold: 10,
                    imageUrls: [p.image],
                    thumbnailUrl: p.image,
                    category: p.category,
                    tags: productTags,
                    model3dUrl: p.model3dUrl,
                    modelPosterUrl: p.modelPosterUrl,
                    modelConfig: p.modelConfig,
                    searchText,
                    status: 'active',
                    isPreOrder: false,
                    isDropProduct: false,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    createdBy: creator._id,
                })

                // Create Variants
                for (const opt of p.options) {
                    await ctx.db.insert('merchVariants', {
                        productId,
                        sku: `${p.name.substring(0, 3).toUpperCase()}-${opt.size}-${opt.color.substring(0, 3).toUpperCase()}`,
                        size: opt.size,
                        color: opt.color,
                        stock: 25,
                        status: 'available',
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    })
                }
            }
        }

        return 'Demo data seeded successfully!'
    },
})
