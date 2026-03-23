> **Status:** Research reference. This document is comparative research and
> does not describe the current routed website.

The drakerelated.com site is designed as a virtual tour of Drake’s mansion rather than a conventional grid‑based store.  A July 2023 Complex article notes that the homepage brings visitors “to the front door of his home” and lets them access rooms such as the studio, bedroom and lounge via arrows and that each location contains easter‑egg merch links.  Visiting the site today shows that this concept is still live – the landing view is a highly detailed isometric rendering of a grand house with navigation icons floating over features such as the front door and cars.  From there users can enter rooms like the studio or lounge, each depicted with full 3D scenes and small “+” markers indicating interactive elements.  There is also a minimal top bar for Albums, Projects, Tour, Shop All, etc. and a persistent “Explore” button that blurs the scene and shows a text list of all rooms for quick navigation.



\### Professional Website Designer’s View



\* \*\*Narrative‑driven layout.\*\*  The site uses a room‑by‑room structure to tell a story about Drake’s world.  Each room is a separate URL (e.g., `/rooms/studio`, `/rooms/lounge`) with its own immersive scene and contextual products.  This approach differentiates the brand and encourages exploration instead of treating the store like a generic catalogue.

\* \*\*Clear global navigation.\*\*  A simple, uppercase nav bar floats over every page for quick access to Albums, Projects, Tour, Shop All, Drake Related, SLM Micro Videos and the cart.  This keeps transactional navigation separate from the experiential 3D scenes.

\* \*\*Consistent call‑to‑action pattern.\*\*  Small “+” markers are overlaid on objects in each scene and correspond to merch items.  When “Explore” is clicked, the interface blurs the 3D scene and displays a text list of all rooms, providing a clear “escape hatch” from the immersive view.

\* \*\*E‑commerce page.\*\*  The “Shop All” section switches to a clean, minimal product grid with floating product photos, simple type hierarchy and price beneath.  This separation makes it easy for customers to shop without being distracted by the virtual‑tour gimmick.

\* \*\*Branding and cohesion.\*\*  The 3D environments, colour palettes and physical props in each room (e.g., roses on the bed, mixing boards in the studio) reinforce Drake’s persona and help tell a consistent brand story.



\### Visual Artist’s View



\* \*\*Art style and palette.\*\*  The scenes are high‑fidelity isometric renders with cinematic lighting.  The front exterior uses cool stone and warm yellow light, the studio bathes everything in red/green stage lighting and the lounge shifts to a golden, retro vibe.  The bedroom is soft and romantic with pale colours, rose‑petal scatters and fur textures.  This variation keeps the tour interesting while maintaining an overall luxurious mood.

\* \*\*Composition and detail.\*\*  Each scene is composed like a movie set – there is fore‑, mid‑ and background depth, and props are carefully arranged to create focal points.  The use of overhead perspective evokes architectural cut‑away illustrations and video games.  Details such as neon lights, vinyl records, custom sneakers and album‑cover easter eggs reward close examination.

\* \*\*Texture and lighting realism.\*\*  Materials such as velvet couches, marble floors and polished car paint are rendered with convincing reflections and shadows.  The lighting differs per room; in the bedroom the lamps cast warm pools of light and produce subtle ambient occlusion while the studio uses bold coloured uplighting.



\### UI/UX Engineer’s View



\* \*\*Immersive navigation vs. usability.\*\*  The room‑to‑room experience is engaging but may frustrate users looking for a specific item.  The small “+” markers can be hard to tap, and there are no visible tooltips to clarify what each hotspot represents.  Enabling larger hit zones or a list of items per room could improve discoverability.

\* \*\*Performance and accessibility.\*\*  Each scene is a large image or 3D render; initial loads can be heavy and may not be optimised for slower connections.  Progressive image loading or lower‑resolution fallbacks could help.  The site relies heavily on visuals with minimal text; alt‑text and keyboard navigation are not obvious, and there is little contrast between “+” markers and the scene.  The overlay navigation list is a good fallback, but more accessible alternatives (such as a conventional menu) and ARIA labels are needed for screen‑reader users.

\* \*\*Responsive design.\*\*  On desktop the site is impressive, but on small screens the dense scenes and tiny hotspots could be impractical.  A simplified mobile layout or zoom‑in feature would improve usability across devices.

\* \*\*Seamless integration with e‑commerce.\*\*  The transition from immersive rooms to a conventional product grid is handled neatly: the top navigation remains, and the cart icon persists across pages.  The product grid uses floating photos and clear pricing, and sold‑out items are labelled explicitly.  However, there is limited filtering or sorting, and adding items to the cart requires first entering the product detail overlay, which could be simplified.



\### Summary



Drake Related’s website stands out because it merges e‑commerce with a gamified, virtual‑tour concept.  The site opens at Drake’s front door and invites visitors to explore a digital mansion, with rooms containing hidden merch and narrative details.  From a design standpoint it successfully reinforces the artist’s brand and encourages exploration through beautiful, cinematic renders.  As a piece of interactive art it feels premium and playful, though it sacrifices some usability and accessibility.  A future evolution could preserve the immersive experience while offering clearer, more accessible navigation and faster loading for all users.



