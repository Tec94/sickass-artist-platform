import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const HARDCODED_POSTS = [
  {
    _id: '1' as any,
    igPostId: 'DTdtmCpEbNs',
    thumbnailUrl: 'https://scontent-dfw6-1.cdninstagram.com/v/t51.2885-15/612231075_17928205983188462_4571386665129116148_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08_tt6&_nc_ht=scontent-dfw6-1.cdninstagram.com&_nc_cat=1&_nc_oc=Q6cZ2QGKgH_aqAEbw8n8W9Z1-pE09Kcht99FQxQGF6y9diAQOIzsbsPeRxTERgul2l4uMms&_nc_ohc=wQ70ZSQgSj8Q7kNvwHPNnCw&_nc_gid=X_Tvy8WHGZtyBO-Z5EsH7Q&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfoglQYcT_V8imlU70KdqBAOxk1rCgVb8weYtBHdWLZsmw&oe=696C9A92&_nc_sid=8b3546',
    mediaUrl: 'https://scontent-dfw6-1.cdninstagram.com/v/t51.2885-15/612231075_17928205983188462_4571386665129116148_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08_tt6&_nc_ht=scontent-dfw6-1.cdninstagram.com&_nc_cat=1&_nc_oc=Q6cZ2QGKgH_aqAEbw8n8W9Z1-pE09Kcht99FQxQGF6y9diAQOIzsbsPeRxTERgul2l4uMms&_nc_ohc=wQ70ZSQgSj8Q7kNvwHPNnCw&_nc_gid=X_Tvy8WHGZtyBO-Z5EsH7Q&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfoglQYcT_V8imlU70KdqBAOxk1rCgVb8weYtBHdWLZsmw&oe=696C9A92&_nc_sid=8b3546',
    caption: 'Premios Lo Nuestro nomination for "Artista revelación del año masculino".',
    mediaType: 'image',
    likeCount: 15420,
    commentCount: 842,
    igLink: 'https://www.instagram.com/roawolf/p/DTdtmCpEbNs/'
  },
  {
    _id: '2' as any,
    igPostId: 'DTcEIobjQIQ',
    thumbnailUrl: 'https://scontent-dfw5-2.cdninstagram.com/v/t51.2885-15/615263164_17928133518188462_810875455589211475_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08_tt6&_nc_ht=scontent-dfw5-2.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QGKgH_aqAEbw8n8W9Z1-pE09Kcht99FQxQGF6y9diAQOIzsbsPeRxTERgul2l4uMms&_nc_ohc=Zh-jqSGunV8Q7kNvwGxAaQK&_nc_gid=X_Tvy8WHGZtyBO-Z5EsH7Q&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfqeXYJj54EUFoIN7RAAenyFwQbRYEm1buGQn3C-gs5OjQ&oe=696CA048&_nc_sid=8b3546',
    mediaUrl: 'https://scontent-dfw5-2.cdninstagram.com/v/t51.2885-15/615263164_17928133518188462_8108754565589211475_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08_tt6&_nc_ht=scontent-dfw5-2.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QGKgH_aqAEbw8n8W9Z1-pE09Kcht99FQxQGF6y9diAQOIzsbsPeRxTERgul2l4uMms&_nc_ohc=Zh-jqSGunV8Q7kNvwGxAaQK&_nc_gid=X_Tvy8WHGZtyBO-Z5EsH7Q&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfqeXYJj54EUFoIN7RAAenyFwQbRYEm1buGQn3C-gs5OjQ&oe=696CA048&_nc_sid=8b3546',
    caption: 'DE QUE CARAJO VALE AMAR SI TU NO VALES NA',
    mediaType: 'image',
    likeCount: 22100,
    commentCount: 1105,
    igLink: 'https://www.instagram.com/roawolf/p/DTcEIobjQIQ/'
  },
  {
    _id: '3' as any,
    igPostId: 'DTWU9ndkY_2',
    thumbnailUrl: 'https://scontent-dfw5-2.cdninstagram.com/v/t51.2885-15/612067464_17927897451188462_3083332127112553516_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08_tt6&_nc_ht=scontent-dfw5-2.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QGKgH_aqAEbw8n8W9Z1-pE09Kcht99FQxQGF6y9diAQOIzsbsPeRxTERgul2l4uMms&_nc_ohc=7GFpD2LH-hIQ7kNvwG7G4fc&_nc_gid=X_Tvy8WHGZtyBO-Z5EsH7Q&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfqFuh24MUwBY1ZlghZw8AkwNBXhmjYR2an9Rkd3_tw92w&oe=696CBD09&_nc_sid=8b3546',
    mediaUrl: 'https://scontent-dfw5-2.cdninstagram.com/v/t51.2885-15/612067464_17927897451188462_3083332127112553516_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08_tt6&_nc_ht=scontent-dfw5-2.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QGKgH_aqAEbw8n8W9Z1-pE09Kcht99FQxQGF6y9diAQOIzsbsPeRxTERgul2l4uMms&_nc_ohc=7GFpD2LH-hIQ7kNvwG7G4fc&_nc_gid=X_Tvy8WHGZtyBO-Z5EsH7Q&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfqFuh24MUwBY1ZlghZw8AkwNBXhmjYR2an9Rkd3_tw92w&oe=696CBD09&_nc_sid=8b3546',
    caption: 'Custom bolo tie piece.',
    mediaType: 'image',
    likeCount: 18900,
    commentCount: 450,
    igLink: 'https://www.instagram.com/roawolf/p/DTWU9ndkY_2/'
  },
  {
    _id: '4' as any,
    igPostId: 'DTT2vIakd6c',
    thumbnailUrl: 'https://scontent-dfw5-2.cdninstagram.com/v/t51.2885-15/612498211_17927791641188462_5877894505225286609_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08_tt6&_nc_ht=scontent-dfw5-2.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QGKgH_aqAEbw8n8W9Z1-pE09Kcht99FQxQGF6y9diAQOIzsbsPeRxTERgul2l4uMms&_nc_ohc=Ix0mF8Z7dAgQ7kNvwH4cypp&_nc_gid=X_Tvy8WHGZtyBO-Z5EsH7Q&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfrRzgXafHs2hvt1_02oodIurIRmAGayJ4SvxzOPSmTYeg&oe=696CB7A9&_nc_sid=8b3546',
    mediaUrl: 'https://scontent-dfw5-2.cdninstagram.com/v/t51.2885-15/612498211_17927791641188462_5877894505225286609_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08_tt6&_nc_ht=scontent-dfw5-2.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QGKgH_aqAEbw8n8W9Z1-pE09Kcht99FQxQGF6y9diAQOIzsbsPeRxTERgul2l4uMms&_nc_ohc=Ix0mF8Z7dAgQ7kNvwH4cypp&_nc_gid=X_Tvy8WHGZtyBO-Z5EsH7Q&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfrRzgXafHs2hvt1_02oodIurIRmAGayJ4SvxzOPSmTYeg&oe=696CB7A9&_nc_sid=8b3546',
    caption: 'Official artist poster.',
    mediaType: 'image',
    likeCount: 12300,
    commentCount: 220,
    igLink: 'https://www.instagram.com/roawolf/p/DTT2vIakd6c/'
  },
  {
    _id: '5' as any,
    igPostId: 'DTO0jYPEWYJ',
    thumbnailUrl: 'https://scontent-dfw5-2.cdninstagram.com/v/t51.2885-15/611779516_17927587026188462_8616825338289165955_n.jpg?stp=dst-jpg_e15_p640x640_tt6&_nc_ht=scontent-dfw5-2.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QGKgH_aqAEbw8n8W9Z1-pE09Kcht99FQxQGF6y9diAQOIzsbsPeRxTERgul2l4uMms&_nc_ohc=Ucg80Yz4yXoQ7kNvwF6F1J5&_nc_gid=X_Tvy8WHGZtyBO-Z5EsH7Q&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Afox-ob1zFz2WD1qjSzeoiNFHSADcDarqXDSLAc5OHlIQQ&oe=696C913B&_nc_sid=8b3546',
    mediaUrl: 'https://scontent-dfw5-2.cdninstagram.com/v/t51.2885-15/611779516_17927587026188462_8616825338289165955_n.jpg?stp=dst-jpg_e15_p640x640_tt6&_nc_ht=scontent-dfw5-2.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QGKgH_aqAEbw8n8W9Z1-pE09Kcht99FQxQGF6y9diAQOIzsbsPeRxTERgul2l4uMms&_nc_ohc=Ucg80Yz4yXoQ7kNvwF6F1J5&_nc_gid=X_Tvy8WHGZtyBO-Z5EsH7Q&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Afox-ob1zFz2WD1qjSzeoiNFHSADcDarqXDSLAc5OHlIQQ&oe=696C913B&_nc_sid=8b3546',
    caption: 'NETFLIX AND CHILL YA DISPONIBLE EN TODAS LAS PLATAFORMAS DIGITALES',
    mediaType: 'image',
    likeCount: 35000,
    commentCount: 2400,
    igLink: 'https://www.instagram.com/roawolf/p/DTO0jYPEWYJ/'
  },
  {
    _id: '6' as any,
    igPostId: 'DTOKEOukVTI',
    thumbnailUrl: 'https://scontent-dfw5-1.cdninstagram.com/v/t51.2885-15/613188943_18078356732461585_2413483033114603353_n.webp?stp=dst-jpg_e35_s640x640_sh0.08_tt6&_nc_ht=scontent-dfw5-1.cdninstagram.com&_nc_cat=101&_nc_oc=Q6cZ2QGKgH_aqAEbw8n8W9Z1-pE09Kcht99FQxQGF6y9diAQOIzsbsPeRxTERgul2l4uMms&_nc_ohc=PI9druTM5okQ7kNvwFqwWqS&_nc_gid=X_Tvy8WHGZtyBO-Z5EsH7Q&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfrMkvAxN9lneW_kWfJ4FsjTqFDu9rL5V0kc4ZMlUOp8Fw&oe=696CC5AB&_nc_sid=8b3546',
    mediaUrl: 'https://scontent-dfw5-1.cdninstagram.com/v/t51.2885-15/613188943_18078356732461585_2413483033114603353_n.webp?stp=dst-jpg_e35_s640x640_sh0.08_tt6&_nc_ht=scontent-dfw5-1.cdninstagram.com&_nc_cat=101&_nc_oc=Q6cZ2QGKgH_aqAEbw8n8W9Z1-pE09Kcht99FQxQGF6y9diAQOIzsbsPeRxTERgul2l4uMms&_nc_ohc=PI9druTM5okQ7kNvwFqwWqS&_nc_gid=X_Tvy8WHGZtyBO-Z5EsH7Q&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfrMkvAxN9lneW_kWfJ4FsjTqFDu9rL5V0kc4ZMlUOp8Fw&oe=696CC5AB&_nc_sid=8b3546',
    caption: 'Cartoon art for "Netflix and Chill".',
    mediaType: 'image',
    likeCount: 28400,
    commentCount: 950,
    igLink: 'https://www.instagram.com/roawolf/p/DTOKEOukVTI/'
  }
];

