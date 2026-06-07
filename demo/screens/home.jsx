// LOOP — Feedback home (tab 1). Three takes on list layout + calm/crisp style.
// Each is a full phone: status · body · write-composer · tab bar.

// ---- circular progress ring (subtle loop motif) --------------------
function Ring({ value = 0.62, size = 92, stroke = 9, color = "var(--loop-warm)",
                track = "var(--loop-ring-track)", children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value)} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

// ---- internalized badge / takeaway progress ------------------------
function Internalized() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 24, padding: "0 9px 0 7px",
                   borderRadius: 9999, background: "var(--loop-good-soft)", color: "var(--loop-good)",
                   font: "700 11.5px/1 var(--font-sans)", letterSpacing: "0.01em" }}>
      <LIcon name="check-sm" size={13} color="var(--loop-good)" /> Internalized
    </span>
  );
}
function TakeawayProgress({ done, total }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "600 11.5px/1 var(--font-sans)",
                   color: "var(--loop-ink-3)" }}>
      <span style={{ display: "inline-flex", gap: 3 }}>
        {Array.from({ length: total }).map((_, i) => (
          <i key={i} style={{ width: 14, height: 4, borderRadius: 9999,
                              background: i < done ? "var(--loop-warm)" : "var(--loop-line)" }} />
        ))}
      </span>
      {done}/{total} done
    </span>
  );
}

function CategoryChip({ name }) {
  return <span className="lp-chip" style={{ background: "var(--loop-warm-soft)", color: "var(--loop-warm-deep)" }}>{name}</span>;
}

