// LOOP demo — assemble every screen into the gallery.
// Sections & variations mirror the original design canvas.

function LoopDemo() {
  return (
    <Gallery tagline="Self-feedback, closed into a loop. AI structures what you noticed, aligns it to your goal, and brings it back when it matters. Hi-fi screen designs — warm and calm, on the Wanted foundations.">
      <GallerySection
        title="Feedback home"
        subtitle="Status + list + always-on write input · 3 takes on layout & calm/crisp style"
      >
        <GalleryFrame label="A · Calm cards">
          <HomeCalm />
        </GalleryFrame>
        <GalleryFrame label="B · Quiet list (crisp)">
          <HomeQuiet />
        </GalleryFrame>
        <GalleryFrame label="C · Warm hero">
          <HomeHero />
        </GalleryFrame>
      </GallerySection>

      <GallerySection
        title="Chat with Loopie"
        subtitle="Write flow in progress — same engine, one tool · 3 interaction takes"
      >
        <GalleryFrame label="A · Warm bubbles + quick replies">
          <ChatBubbles />
        </GalleryFrame>
        <GalleryFrame label="B · Draft emerging + confirm chips">
          <ChatDraft />
        </GalleryFrame>
        <GalleryFrame label="C · Quiet journal">
          <ChatJournal />
        </GalleryFrame>
      </GallerySection>

      <GallerySection
        title="Feedback detail"
        subtitle="Canonical template + takeaway tracking · open loop vs closed (internalized)"
      >
        <GalleryFrame label="Open loop">
          <DetailOpen />
        </GalleryFrame>
        <GalleryFrame label="Closed loop">
          <DetailClosed />
        </GalleryFrame>
      </GallerySection>

      <GallerySection
        title="Retrospective"
        subtitle="App serves up what to revisit · 3 takes on the recommended-cards UX"
      >
        <GalleryFrame label="A · Stacked recommendations">
          <RetroStacked />
        </GalleryFrame>
        <GalleryFrame label="B · Single hero + chips">
          <RetroHero />
        </GalleryFrame>
        <GalleryFrame label="C · Reflection in progress">
          <RetroChat />
        </GalleryFrame>
      </GallerySection>
    </Gallery>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<LoopDemo />);
