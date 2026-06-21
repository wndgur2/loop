// LOOP — Feedback detail (canonical template + takeaways). Open vs closed loop.

function DetailHeader() {
  return (
    <div
      style={{
        flex: "none",
        display: "flex",
        alignItems: "center",
        padding: "2px 16px 12px",
      }}
    >
      <button
        style={{
          border: "none",
          background: "none",
          padding: 4,
          cursor: "pointer",
        }}
      >
        <LIcon name="chevron-left" size={24} color="var(--loop-ink-2)" />
      </button>
      <span style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
        <button
          style={{
            border: "none",
            background: "none",
            padding: 4,
            cursor: "pointer",
          }}
        >
          <LIcon name="edit" size={21} color="var(--loop-ink-3)" />
        </button>
        <button
          style={{
            border: "none",
            background: "none",
            padding: 4,
            cursor: "pointer",
          }}
        >
          <LIcon name="more" size={22} color="var(--loop-ink-3)" />
        </button>
      </span>
    </div>
  );
}

function MetaRow({ children, label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 0",
        borderBottom: "1px solid var(--loop-line-soft)",
      }}
    >
      <span
        style={{
          font: "600 12.5px/1 var(--font-sans)",
          color: "var(--loop-ink-4)",
          width: 84,
          flex: "none",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function Takeaway({ text, done }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "13px 0",
      }}
    >
      <span className={"lp-check" + (done ? " done" : "")}>
        {done && <LIcon name="check-sm" size={14} color="#fff" />}
      </span>
      <span
        style={{
          font: "500 14px/1.5 var(--font-sans)",
          color: done ? "var(--loop-ink-4)" : "var(--loop-ink)",
          textDecoration: done ? "line-through" : "none",
          paddingTop: 1,
          flex: 1,
        }}
      >
        {text}
      </span>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="lp-eyebrow" style={{ marginBottom: 9, marginTop: 24 }}>
      {children}
    </div>
  );
}

const TAKEAWAYS = [
  "Name it as a question: \u201cCan I pressure-test the scope before we lock it?\u201d",
  "Write the doubt in one line before the meeting ends — even if half-formed",
  "Say \u201cthis might be wrong, but\u2026\u201d to lower the bar for voicing it",
];