// ════════════════════════════════════════════════════════════════════
// A · CALM CARDS — airy rounded cards, warm-tinted hero
// ════════════════════════════════════════════════════════════════════
function HomeCalm() {
  return (
    <Phone>
      <div className="lp-body lp-scroll" style={{ overflow: "hidden" }}>
        <div style={{ padding: "6px 22px 20px" }}>
          {/* top bar */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 22 }}>
            <LoopMark h={21} />
            <button style={{ marginLeft: "auto", border: "none", background: "none", padding: 4, cursor: "pointer" }}>
              <LIcon name="bell" size={23} color="var(--loop-ink-3)" />
            </button>
          </div>

          {/* hero — internalization rate */}
          <div className="lp-card" style={{ padding: "20px 22px", borderRadius: 24, display: "flex",
                gap: 18, alignItems: "center", background: "linear-gradient(180deg,#FFFCF9,#FFFFFF)" }}>
            <Ring value={0.62} size={96} stroke={9}>
              <span style={{ font: "700 25px/1 var(--font-sans)", letterSpacing: "-0.02em" }}>62<span style={{ fontSize: 14, fontWeight: 700, color: "var(--loop-ink-4)" }}>%</span></span>
            </Ring>
            <div>
              <div className="lp-eyebrow" style={{ marginBottom: 7 }}>Internalized</div>
              <div style={{ font: "600 15px/1.45 var(--font-sans)", color: "var(--loop-ink-2)", marginBottom: 10 }}>
                8 of 13 loops closed.<br/>You're building something.
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "600 12px/1 var(--font-sans)", color: "var(--loop-warm-deep)" }}>
                <LIcon name="target" size={15} color="var(--loop-warm-deep)" /> Toward: Product Owner
              </div>
            </div>
          </div>

          {/* list header */}
          <div style={{ display: "flex", alignItems: "baseline", margin: "26px 0 14px" }}>
            <span style={{ font: "700 18px/1 var(--font-sans)", letterSpacing: "-0.01em" }}>Your feedback</span>
            <span style={{ marginLeft: 8, font: "600 13px/1 var(--font-sans)", color: "var(--loop-ink-4)" }}>13</span>
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, font: "600 12.5px/1 var(--font-sans)", color: "var(--loop-ink-3)" }}>
              All <LIcon name="chevron-down" size={15} color="var(--loop-ink-4)" />
            </span>
          </div>

          {/* feedback cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FEEDBACK.slice(0, 3).map((f) => (
              <div key={f.id} className="lp-card" style={{ padding: "16px 17px", borderRadius: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                  <CategoryChip name={f.category} />
                  <Imp level={f.importance} />
                  <span style={{ marginLeft: "auto", font: "500 11.5px/1 var(--font-sans)", color: "var(--loop-ink-4)" }}>{f.date}</span>
                </div>
                <div style={{ font: "600 15.5px/1.4 var(--font-sans)", letterSpacing: "-0.006em", marginBottom: 5 }}>{f.title}</div>
                <div style={{ font: "500 13px/1.5 var(--font-sans)", color: "var(--loop-ink-3)", marginBottom: 12,
                              display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{f.excerpt}</div>
                <div style={{ display: "flex", alignItems: "center", borderTop: "1px solid var(--loop-line-soft)", paddingTop: 11 }}>
                  {f.internalized ? <Internalized /> : <TakeawayProgress done={f.done} total={f.takeaways} />}
                  <LIcon name="chevron-right" size={17} color="var(--loop-ink-4)" style={{ marginLeft: "auto" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Composer />
      <TabBar active="feedback" />
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════════════
// B · QUIET LIST — crisper, denser rows, hairline dividers
// ════════════════════════════════════════════════════════════════════
function HomeQuiet() {
  const impBar = { high: "var(--loop-warm)", mid: "var(--loop-ink-4)", low: "var(--loop-line)" };
  return (
    <Phone>
      <div className="lp-body lp-scroll" style={{ overflow: "hidden" }}>
        <div style={{ padding: "8px 22px 4px" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
            <span style={{ font: "700 24px/1 var(--font-sans)", letterSpacing: "-0.02em" }}>Feedback</span>
            <button style={{ marginLeft: "auto", border: "none", background: "none", padding: 4, cursor: "pointer" }}>
              <LIcon name="bell" size={22} color="var(--loop-ink-3)" />
            </button>
          </div>
          {/* slim internalization bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span className="lp-eyebrow">Internalized · 8 of 13</span>
                <span style={{ font: "700 12px/1 var(--font-sans)", color: "var(--loop-warm-deep)" }}>62%</span>
              </div>
              <div style={{ height: 7, borderRadius: 9999, background: "var(--loop-ring-track)", overflow: "hidden" }}>
                <div style={{ width: "62%", height: "100%", borderRadius: 9999, background: "var(--loop-warm)" }} />
              </div>
            </div>
          </div>
        </div>
        {/* dense rows */}
        <div style={{ padding: "10px 0 0" }}>
          {FEEDBACK.map((f, i) => (
            <div key={f.id} style={{ display: "flex", gap: 13, padding: "15px 22px",
                  borderTop: i === 0 ? "1px solid var(--loop-line-soft)" : "none",
                  borderBottom: "1px solid var(--loop-line-soft)" }}>
              <div style={{ width: 3, borderRadius: 9999, background: impBar[f.importance], flex: "none", marginTop: 2, alignSelf: "stretch" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                  <span style={{ font: "700 11px/1 var(--font-sans)", color: "var(--loop-warm-deep)", letterSpacing: "0.01em" }}>{f.category}</span>
                  <span style={{ width: 3, height: 3, borderRadius: 9999, background: "var(--loop-ink-4)" }} />
                  <span style={{ font: "500 11px/1 var(--font-sans)", color: "var(--loop-ink-4)" }}>{f.date}</span>
                  {f.internalized && <LIcon name="check-sm" size={14} color="var(--loop-good)" style={{ marginLeft: "auto" }} />}
                </div>
                <div style={{ font: "600 14.5px/1.4 var(--font-sans)", letterSpacing: "-0.005em" }}>{f.title}</div>
                {!f.internalized && (
                  <div style={{ marginTop: 8 }}><TakeawayProgress done={f.done} total={f.takeaways} /></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Composer placeholder="What happened today?" />
      <TabBar active="feedback" />
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════════════
// C · WARM HERO — big ring focal, magazine warmth, fewest items
// ════════════════════════════════════════════════════════════════════
function HomeHero() {
  return (
    <Phone>
      <div className="lp-body lp-scroll" style={{ overflow: "hidden", background: "var(--loop-warm-soft)" }}>
        <div style={{ padding: "10px 24px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 26 }}>
            <LoopMark h={20} />
            <span style={{ marginLeft: "auto", font: "600 12px/1 var(--font-sans)", color: "var(--loop-ink-4)" }}>Tue, May 31</span>
          </div>
          {/* big hero ring */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 26 }}>
            <Ring value={0.62} size={168} stroke={13}>
              <span style={{ font: "700 46px/1 var(--font-sans)", letterSpacing: "-0.03em" }}>62<span style={{ fontSize: 20, color: "var(--loop-ink-4)" }}>%</span></span>
              <span className="lp-eyebrow" style={{ marginTop: 4 }}>Internalized</span>
            </Ring>
            <div style={{ font: "600 16px/1.55 var(--font-sans)", color: "var(--loop-ink-2)", marginTop: 18, maxWidth: 260 }}>
              You've closed 8 of 13 loops on the way to <span style={{ color: "var(--loop-warm-deep)", fontWeight: 700 }}>Product Owner</span>.
            </div>
          </div>
        </div>
        {/* recent — minimal cards on white sheet */}
        <div style={{ background: "var(--loop-surface)", borderRadius: "26px 26px 0 0", padding: "22px 24px 26px",
              boxShadow: "0 -2px 20px rgba(60,50,42,0.05)", minHeight: 220 }}>
          <div style={{ display: "flex", alignItems: "baseline", marginBottom: 16 }}>
            <span style={{ font: "700 16px/1 var(--font-sans)" }}>Open loops</span>
            <span style={{ marginLeft: "auto", font: "600 12.5px/1 var(--font-sans)", color: "var(--loop-warm-deep)" }}>See all 5</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {FEEDBACK.filter((f) => !f.internalized).map((f) => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <Ring value={f.done / f.takeaways} size={42} stroke={5} color="var(--loop-warm)">
                  <span style={{ font: "700 11px/1 var(--font-sans)", color: "var(--loop-ink-3)" }}>{f.done}/{f.takeaways}</span>
                </Ring>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "600 14px/1.35 var(--font-sans)", marginBottom: 3,
                                display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{f.title}</div>
                  <div style={{ font: "600 11px/1 var(--font-sans)", color: "var(--loop-warm-deep)" }}>{f.category}</div>
                </div>
                <LIcon name="chevron-right" size={18} color="var(--loop-ink-4)" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Composer placeholder="A moment that stayed with you?" />
      <TabBar active="feedback" />
    </Phone>
  );
}

Object.assign(window, { Ring, Internalized, TakeawayProgress, CategoryChip, HomeCalm, HomeQuiet, HomeHero });
