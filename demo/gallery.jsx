// LOOP demo gallery — a clean, scrollable replacement for the design-tool's
// pan/zoom canvas. Lays the phone screens out in labeled sections so the
// variations read top-to-bottom and compare side-by-side. The screens
// themselves are the original design components, untouched.

const PHONE_W = 384;
const PHONE_H = 820;

// One-time CSS for the gallery chrome (namespaced lpg-, on top of loop.css).
if (typeof document !== "undefined" && !document.getElementById("lpg-styles")) {
  const s = document.createElement("style");
  s.id = "lpg-styles";
  s.textContent = `
    .lpg-root {
      min-height: 100vh; background: #EFEBE5;
      padding-bottom: 96px;
      font-family: var(--font-sans); color: var(--loop-ink);
    }
    .lpg-head { max-width: 1180px; margin: 0 auto; padding: 56px 40px 4px; }
    .lpg-tagline {
      margin: 16px 0 0; max-width: 600px;
      font: 500 16px/1.65 var(--font-sans); color: var(--loop-ink-3);
    }
    .lpg-section { max-width: 1180px; margin: 0 auto; padding: 52px 40px 0; }
    .lpg-section-head { border-top: 1px solid var(--loop-line); padding-top: 28px; }
    .lpg-section-title {
      margin: 0; font: 700 25px/1.2 var(--font-sans); letter-spacing: -0.02em;
    }
    .lpg-section-sub {
      margin: 9px 0 0; font: 500 14px/1.5 var(--font-sans); color: var(--loop-ink-3);
    }
    .lpg-row { display: flex; flex-wrap: wrap; gap: 44px 40px; margin-top: 32px; }
    .lpg-item { display: flex; flex-direction: column; gap: 16px; }
    .lpg-frame {
      width: ${PHONE_W}px; height: ${PHONE_H}px;
      border-radius: 44px; overflow: hidden; flex: none;
      background: var(--loop-canvas);
      border: 1px solid rgba(60, 50, 42, 0.08);
      box-shadow:
        0 1px 2px rgba(60, 50, 42, 0.10),
        0 28px 56px -16px rgba(60, 50, 42, 0.24);
    }
    .lpg-label { padding: 0 6px; font: 600 14px/1.3 var(--font-sans); color: var(--loop-ink-2); }
    @media (max-width: 880px) { .lpg-row { justify-content: center; } }
  `;
  document.head.appendChild(s);
}

// Page shell — Loop wordmark + tagline, then the sections.
function Gallery({ tagline, children }) {
  return (
    <div className="lpg-root">
      <header className="lpg-head">
        <LoopMark h={32} />
        {tagline && <p className="lpg-tagline">{tagline}</p>}
      </header>
      {children}
    </div>
  );
}

// A labeled group of screen variations.
function GallerySection({ title, subtitle, children }) {
  return (
    <section className="lpg-section">
      <div className="lpg-section-head">
        <h2 className="lpg-section-title">{title}</h2>
        {subtitle && <p className="lpg-section-sub">{subtitle}</p>}
      </div>
      <div className="lpg-row">{children}</div>
    </section>
  );
}

// One phone screen in a device-like frame, with its variation label below.
function GalleryFrame({ label, children }) {
  return (
    <div className="lpg-item">
      <div className="lpg-frame">{children}</div>
      {label && <div className="lpg-label">{label}</div>}
    </div>
  );
}

Object.assign(window, { Gallery, GallerySection, GalleryFrame });