// ════════════════════════════════════════════════════════════════════
// A · OPEN LOOP — partly done, prompt to internalize
// ════════════════════════════════════════════════════════════════════
function DetailOpen() {
  return (
    <Phone>
      <DetailHeader />
      <div
        className="lp-body lp-scroll"
        style={{ overflow: "hidden", padding: "0 22px 16px" }}
      >
        {/* status pill */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 26,
            padding: "0 12px 0 10px",
            borderRadius: 9999,
            background: "var(--loop-warm-soft)",
            color: "var(--loop-warm-deep)",
            font: "700 11.5px/1 var(--font-sans)",
            letterSpacing: "0.02em",
            marginBottom: 14,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 9999,
              background: "var(--loop-warm)",
            }}
          />{" "}
          OPEN LOOP
        </span>
        <h1
          style={{
            font: "700 23px/1.34 var(--font-sans)",
            letterSpacing: "-0.018em",
            margin: "0 0 4px",
          }}
        >
          I stayed quiet when I disagreed in planning
        </h1>

        <MetaRow label="Sub-goal">
          <span
            className="lp-chip"
            style={{
              background: "var(--loop-warm-soft)",
              color: "var(--loop-warm-deep)",
            }}
          >
            <LIcon name="target" size={13} color="var(--loop-warm-deep)" />{" "}
            Collaborating
          </span>
        </MetaRow>
        <MetaRow label="Importance">
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 7 }}
          >
            <Imp level="high" />
            <span
              style={{
                font: "600 13px/1 var(--font-sans)",
                color: "var(--loop-ink-2)",
              }}
            >
              High
            </span>
          </span>
        </MetaRow>
        <MetaRow label="Created">
          <span
            style={{
              font: "600 13px/1 var(--font-sans)",
              color: "var(--loop-ink-2)",
            }}
          >
            May 29, 2026 · 2 days ago
          </span>
        </MetaRow>

        <SectionLabel>Feedback</SectionLabel>
        <p
          style={{
            font: "500 14.5px/1.65 var(--font-sans)",
            color: "var(--loop-ink-2)",
            margin: 0,
          }}
        >
          In sprint planning I thought the scope was too big for one cycle, but
          I didn't say anything. It shipped late and we cut two things at the
          end.
        </p>

        <SectionLabel>Root cause</SectionLabel>
        <p
          style={{
            font: "500 14.5px/1.65 var(--font-sans)",
            color: "var(--loop-ink-2)",
            margin: 0,
          }}
        >
          I doubted a half-formed objection and the room was moving fast — so
          silence felt safer than an imperfect point.
        </p>

        <SectionLabel>Takeaways · 1 of 3</SectionLabel>
        <div style={{ borderTop: "1px solid var(--loop-line-soft)" }}>
          <Takeaway text={TAKEAWAYS[0]} done={true} />
          <div style={{ borderTop: "1px solid var(--loop-line-soft)" }}>
            <Takeaway text={TAKEAWAYS[1]} done={false} />
          </div>
          <div style={{ borderTop: "1px solid var(--loop-line-soft)" }}>
            <Takeaway text={TAKEAWAYS[2]} done={false} />
          </div>
        </div>

        <SectionLabel>Tags</SectionLabel>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {["meeting", "speaking-up"].map((t) => (
            <span key={t} className="lp-chip">
              <LIcon name="tag" size={12} color="var(--loop-ink-3)" /> {t}
            </span>
          ))}
        </div>
      </div>
      {/* footer action */}
      <div
        style={{
          flex: "none",
          padding: "10px 22px 8px",
          display: "flex",
          gap: 10,
          background:
            "linear-gradient(to top, var(--loop-canvas) 70%, rgba(250,248,245,0))",
        }}
      >
        <button
          style={{
            flex: "none",
            width: 50,
            height: 50,
            borderRadius: 16,
            border: "1px solid var(--loop-line)",
            background: "var(--loop-surface)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LIcon name="check" size={22} color="var(--loop-good)" />
        </button>
        <button
          style={{
            flex: 1,
            height: 50,
            borderRadius: 16,
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
          <LIcon name="loop" size={19} color="#fff" /> Reflect on this
        </button>
      </div>
      <div className="lp-home-ind" />
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════════════
// B · CLOSED LOOP — internalized, calm completion
// ════════════════════════════════════════════════════════════════════
function DetailClosed() {
  return (
    <Phone>
      <DetailHeader />
      <div
        className="lp-body lp-scroll"
        style={{ overflow: "hidden", padding: "0 22px 16px" }}
      >
        {/* closed banner */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--loop-good-soft)",
            borderRadius: 16,
            padding: "13px 16px",
            marginBottom: 18,
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 9999,
              background: "var(--loop-good)",
              flex: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LIcon name="check" size={19} color="#fff" />
          </span>
          <div>
            <div
              style={{
                font: "700 13px/1.1 var(--font-sans)",
                color: "var(--loop-good)",
              }}
            >
              Loop closed
            </div>
            <div
              style={{
                font: "500 11.5px/1.3 var(--font-sans)",
                color: "var(--loop-ink-3)",
                marginTop: 2,
              }}
            >
              Internalized in your last reflection.
            </div>
          </div>
        </div>

        <h1
          style={{
            font: "700 23px/1.34 var(--font-sans)",
            letterSpacing: "-0.018em",
            margin: "0 0 4px",
          }}
        >
          Jumped to a solution before framing the problem
        </h1>

        <MetaRow label="Sub-goal">
          <span
            className="lp-chip"
            style={{
              background: "var(--loop-warm-soft)",
              color: "var(--loop-warm-deep)",
            }}
          >
            <LIcon name="target" size={13} color="var(--loop-warm-deep)" />{" "}
            Product planning
          </span>
        </MetaRow>
        <MetaRow label="Importance">
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 7 }}
          >
            <Imp level="high" />
            <span
              style={{
                font: "600 13px/1 var(--font-sans)",
                color: "var(--loop-ink-2)",
              }}
            >
              High
            </span>
          </span>
        </MetaRow>
        <MetaRow label="Internalized">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              font: "600 13px/1 var(--font-sans)",
              color: "var(--loop-good)",
            }}
          >
            <LIcon name="check-sm" size={15} color="var(--loop-good)" /> Yes ·
            Jun 4
          </span>
        </MetaRow>

        <SectionLabel>Feedback</SectionLabel>
        <p
          style={{
            font: "500 14.5px/1.65 var(--font-sans)",
            color: "var(--loop-ink-2)",
            margin: 0,
          }}
        >
          I pitched a whole feature in the kickoff before we'd agreed what
          problem we were solving. Half the room was solving different things.
        </p>

        <SectionLabel>Root cause</SectionLabel>
        <p
          style={{
            font: "500 14.5px/1.65 var(--font-sans)",
            color: "var(--loop-ink-2)",
            margin: 0,
          }}
        >
          Excitement to contribute outran the discipline of framing. Solutions
          feel productive; framing feels slow.
        </p>

        <SectionLabel>Takeaways · 3 of 3 done</SectionLabel>
        <div style={{ borderTop: "1px solid var(--loop-line-soft)" }}>
          {[
            "Open with the problem statement, not the idea",
            "Ask \u201cwhat are we actually solving?\u201d before pitching",
            "Keep solutions in a parking lot until framing lands",
          ].map((t, i) => (
            <div
              key={i}
              style={{
                borderTop: i ? "1px solid var(--loop-line-soft)" : "none",
              }}
            >
              <Takeaway text={t} done={true} />
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          flex: "none",
          padding: "10px 22px 8px",
          display: "flex",
          gap: 10,
          background:
            "linear-gradient(to top, var(--loop-canvas) 70%, rgba(250,248,245,0))",
        }}
      >
        <button
          style={{
            flex: 1,
            height: 50,
            borderRadius: 16,
            border: "1px solid var(--loop-line)",
            background: "var(--loop-surface)",
            color: "var(--loop-ink-2)",
            font: "700 15px/1 var(--font-sans)",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <LIcon name="undo" size={18} color="var(--loop-ink-3)" /> Reopen loop
        </button>
        <button
          style={{
            flex: 1,
            height: 50,
            borderRadius: 16,
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
          <LIcon name="loop" size={19} color="#fff" /> Reflect
        </button>
      </div>
      <div className="lp-home-ind" />
    </Phone>
  );
}

Object.assign(window, { DetailOpen, DetailClosed });
