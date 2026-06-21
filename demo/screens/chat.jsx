// LOOP — Chat with Loopie (write flow, in progress). Three interaction takes.

function CoachAvatar({ size = 30 }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        flex: "none",
        background: "var(--loop-warm-soft)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 26 25"
        fill="none"
      >
        <path
          d="M13 3.2c5.1 0 9.3 3.9 9.3 8.8S18.1 20.8 13 20.8c-3.4 0-5.2-1.9-5.2-4.2s1.9-4.1 4.7-4.1c2.6 0 4.3 1.6 4.3 3.6"
          stroke="var(--loop-warm)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function ChatHeader({ title = "Loopie", sub }) {
  return (
    <div
      style={{
        flex: "none",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "4px 18px 14px",
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
        <div
          style={{
            font: "700 15.5px/1.1 var(--font-sans)",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </div>
        {sub && (
          <div
            style={{
              font: "600 11.5px/1 var(--font-sans)",
              color: "var(--loop-ink-4)",
              marginTop: 3,
            }}
          >
            {sub}
          </div>
        )}
      </div>
      <button
        style={{
          border: "none",
          background: "var(--loop-fill)",
          width: 30,
          height: 30,
          borderRadius: 9999,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LIcon name="close" size={18} color="var(--loop-ink-3)" />
      </button>
    </div>
  );
}

// coach bubble (warm tint, left) + user bubble (right)
function Coach({ children, avatar = true }) {
  return (
    <div style={{ display: "flex", gap: 9, alignItems: "flex-end" }}>
      {avatar ? <CoachAvatar /> : <span style={{ width: 30, flex: "none" }} />}
      <div
        style={{
          background: "var(--loop-warm-soft)",
          color: "var(--loop-ink)",
          borderRadius: "18px 18px 18px 6px",
          padding: "11px 15px",
          font: "500 14px/1.5 var(--font-sans)",
          maxWidth: 250,
        }}
      >
        {children}
      </div>
    </div>
  );
}
function User({ children }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div
        style={{
          background: "var(--loop-warm)",
          color: "#fff",
          borderRadius: "18px 18px 6px 18px",
          padding: "11px 15px",
          font: "500 14px/1.5 var(--font-sans)",
          maxWidth: 250,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function TypingComposer({
  value = "Probably yeah — I just talked myself out of it",
}) {
  return (
    <div className="lp-composer">
      <div
        className="lp-composer-inner"
        style={{ borderColor: "var(--loop-warm-line)" }}
      >
        <input readOnly value={value} style={{ color: "var(--loop-ink)" }} />
        <button className="lp-send">
          <LIcon name="send" size={20} color="#fff" />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// A · WARM BUBBLES — guided question + quick replies
// ════════════════════════════════════════════════════════════════════
function ChatBubbles() {
  return (
    <Phone>
      <ChatHeader title="New feedback" sub="Loopie · draws on all your loops" />
      <div
        className="lp-body lp-scroll"
        style={{
          overflow: "hidden",
          padding: "18px 18px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            textAlign: "center",
            font: "600 11px/1 var(--font-sans)",
            color: "var(--loop-ink-4)",
            marginBottom: 2,
          }}
        >
          Today, 9:38 PM
        </div>
        <Coach>Hey — what's on your mind from today?</Coach>
        <User>
          I didn't speak up in planning even though I disagreed with the scope.
        </User>
        <Coach>
          That takes honesty to notice. What held you back in the moment?
        </Coach>
        <User>
          I wasn't fully sure I was right, and the room was moving fast.
        </User>
        <Coach>
          So a bit of doubt, plus speed. If you'd felt certain — would you have
          said it?
        </Coach>
        {/* quick replies */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 2,
          }}
        >
          {["Probably, yeah", "Still maybe not", "Hard to say"].map((q) => (
            <span
              key={q}
              style={{
                border: "1.4px solid var(--loop-warm-line)",
                color: "var(--loop-warm-deep)",
                background: "var(--loop-surface)",
                borderRadius: 9999,
                padding: "8px 14px",
                font: "600 12.5px/1 var(--font-sans)",
                cursor: "pointer",
              }}
            >
              {q}
            </span>
          ))}
        </div>
      </div>
      <TypingComposer />
      <div className="lp-home-ind" style={{ marginTop: -4 }} />
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════════════
// B · DRAFT EMERGING — chat + live canonical-template card + confirm chips
// ════════════════════════════════════════════════════════════════════
function ChatDraft() {
  return (
    <Phone>
      <ChatHeader
        title="New feedback"
        sub="Loop is structuring what you shared"
      />
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
        <Coach>
          Then maybe the block isn't courage — it's needing a way to voice a
          half-formed doubt out loud. I'll turn this into a feedback you can act
          on. Look right?
        </Coach>

        {/* draft card forming */}
        <div
          className="lp-card"
          style={{
            borderRadius: 18,
            overflow: "hidden",
            border: "1.4px solid var(--loop-warm-line)",
          }}
        >
          <div
            style={{
              background: "var(--loop-warm-soft)",
              padding: "10px 15px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <LIcon name="sparkle" size={16} color="var(--loop-warm-deep)" />
            <span
              style={{
                font: "700 12px/1 var(--font-sans)",
                color: "var(--loop-warm-deep)",
                letterSpacing: "0.02em",
              }}
            >
              DRAFT FEEDBACK
            </span>
            <span
              style={{
                marginLeft: "auto",
                font: "600 11px/1 var(--font-sans)",
                color: "var(--loop-ink-4)",
              }}
            >
              editable
            </span>
          </div>
          <div style={{ padding: "14px 16px" }}>
            <div
              style={{
                font: "700 15px/1.4 var(--font-sans)",
                letterSpacing: "-0.006em",
                marginBottom: 11,
              }}
            >
              I stayed quiet when I disagreed in planning
            </div>
            <div
              style={{
                display: "flex",
                gap: 7,
                flexWrap: "wrap",
                marginBottom: 14,
              }}
            >
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
              <span className="lp-chip">
                <Imp level="high" /> High
              </span>
              <span className="lp-chip">
                <LIcon name="tag" size={12} color="var(--loop-ink-3)" />{" "}
                speaking-up
              </span>
            </div>
            <div className="lp-eyebrow" style={{ marginBottom: 7 }}>
              Root cause
            </div>
            <div
              style={{
                font: "500 12.5px/1.55 var(--font-sans)",
                color: "var(--loop-ink-2)",
                marginBottom: 14,
              }}
            >
              Doubt about a half-formed objection + a fast room → silence by
              default.
            </div>
            <div className="lp-eyebrow" style={{ marginBottom: 9 }}>
              Takeaways
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {[
                "Name it as a question: \u201cCan I pressure-test the scope?\u201d",
                "Write the doubt in one line before the meeting ends",
                "Flag half-formed thoughts as half-formed — say so",
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 9 }}>
                  <span
                    className="lp-check"
                    style={{ width: 18, height: 18, borderRadius: 6 }}
                  />
                  <span
                    style={{
                      font: "500 12.5px/1.4 var(--font-sans)",
                      color: "var(--loop-ink)",
                    }}
                  >
                    {t}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* confirm chips — commit only on tap */}
        <div style={{ display: "flex", gap: 9, justifyContent: "flex-end" }}>
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
            Tweak it
          </span>
          <span
            style={{
              background: "var(--loop-warm)",
              color: "#fff",
              borderRadius: 9999,
              padding: "10px 18px",
              font: "700 13px/1 var(--font-sans)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <LIcon name="check-sm" size={15} color="#fff" /> Save feedback
          </span>
        </div>
      </div>
      <TypingComposer value="Looks right — maybe soften the last one" />
      <div className="lp-home-ind" style={{ marginTop: -4 }} />
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════════════
// C · QUIET JOURNAL — airy, container-less, coach as soft prompts
// ════════════════════════════════════════════════════════════════════
function ChatJournal() {
  return (
    <Phone>
      <div
        style={{
          flex: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "2px 22px 16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <CoachAvatar size={26} />
          <span style={{ font: "700 14px/1 var(--font-sans)" }}>Loop</span>
        </div>
        <button
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <LIcon name="close" size={22} color="var(--loop-ink-4)" />
        </button>
      </div>
      <div
        className="lp-body lp-scroll"
        style={{
          overflow: "hidden",
          padding: "6px 26px",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <div>
          <div
            style={{
              font: "600 16px/1.5 var(--font-sans)",
              color: "var(--loop-warm-deep)",
              marginBottom: 0,
            }}
          >
            What's on your mind from today?
          </div>
        </div>
        <div
          style={{
            paddingLeft: 14,
            borderLeft: "2px solid var(--loop-warm-line)",
          }}
        >
          <div
            style={{
              font: "500 15px/1.6 var(--font-sans)",
              color: "var(--loop-ink)",
            }}
          >
            I didn't speak up in planning even though I disagreed with the
            scope.
          </div>
        </div>
        <div
          style={{
            font: "600 16px/1.55 var(--font-sans)",
            color: "var(--loop-warm-deep)",
          }}
        >
          That takes honesty to notice. What held you back in the moment?
        </div>
        <div
          style={{
            paddingLeft: 14,
            borderLeft: "2px solid var(--loop-warm-line)",
          }}
        >
          <div
            style={{
              font: "500 15px/1.6 var(--font-sans)",
              color: "var(--loop-ink)",
            }}
          >
            I wasn't sure I was right, and the room was moving fast.
          </div>
        </div>
        <div
          style={{
            font: "600 16px/1.55 var(--font-sans)",
            color: "var(--loop-warm-deep)",
          }}
        >
          So speed, plus a little doubt. Have you noticed this before?
          <span
            style={{
              display: "block",
              marginTop: 8,
              font: "500 12.5px/1.5 var(--font-sans)",
              color: "var(--loop-ink-4)",
            }}
          >
            This is your 3rd loop in Collaborating this month.
          </span>
        </div>
      </div>
      <TypingComposer value="" />
      <div className="lp-home-ind" style={{ marginTop: -4 }} />
    </Phone>
  );
}

Object.assign(window, {
  CoachAvatar,
  ChatHeader,
  Coach,
  User,
  ChatBubbles,
  ChatDraft,
  ChatJournal,
});
