import { useState } from "react";
import { ExternalLink, Plus, Minus } from "lucide-react";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { PRODUCTS } from "@/constants/products";

function ProductCard({ p, open, onToggle, copy }) {
  return (
    <article
      inert={copy ? true : undefined}
      aria-hidden={copy || undefined}
      data-testid={copy ? undefined : "product-card"}
      className="shrink-0 w-[78vw] max-w-[300px] sm:w-[300px] rounded-[var(--radius-md)] border border-[var(--border-blue)] bg-[var(--background-primary)] p-5 flex flex-col"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-display text-[11px] uppercase tracking-[0.12em] opacity-60">{p.kind}</span>
        <span className="font-display text-sm font-semibold text-[var(--surface-blue)] whitespace-nowrap">{p.price}</span>
      </div>
      <h4 className="font-display font-semibold text-base mt-2">{p.name}</h4>
      <p className="font-body text-sm opacity-80 mt-2 leading-relaxed">{p.summary}</p>
      {open && (
        <ul className="mt-3 space-y-2 border-t border-[var(--border-blue)] pt-3" data-testid="product-details">
          {p.details.map((d, i) => (
            <li key={i} className="font-body text-sm opacity-90 leading-relaxed">— {d}</li>
          ))}
        </ul>
      )}
      <div className="mt-auto pt-4 flex items-center gap-3">
        <button type="button" onClick={onToggle} aria-expanded={open} data-testid="product-read-more" className="focus-ring inline-flex items-center gap-1.5 font-display text-xs font-semibold uppercase tracking-wide hover:opacity-80">
          {open ? <Minus className="h-3.5 w-3.5" aria-hidden="true" /> : <Plus className="h-3.5 w-3.5" aria-hidden="true" />}
          {open ? "Show less" : "Read more"}
        </button>
        <a href={p.href} target="_blank" rel="noopener noreferrer" className="focus-ring ml-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--border-blue)] px-3 py-1.5 font-display text-xs font-semibold text-[var(--surface-blue)] hover:bg-[var(--background-blue-soft)]">
          {p.cta} <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

// Auto-scrolling strip of Bretton's products and services. Pauses on hover, focus and
// touch, and while a card is expanded; still (but swipeable) with reduced motion.
export default function ProductsCarousel() {
  const [openId, setOpenId] = useState(null);
  const ref = useAutoScroll(30, !!openId);
  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));
  return (
    <div className="mt-16" data-testid="products-carousel">
      <h3 className="font-display font-bold text-xl md:text-2xl">Products & quick help</h3>
      <p className="font-body text-sm md:text-base opacity-80 mt-2 max-w-[62ch]">Kits and short engagements sold under my KTS Guides brand. Checkout opens Gumroad or Stripe in a new tab.</p>
      <div
        ref={ref}
        className="mt-6 -mx-4 px-4 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="region"
        aria-label="Products and services, scrolling"
        tabIndex={0}
      >
        <div className="flex items-stretch gap-4 w-max pb-2">
          {[...PRODUCTS, ...PRODUCTS].map((p, i) => (
            <ProductCard key={`${p.id}-${i}`} p={p} copy={i >= PRODUCTS.length} open={openId === p.id && i < PRODUCTS.length} onToggle={() => toggle(p.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
