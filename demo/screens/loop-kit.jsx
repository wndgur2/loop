// LOOP shared kit — Phone frame, chrome, icon/logo helpers, sample data.
// Loaded via Babel after React + loop-icons.js. Exports to window.
const { useState } = React;

// ---- icon ----------------------------------------------------------
function LIcon({ name, size = 24, color, style = {} }) {
  const svg = (window.LOOP_ICONS || {})[name] || "";
  return (
    <span
      style={{
        display: "inline-flex",
        flex: "none",
        width: size,
        height: size,
        color,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// ---- Loop logo: a soft closing-ring mark + wordmark ----------------
function LoopMark({
  h = 22,
  color = "var(--loop-ink)",
  warm = "var(--loop-warm)",
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: h * 0.42,
        color,
      }}
    >
      <svg width={h * 1.04} height={h} viewBox="0 0 26 25" fill="none">
        <path
          d="M13 3.2c5.1 0 9.3 3.9 9.3 8.8S18.1 20.8 13 20.8c-3.4 0-5.2-1.9-5.2-4.2s1.9-4.1 4.7-4.1c2.6 0 4.3 1.6 4.3 3.6"
          stroke={warm}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-brand)",
          fontWeight: 700,
          fontSize: h * 0.92,
          letterSpacing: "-0.02em",
          color,
        }}
      >
        Loop
      </span>
    </span>
  );
}

// ---- iOS status bar -------------------------------------------------
function StatusBar({ time = "9:41" }) {
  return (
    <div className="lp-status">
      <span className="lp-time">{time}</span>
      <span className="lp-status-glyphs">
        {/* cellular */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="7" width="3" height="5" rx="1" />
          <rect x="5" y="4.5" width="3" height="7.5" rx="1" />
          <rect x="10" y="2" width="3" height="10" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        {/* wifi */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <path d="M8.5 2.2c2.7 0 5.2 1 7 2.8l-1.3 1.4A7.8 7.8 0 0 0 8.5 4.1 7.8 7.8 0 0 0 2.8 6.4L1.5 5C3.3 3.2 5.8 2.2 8.5 2.2Z" />
          <path d="M8.5 6c1.5 0 2.9.6 4 1.6l-1.4 1.4a3.7 3.7 0 0 0-2.6-1 3.7 3.7 0 0 0-2.6 1L4.5 7.6A5.6 5.6 0 0 1 8.5 6Z" />
          <circle cx="8.5" cy="10.4" r="1.5" />
        </svg>
        {/* battery */}
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
          <rect
            x="0.6"
            y="0.6"
            width="22"
            height="11.8"
            rx="3.2"
            stroke="currentColor"
            strokeOpacity="0.4"
            strokeWidth="1.1"
          />
          <rect
            x="2.2"
            y="2.2"
            width="16.5"
            height="8.6"
            rx="2"
            fill="currentColor"
          />
          <path
            d="M24 4.3v4.4c1.1-.4 1.1-4 0-4.4Z"
            fill="currentColor"
            fillOpacity="0.5"
          />
        </svg>
      </span>
    </div>
  );
}

// ---- bottom tab bar -------------------------------------------------
const LOOP_TABS = [
  { id: "feedback", label: "Feedback", icon: "home" },
  { id: "reflect", label: "Reflect", icon: "loop" },
  { id: "insights", label: "Insights", icon: "chart" },
  { id: "settings", label: "Settings", icon: "settings" },
];
function TabBar({ active = "feedback" }) {
  return (
    <div className="lp-tabbar">
      {LOOP_TABS.map((t) => {
        const on = t.id === active;
        const col = on ? "var(--loop-warm-deep)" : "var(--loop-ink-4)";
        return (
          <button key={t.id} className="lp-tab">
            <LIcon
              name={on && t.icon === "home" ? "home-fill" : t.icon}
              size={24}
              color={col}
            />
            <span style={{ color: col, fontWeight: on ? 700 : 600 }}>
              {t.label}
            </span>
          </button>
        );
      })}
      <Indicator />
    </div>
  );
}
function Indicator() {
  return null;
}

// ---- Phone frame ----------------------------------------------------
// Renders status bar + children (flex column) + home indicator.
function Phone({ children, time = "9:41" }) {
  return (
    <div className="lp-phone">
      <StatusBar time={time} />
      {children}
      <div className="lp-home-ind" />
    </div>
  );
}

// ---- chat composer (shared) ----------------------------------------
function Composer({ placeholder = "What's on your mind today?" }) {
  return (
    <div className="lp-composer">
      <div className="lp-composer-inner">
        <LIcon name="sparkle" size={19} color="var(--loop-warm)" />
        <input readOnly placeholder={placeholder} />
        <button className="lp-send">
          <LIcon name="send" size={20} color="#fff" />
        </button>
      </div>
    </div>
  );
}

// ---- importance dots ----------------------------------------------
function Imp({ level = "mid" }) {
  return (
    <span className={"lp-imp " + level} title={level}>
      <i />
      <i />
      <i />
    </span>
  );
}

// ---- sub-goal (category) color accenting — all warm-neutral --------
const SUBGOALS = {
  Collaborating: "Collaborating",
  Communication: "Communication",
  "Product planning": "Product planning",
  "Eng sense": "Eng sense",
  "Decision making": "Decision making",
};

// ---- sample feedback data (PO career persona) ----------------------
const FEEDBACK = [
  {
    id: "f1",
    title: "I stayed quiet when I disagreed in planning",
    category: "Collaborating",
    importance: "high",
    internalized: false,
    date: "2 days ago",
    takeaways: 3,
    done: 0,
    tags: ["meeting", "speaking-up"],
    excerpt: "Held back an objection about scope, then it shipped and broke.",
  },
  {
    id: "f2",
    title: "Estimated the sprint without asking eng",
    category: "Product planning",
    importance: "mid",
    internalized: true,
    date: "4 days ago",
    takeaways: 2,
    done: 2,
    tags: ["estimation"],
    excerpt: "Committed a date in standup before checking feasibility.",
  },
  {
    id: "f3",
    title: "My design feedback was too vague to act on",
    category: "Communication",
    importance: "mid",
    internalized: false,
    date: "6 days ago",
    takeaways: 3,
    done: 1,
    tags: ["feedback", "design"],
    excerpt: "Said 'feels off' instead of naming the actual problem.",
  },
  {
    id: "f4",
    title: "Jumped to a solution before framing the problem",
    category: "Product planning",
    importance: "high",
    internalized: true,
    date: "1 week ago",
    takeaways: 3,
    done: 3,
    tags: ["problem-framing"],
    excerpt: "Pitched a feature before we agreed what we were solving.",
  },
];

Object.assign(window, {
  LIcon,
  LoopMark,
  StatusBar,
  TabBar,
  Phone,
  Composer,
  Imp,
  LOOP_TABS,
  SUBGOALS,
  FEEDBACK,
});
