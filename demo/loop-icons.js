// LOOP icon registry — calm, rounded stroke glyphs (24×24, currentColor).
// Stroke-based for a softer, airier feel than Wanted's filled set.
// Active tab variants are filled where noted. window.LOOP_ICONS[name] -> svg string.
(function () {
  const S = (inner, opts = {}) =>
    `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="${opts.fill || 'none'}" ` +
    `stroke="${opts.stroke === false ? 'none' : 'currentColor'}" stroke-width="${opts.w || 1.8}" ` +
    `stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

  window.LOOP_ICONS = {
    // nav
    home: S('<path d="M4 10.5 12 4l8 6.5"/><path d="M5.5 9.5V19a1 1 0 0 0 1 1H10v-5a2 2 0 0 1 4 0v5h3.5a1 1 0 0 0 1-1V9.5"/>'),
    "home-fill": S('<path d="M4 10.5 12 4l8 6.5"/><path d="M5.5 9.3V19a1 1 0 0 0 1 1H10v-5a2 2 0 0 1 4 0v5h3.5a1 1 0 0 0 1-1V9.3" fill="currentColor"/>', { w: 1.6 }),
    // loop / retrospective — circular arrows
    loop: S('<path d="M19.5 11A7.5 7.5 0 0 0 6.4 6.3L4.5 8"/><path d="M4.5 13A7.5 7.5 0 0 0 17.6 17.7L19.5 16"/><path d="M4.5 4v4h4"/><path d="M19.5 20v-4h-4"/>'),
    chart: S('<path d="M4 20h16"/><path d="M7 20v-6"/><path d="M12 20V8"/><path d="M17 20v-9"/>'),
    settings: S('<path d="M4 7h10"/><path d="M18 7h2"/><circle cx="16" cy="7" r="2"/><path d="M4 17h2"/><path d="M10 17h10"/><circle cx="8" cy="17" r="2"/>'),
    // actions
    send: S('<path d="M12 19V6"/><path d="M6.5 11.5 12 6l5.5 5.5"/>'),
    plus: S('<path d="M12 5v14M5 12h14"/>'),
    check: S('<path d="M5 12.5 10 17.5 19 7"/>', { w: 2 }),
    "check-sm": S('<path d="M5 12.5 10 17.5 19 7"/>', { w: 2.4 }),
    close: S('<path d="M6 6l12 12M18 6 6 18"/>'),
    more: S('<circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/>'),
    edit: S('<path d="M14.5 5.5l4 4L9 19l-4.5.5L5 15z"/><path d="M13 7l4 4"/>'),
    // chevrons / arrows
    "chevron-right": S('<path d="M9 5l7 7-7 7"/>', { w: 2 }),
    "chevron-left": S('<path d="M15 5l-7 7 7 7"/>', { w: 2 }),
    "chevron-down": S('<path d="M5 9l7 7 7-7"/>', { w: 2 }),
    "arrow-right": S('<path d="M4 12h15"/><path d="M13 6l6 6-6 6"/>'),
    // meaning
    sparkle: S('<path d="M12 4c.5 3.5 1.5 4.5 5 5-3.5.5-4.5 1.5-5 5-.5-3.5-1.5-4.5-5-5 3.5-.5 4.5-1.5 5-5Z" fill="currentColor" stroke="none"/><path d="M18.5 13.5c.25 1.6.75 2.1 2.3 2.4-1.55.3-2.05.8-2.3 2.4-.25-1.6-.75-2.1-2.3-2.4 1.55-.3 2.05-.8 2.3-2.4Z" fill="currentColor" stroke="none"/>'),
    target: S('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>'),
    flag: S('<path d="M6 21V4"/><path d="M6 4.5h10.5l-2 3.5 2 3.5H6"/>'),
    clock: S('<circle cx="12" cy="12" r="8"/><path d="M12 8v4.3l2.8 1.7"/>'),
    tag: S('<path d="M4 11.5V5.5a1.5 1.5 0 0 1 1.5-1.5h6L20 12.5a1.5 1.5 0 0 1 0 2.1l-5.4 5.4a1.5 1.5 0 0 1-2.1 0L4 11.5Z"/><circle cx="8.2" cy="8.2" r="1.1" fill="currentColor" stroke="none"/>'),
    bell: S('<path d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 2 6H4.5c.5-.5 2-2 2-6Z"/><path d="M9.5 19a2.5 2.5 0 0 0 5 0"/>'),
    undo: S('<path d="M9 7 4.5 11 9 15"/><path d="M4.5 11H14a5 5 0 0 1 0 10h-2"/>'),
  };
})();
