// LOOP — Retrospective (tab 2). Three takes on recommended-reflection cards.

function RetroHead({ sub = "A few loops worth revisiting" }) {
  return (
    <div style={{ padding: "6px 22px 14px" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            font: "700 24px/1 var(--font-sans)",
            letterSpacing: "-0.02em",
          }}
        >
          Reflect
        </span>
        <LIcon
          name="loop"
          size={21}
          color="var(--loop-warm)"
          style={{ marginLeft: 9 }}
        />
      </div>
      <div
        style={{
          font: "500 13px/1.4 var(--font-sans)",
          color: "var(--loop-ink-3)",
          marginTop: 6,
        }}
      >
        {sub}
      </div>
    </div>
  );
}

// little tag for card kind
function Kind({ icon, label, tone = "warm" }) {
  const c = tone === "warm" ? "var(--loop-warm-deep)" : "var(--loop-ink-3)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        font: "700 11px/1 var(--font-sans)",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: c,
      }}
    >
      <LIcon name={icon} size={14} color={c} /> {label}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════
// A · STACKED CARDS — three distinct recommendation types
// ════════════════════════════════════════════════════════════════════
function RetroStacked() {
  return (
    <Phone>
      <div className="lp-body lp-scroll" style={{ overflow: "hidden" }}>
        <RetroHead />
        <div
          style={{
            padding: "0 22px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* 1 · today's reflection (hero) */}
          <div
            className="lp-card"
            style={{
              borderRadius: 22,
              padding: "18px 19px",
              background: "var(--loop-warm-soft)",
              border: "1px solid var(--loop-warm-line)",
            }}
          >
            <Kind icon="sparkle" label="Today's reflection" />
            <div
              style={{
                font: "600 16px/1.45 var(--font-sans)",
                letterSpacing: "-0.008em",
                margin: "11px 0 7px",
              }}
            >
              That planning meeting where you stayed quiet — did a chance to
              speak up come around?
            </div>
            <div
              style={{
                font: "500 12.5px/1.4 var(--font-sans)",
                color: "var(--loop-ink-3)",
                marginBottom: 15,
              }}
            >
              Collaborating · High · open for 3 days
            </div>
            <button
              style={{
                width: "100%",
                height: 44,
                borderRadius: 13,
                border: "none",
                background: "var(--loop-warm)",
                color: "#fff",
                font: "700 14px/1 var(--font-sans)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
              }}
            >
              Reflect on this{" "}
              <LIcon name="arrow-right" size={17} color="#fff" />
            </button>
          </div>

          {/* 2 · came up again */}
          <div
            className="lp-card"
            style={{ borderRadius: 22, padding: "18px 19px" }}
          >
            <Kind icon="undo" label="This came up again" tone="neutral" />
            <div
              style={{
                font: "600 15px/1.45 var(--font-sans)",
                margin: "11px 0 11px",
              }}
            >
              Vague feedback to others — your{" "}
              <b style={{ color: "var(--loop-warm-deep)" }}>3rd loop</b> in
              Communication.
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 4,
              }}
            >
              {[
                "My design feedback was too vague to act on",
                "Couldn't explain why the doc felt off",
              ].map((t) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    font: "500 12.5px/1.4 var(--font-sans)",
                    color: "var(--loop-ink-2)",
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 9999,
                      background: "var(--loop-warm)",
                      flex: "none",
                    }}
                  />{" "}
                  {t}
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 13,
                font: "700 13px/1 var(--font-sans)",
                color: "var(--loop-warm-deep)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              See the pattern{" "}
              <LIcon
                name="chevron-right"
                size={16}
                color="var(--loop-warm-deep)"
              />
            </div>
          </div>

          {/* 3 · revisit an area */}
          <div
            className="lp-card"
            style={{
              borderRadius: 22,
              padding: "16px 19px",
              display: "flex",
              alignItems: "center",
              gap: 15,
            }}
          >
            <Ring value={0.6} size={52} stroke={6}>
              <span
                style={{
                  font: "700 12px/1 var(--font-sans)",
                  color: "var(--loop-ink-2)",
                }}
              >
                3/5
              </span>
            </Ring>
            <div style={{ flex: 1 }}>
              <Kind icon="target" label="Revisit an area" tone="neutral" />
              <div
                style={{ font: "600 15px/1.35 var(--font-sans)", marginTop: 7 }}
              >
                Collaborating
              </div>
              <div
                style={{
                  font: "500 12px/1.3 var(--font-sans)",
                  color: "var(--loop-ink-4)",
                  marginTop: 3,
                }}
              >
                2 loops still open
              </div>
            </div>
            <LIcon name="chevron-right" size={20} color="var(--loop-ink-4)" />
          </div>
        </div>
      </div>
      <Composer placeholder="Or tell me what to revisit…" />
      <TabBar active="reflect" />
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════════════
// B · SINGLE HERO — one focal reflection + quieter suggestion chips
// ════════════════════════════════════════════════════════════════════
function RetroHero() {
  return (
    <Phone>
      <div className="lp-body lp-scroll" style={{ overflow: "hidden" }}>
        <RetroHead sub="Let's start with one." />
        <div style={{ padding: "2px 22px 18px" }}>
          {/* focal card */}
          <div
            style={{
              borderRadius: 26,
              padding: "24px 22px",
              background: "linear-gradient(165deg,#F7E9DA,#FBF1E8)",
              border: "1px solid var(--loop-warm-line)",
              marginBottom: 22,
            }}
          >
            <Kind icon="sparkle" label="Today's reflection" />
            <div
              style={{
                font: "700 22px/1.4 var(--font-sans)",
                letterSpacing: "-0.018em",
                margin: "14px 0 12px",
              }}
            >
              You noticed you stay quiet when you're not certain.
            </div>
            <div
              style={{
                font: "500 14px/1.6 var(--font-sans)",
                color: "var(--loop-ink-2)",
                marginBottom: 20,
              }}
            >
              It's been a few days. Want to look at whether a moment to test
              that came up — and how it went?
            </div>
            <button
              style={{
                width: "100%",
                height: 48,
                borderRadius: 14,
                border: "none",
                background: "var(--loop-warm)",
                color: "#fff",
                font: "700 15px/1 var(--font-sans)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <LIcon name="loop" size={19} color="#fff" /> Start reflecting
            </button>
          </div>

          <div className="lp-eyebrow" style={{ marginBottom: 13 }}>
            Or pick up another
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { i: "undo", t: "Vague feedback — came up 3× in Communication" },
              { i: "target", t: "Revisit Collaborating — 2 loops open" },
              { i: "clock", t: "An old loop from 3 weeks ago" },
            ].map((c) => (
              <div
                key={c.t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "13px 16px",
                  background: "var(--loop-surface)",
                  border: "1px solid var(--loop-line-soft)",
                  borderRadius: 15,
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9999,
                    background: "var(--loop-warm-soft)",
                    flex: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LIcon name={c.i} size={17} color="var(--loop-warm-deep)" />
                </span>
                <span
                  style={{
                    flex: 1,
                    font: "600 13.5px/1.4 var(--font-sans)",
                    color: "var(--loop-ink-2)",
                  }}
                >
                  {c.t}
                </span>
                <LIcon
                  name="chevron-right"
                  size={18}
                  color="var(--loop-ink-4)"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Composer placeholder="Or tell me what to revisit…" />
      <TabBar active="reflect" />
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════════════
// C · CONVERSATIONAL — reflection in progress, commit via confirm chips
// ════════════════════════════════════════════════════════════════════
function RetroChat() {
  return (
    <Phone>
      <div
        style={{
          flex: "none",
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: "2px 18px 13px",
          borderBottom: "1px solid var(--loop-line-soft)",
        }}
      >
        <button
          style={{
            border: "none",
            background: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          <LIcon name="chevron-left" size={24} color="var(--loop-ink-2)" />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ font: "700 15px/1.1 var(--font-sans)" }}>
            Reflecting
          </div>
          <div
            style={{
              font: "600 11px/1 var(--font-sans)",
              color: "var(--loop-warm-deep)",
              marginTop: 3,
            }}
          >
            Collaborating · 1 open loop
          </div>
        </div>
        <LIcon name="loop" size={20} color="var(--loop-warm)" />
      </div>
      <div
        className="lp-body lp-scroll"
        style={{
          overflow: "hidden",
          padding: "16px 16px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 13,
        }}
      >
        {/* quoted feedback the retro is about */}
        <div
          style={{
            alignSelf: "center",
            maxWidth: 280,
            background: "var(--loop-surface)",
            border: "1px solid var(--loop-line-soft)",
            borderRadius: 14,
            padding: "11px 14px",
          }}
        >
          <div className="lp-eyebrow" style={{ marginBottom: 5, fontSize: 10 }}>
            Revisiting · May 29
          </div>
          <div
            style={{
              font: "600 13px/1.45 var(--font-sans)",
              color: "var(--loop-ink-2)",
            }}
          >
            "I stayed quiet when I disagreed in planning."
          </div>
        </div>

        <Coach>
          It's been a few days since this one. Has a moment come up where you
          could test voicing a half-formed doubt?
        </Coach>
        <User>
          Actually yeah — standup yesterday, I said "this might be wrong but…"
          and flagged a risk.
        </User>
        <Coach>That's exactly the takeaway in action. How did it land?</Coach>
        <User>Fine! No one minded it being half-formed.</User>
        <Coach>Then this loop might be closing. Want me to mark it?</Coach>

        {/* confirm chips — commit only on tap (sensitive data) */}
        <div
          style={{
            display: "flex",
            gap: 9,
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              background: "var(--loop-good)",
              color: "#fff",
              borderRadius: 9999,
              padding: "10px 16px",
              font: "700 13px/1 var(--font-sans)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <LIcon name="check-sm" size={15} color="#fff" /> Mark internalized
          </span>
          <span
            style={{
              border: "1.4px solid var(--loop-line)",
              color: "var(--loop-ink-2)",
              background: "var(--loop-surface)",
              borderRadius: 9999,
              padding: "10px 16px",
              font: "600 13px/1 var(--font-sans)",
            }}
          >
            Not yet
          </span>
        </div>
      </div>
      <TypingComposer value="" />
      <TabBar active="reflect" />
    </Phone>
  );
}

Object.assign(window, { RetroStacked, RetroHero, RetroChat });
