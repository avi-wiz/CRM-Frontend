import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft } from "lucide-react";

// ─── Full-screen multi-section form shell ───
// Mirrors the reference layout: a header (back + title + right-aligned CTAs),
// a sticky top section-nav bar, and a vertically-scrolling body whose sections
// drive the active nav item (scroll-spy). Clicking a nav item smooth-scrolls to
// the matching section.
//
//   sections: [{ id, label }]
//   actions:  right-aligned header buttons (JSX)
//   children: render-prop ({ registerSection }) OR plain nodes. Use the
//             <FormSection> helper for each section to auto-register.
export default function FullScreenForm({ title, onBack, actions, sections = [], children }) {
  const scrollRef = useRef(null);
  const sectionEls = useRef({}); // id -> element
  const [active, setActive] = useState(sections[0]?.id);
  const clickScrolling = useRef(false);

  const registerSection = useCallback((id, el) => {
    if (el) sectionEls.current[id] = el;
    else delete sectionEls.current[id];
  }, []);

  // Scroll-spy: the section whose top is nearest below the nav bar wins.
  const handleScroll = useCallback(() => {
    if (clickScrolling.current) return;
    const container = scrollRef.current;
    if (!container) return;
    const top = container.getBoundingClientRect().top;
    let current = sections[0]?.id;
    for (const s of sections) {
      const el = sectionEls.current[s.id];
      if (!el) continue;
      // 120px offset so a section becomes "active" a little before its top hits the nav.
      if (el.getBoundingClientRect().top - top <= 120) current = s.id;
    }
    setActive(current);
  }, [sections]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollTo = (id) => {
    const el = sectionEls.current[id];
    const container = scrollRef.current;
    if (!el || !container) return;
    setActive(id);
    clickScrolling.current = true;
    const offsetTop = el.offsetTop - 16;
    container.scrollTo({ top: offsetTop, behavior: "smooth" });
    // Re-enable scroll-spy once the smooth scroll settles.
    window.setTimeout(() => { clickScrolling.current = false; }, 600);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-default">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-default">
        <div className="flex items-center gap-2.5 min-w-0">
          <button onClick={onBack} className="p-1 -ml-1 rounded-lg hover:bg-action-hover text-muted transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-ink tracking-tight truncate">{title}</h1>
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>

      {/* Section nav */}
      <div className="px-8 border-b border-border bg-default">
        <div className="flex items-center gap-7 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`relative py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                active === s.id ? "text-primary" : "text-disabled hover:text-muted"
              }`}
            >
              {s.label}
              {active === s.id && (
                <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scrolling body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-24">
          {typeof children === "function" ? children({ registerSection }) : children}
        </div>
      </div>
    </div>
  );
}

// A registered form section. Renders the white card + heading and reports its
// element to the parent shell for scroll-spy.
export function FormSection({ id, title, registerSection, children }) {
  const ref = useRef(null);
  useEffect(() => {
    registerSection?.(id, ref.current);
    return () => registerSection?.(id, null);
  }, [id, registerSection]);

  return (
    <section ref={ref} className="bg-surface rounded-2xl border border-border shadow-2 p-6 scroll-mt-4">
      <h2 className="text-base font-bold text-ink mb-5">{title}</h2>
      {children}
    </section>
  );
}
