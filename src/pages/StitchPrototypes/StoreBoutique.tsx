import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';
import { Circle, User, ShoppingBag } from 'lucide-react';
import SharedNavbar from '../../components/Navigation/SharedNavbar';
export default function StoreBoutique() {
  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#3C2A21] w-full font-sans">
      <style>{`
        :root {
            --color-ink: #1C1B1A;
            --color-parchment: #F4F0EB;
            --color-vellum: #FCFBF9;
        }
        
        body {
            background-color: var(--color-parchment);
            color: var(--color-ink);
        }

        .border-structural {
            border-color: var(--color-ink);
            border-width: 1px;
        }

        .product-card:hover img {
            transform: scale(1.03);
        }

        .add-btn:hover {
            background-color: var(--color-ink);
            color: var(--color-parchment);
        }
        
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
    `}</style>
      

<SharedNavbar />

<main className="flex-1 flex flex-col md:flex-row w-full max-w-[1600px] mx-auto">

<aside className="w-full md:w-[250px] flex-shrink-0 border-r border-structural bg-parchment hidden md:block sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto no-scrollbar">
<div className="p-8">
<h2 className="font-serif text-2xl mb-8 tracking-tight">Categories</h2>
<nav className="flex flex-col gap-6">
<Link className="flex items-center justify-between text-sm font-semibold uppercase tracking-widest group" to="/proto/directory">
<span className="text-primary border-b border-primary pb-1">Apparel</span>
<span className="text-xs text-muted group-hover:text-primary transition-colors">12</span>
</Link>
<Link className="flex items-center justify-between text-sm font-semibold uppercase tracking-widest text-muted hover:text-ink transition-colors group" to="/proto/directory">
<span>Music</span>
<span className="text-xs group-hover:text-ink transition-colors">8</span>
</Link>
<Link className="flex items-center justify-between text-sm font-semibold uppercase tracking-widest text-muted hover:text-ink transition-colors group" to="/proto/directory">
<span>Artifacts</span>
<span className="text-xs group-hover:text-ink transition-colors">5</span>
</Link>
<Link className="flex items-center justify-between text-sm font-semibold uppercase tracking-widest text-muted hover:text-ink transition-colors group" to="/proto/directory">
<span>Print</span>
<span className="text-xs group-hover:text-ink transition-colors">3</span>
</Link>
</nav>
<div className="mt-16 pt-8">
<h3 className="font-serif text-xl mb-6 tracking-tight">Sort By</h3>
<div className="flex flex-col gap-4">
<label className="flex items-center gap-3 cursor-pointer group">
<input defaultChecked={true} className="form-radio text-ink border-structural focus:ring-ink" name="sort" type="radio" />
<span className="text-xs font-semibold uppercase tracking-widest text-ink group-hover:text-primary transition-colors">Latest</span>
</label>
<label className="flex items-center gap-3 cursor-pointer group">
<input className="form-radio text-ink border-structural focus:ring-ink" name="sort" type="radio" />
<span className="text-xs font-semibold uppercase tracking-widest text-muted group-hover:text-ink transition-colors">Price: Low - High</span>
</label>
<label className="flex items-center gap-3 cursor-pointer group">
<input className="form-radio text-ink border-structural focus:ring-ink" name="sort" type="radio" />
<span className="text-xs font-semibold uppercase tracking-widest text-muted group-hover:text-ink transition-colors">Price: High - Low</span>
</label>
</div>
</div>
</div>
</aside>

<section className="flex-1 bg-vellum">

<div className="md:hidden border-b border-structural p-4 flex justify-between items-center bg-parchment">
<span className="font-serif text-xl">Apparel</span>
<button className="text-xs font-semibold uppercase tracking-widest border border-structural px-3 py-1.5 hover:bg-ink hover:text-parchment transition-colors rounded-none flex items-center gap-1">
<Circle className="text-[16px]" /> Filter
                </button>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full bg-ink gap-[1px] border-b border-structural">

<article className="product-card group relative flex flex-col bg-vellum h-[450px]">
<div className="flex-1 overflow-hidden relative cursor-pointer border-b border-structural bg-[#f0f0f0]">
<img alt="White cotton t-shirt with subtle branding" className="w-full h-full object-cover transition-transform duration-500 ease-out" data-alt="White cotton t-shirt" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSKDzlRjFImnV-UfzxaF0-Q-flI9yLrlnTa0JVsCY3hdDA4-LDzpwvxjNrPc24CjNJY9_fNec7boAzrML7yL2_J9LXlooNOnujpssGINo8omlpS9WBjJHa759zujeex3SGz1ZA8Est5Kmvx-baj157bibrqvpp07Z-DOj4GEoCKngvXqPWcdRVC2TIGFzgji0LoA_a8EhijJ-2DBiX_rXEUcPrCeWzQGggjumKZUN9rJeeH4d6k6WrkhkeJsypirllffe7Y9jYS1OM" />
<div className="absolute top-4 left-4">
<span className="bg-ink text-parchment text-[10px] font-bold uppercase tracking-widest px-2 py-1">New</span>
</div>
</div>
<div className="p-5 flex flex-col justify-between h-[120px] bg-vellum relative z-10">
<div>
<h3 className="font-serif text-lg font-medium leading-tight truncate">The Archive Tee</h3>
<p className="text-sm font-medium mt-1 text-muted">$45.00</p>
</div>
<button className="add-btn absolute bottom-5 right-5 text-xs font-bold uppercase tracking-widest px-4 py-2 border border-structural transition-colors rounded-none bg-vellum">
                            Add
                        </button>
</div>
</article>

<article className="product-card group relative flex flex-col bg-vellum h-[450px]">
<div className="flex-1 overflow-hidden relative cursor-pointer border-b border-structural bg-[#1a1a1a]">
<img alt="Black oversized hoodie with tonal embroidery" className="w-full h-full object-cover transition-transform duration-500 ease-out opacity-90" data-alt="Black oversized hoodie" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5uguBbRQ_xy2XdYYrNQCFI2mqEM3EXSBlAasBcgiaoZuB4-e0vt4K7GJIcSFekVGoXc9daRhjfk5vYLb48V3Rj2ZgqGcdgW4XO7enKG_wWXOShz3NUMSfEC8VQJv3f7rjcQMvgYFeOk9g6jBzOxM9el5nFhd2xYf2a0kcOpwh6qz8_pEZez1B40lb5UeiyldTFc6BwvIh1-VoTCd_Jtwk2ThrdQat0HWZ54HOa6TQme8x5eJ8UJQhuJSFTW8KSh9Koxk49Xwh8ryG" />
</div>
<div className="p-5 flex flex-col justify-between h-[120px] bg-vellum relative z-10">
<div>
<h3 className="font-serif text-lg font-medium leading-tight truncate">Heavyweight Hoodie</h3>
<p className="text-sm font-medium mt-1 text-muted">$120.00</p>
</div>
<button className="add-btn absolute bottom-5 right-5 text-xs font-bold uppercase tracking-widest px-4 py-2 border border-structural transition-colors rounded-none bg-vellum">
                            Add
                        </button>
</div>
</article>

<article className="product-card group relative flex flex-col bg-vellum h-[450px]">
<div className="flex-1 overflow-hidden relative cursor-pointer border-b border-structural bg-[#e5e5e5]">
<img alt="Minimalist cotton cap in bone color" className="w-full h-full object-cover transition-transform duration-500 ease-out" data-alt="Minimalist bone cotton cap" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGY91OWq9bJ9-d0st2AXFNHZtCmQPu22dwwGMfJ6yCHsc-X4TPe5Ldk1QwJDhjToqkgrPgMOlWXA7PCQ9ZbJBDQNs9GnQoXT-8XSdMfRzHnph3AwTXs7NqIbZ5-rSdEBXIxMMXBVBP0AwtFYjdzhpYinElnt9dE1xCBugJecLRbeM42eryzAf60se_fYew5Z3KzT_PaGfoChTqb-ZxUXqckjTPckw0hgxU-rhWw1bzHdTCKOYMl6GO0CfyPV6iBEdg4343YYLH9R5w" />
</div>
<div className="p-5 flex flex-col justify-between h-[120px] bg-vellum relative z-10">
<div>
<h3 className="font-serif text-lg font-medium leading-tight truncate">Estate Cap</h3>
<p className="text-sm font-medium mt-1 text-muted">$35.00</p>
</div>
<button className="add-btn absolute bottom-5 right-5 text-xs font-bold uppercase tracking-widest px-4 py-2 border border-structural transition-colors rounded-none bg-vellum">
                            Add
                        </button>
</div>
</article>

<article className="product-card group relative flex flex-col bg-vellum h-[450px]">
<div className="flex-1 overflow-hidden relative cursor-pointer border-b border-structural bg-[#dcdcdc]">
<img alt="Structured overshirt in olive green" className="w-full h-full object-cover transition-transform duration-500 ease-out" data-alt="Olive green structured overshirt" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhZsIzPBlB-WDNyJhHB5SZYKEjShn_Tlafuus7sNqI4ouApe94yj1A5rMQZY2aZC1uBW1hL6fEqLxBza7qrF_po-6LCHupjHtCl-ItcH2XON3iSdz_7wj42K1Y-H1Ahx14X3gJJqKg066Q4PQ5irCNFMq9zi4eqq277qqe23AHDrJ5VZZusJ6Dj0eHcdHWuGPLjhPdt62Y2qeNHfDBXDexoGFihop2YYerxgWjAqKY-XZHk89xCNdzJykfjgcelHEatsZjbpwK-7Ci" />
</div>
<div className="p-5 flex flex-col justify-between h-[120px] bg-vellum relative z-10">
<div>
<h3 className="font-serif text-lg font-medium leading-tight truncate">Utility Overshirt</h3>
<p className="text-sm font-medium mt-1 text-muted">$185.00</p>
</div>
<button className="add-btn absolute bottom-5 right-5 text-xs font-bold uppercase tracking-widest px-4 py-2 border border-structural transition-colors rounded-none bg-vellum">
                            Add
                        </button>
</div>
</article>

<article className="product-card group relative flex flex-col bg-vellum h-[450px]">
<div className="flex-1 overflow-hidden relative border-b border-structural bg-[#e0e0e0]">
<img alt="White long sleeve shirt" className="w-full h-full object-cover grayscale opacity-50 transition-transform duration-500" data-alt="White long sleeve shirt" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZYachcBpvP2OixxrH8LN3Z9Rrgp6OqiW4Sg4T9RSD1jA7gn9fLPJvxUaO3GSfl2XwSFfaiBU-bCxNjIxINniQ13UccFsjoD64UtLdJ2GWpgR_JfkKt-NrKp4RSwWjxdJPv3LooCwu7EDhO_WE9pKTcxln1frBmlBCvit2qQc2wRd-K1sPD-WzxiW80Vf_MrsGb4f9IhrdBp294sUo8pu-3Hd0X0JEPz8dfjcDalATF0BGMUljQ_FE-lNjDqzCBMu7Am2qmgg1sI_u" />
<div className="absolute inset-0 flex items-center justify-center bg-vellum/20 backdrop-blur-[2px]">
<span className="bg-parchment border border-structural text-ink text-xs font-bold uppercase tracking-widest px-4 py-2">Sold Out</span>
</div>
</div>
<div className="p-5 flex flex-col justify-between h-[120px] bg-vellum relative z-10">
<div>
<h3 className="font-serif text-lg font-medium leading-tight truncate text-muted">Tour Longsleeve</h3>
<p className="text-sm font-medium mt-1 text-muted">$55.00</p>
</div>
</div>
</article>

<article className="product-card group relative flex flex-col bg-vellum h-[450px]">
<div className="flex-1 overflow-hidden relative cursor-pointer border-b border-structural bg-[#222]">
<img alt="Minimalist black leather sneakers" className="w-full h-full object-cover transition-transform duration-500 ease-out" data-alt="Black leather minimalist sneakers" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB04Te93bWhgjl5FliglDYwlpb3OJaodbpS2R5-gFxpS9fRTqKCnuKKlQAihWPI_iT6V4Fi8ed0-lBynPMbnZdyuShmqScxn517aeQpNar5S6NDze9FD0LKtkZRK2ufqkymymgG3XtzQIZ5-AeUUbe0jTFbBkMb584wOXveRrWNhmG9SHd7O9lNL2n5KSvULHahwfiyg5DZFn5F6MTEkE8eg9pNeH9jfzcrfgo5selmNEWZh5HSB6-5dQgfy8g-xLDWnQyQxtZRcLEs" />
</div>
<div className="p-5 flex flex-col justify-between h-[120px] bg-vellum relative z-10">
<div>
<h3 className="font-serif text-lg font-medium leading-tight truncate">Gallery Sneaker</h3>
<p className="text-sm font-medium mt-1 text-muted">$220.00</p>
</div>
<button className="add-btn absolute bottom-5 right-5 text-xs font-bold uppercase tracking-widest px-4 py-2 border border-structural transition-colors rounded-none bg-vellum">
                            Add
                        </button>
</div>
</article>
</div>

<div className="h-32 flex items-center justify-center border-b border-structural bg-vellum">
<p className="font-serif text-lg text-muted italic">End of collection.</p>
</div>
</section>
</main>

    </div>
  );
}