export const InstagramGallery = () => {
  const [selectedPost, setSelectedPost] = useState<any | null>(null)

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div>
           <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
        <a
          href="https://instagram.com/roawolf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-500 hover:text-red-400 flex items-center gap-1 transition"
        >
          <span>Follow @roawolf</span>
          <span>↗</span>
        </a>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {HARDCODED_POSTS.map((post) => (
            <motion.div
              key={post.igPostId}
              className="relative group cursor-pointer overflow-hidden rounded-sm aspect-square bg-zinc-900 border border-zinc-800"
              onClick={() => setSelectedPost(post)}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              layout
            >
              {/* Image */}
              <img
                src={post.thumbnailUrl}
                alt={post.caption || 'Instagram post'}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                loading="lazy"
              />

              {/* Stats Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-red-900/40 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-all text-white text-center">
                  <div className="text-lg font-display font-bold">❤️ {post.likeCount.toLocaleString()}</div>
                  <div className="text-sm font-bold opacity-70">💬 {post.commentCount.toLocaleString()}</div>
                </div>
              </div>
            </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              className="bg-zinc-950 rounded-sm overflow-hidden max-w-2xl w-full border border-zinc-800"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <div className="aspect-square w-full relative">
                <img
                  src={selectedPost.mediaUrl || selectedPost.thumbnailUrl}
                  alt={selectedPost.caption}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="text-zinc-200 mb-6 text-sm leading-relaxed">{selectedPost.caption}</p>

                <div className="flex items-center justify-between mb-8">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-2xl font-display font-bold text-red-600">❤️ {selectedPost.likeCount.toLocaleString()}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Likes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-display font-bold text-white">💬 {selectedPost.commentCount.toLocaleString()}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Comments</p>
                    </div>
                  </div>

                  <a
                    href={selectedPost.igLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition"
                  >
                    View on IG
                  </a>
                </div>

                <button
                  onClick={() => setSelectedPost(null)}
                  className="w-full py-3 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-white transition"
                >
                  Close Gallery
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

