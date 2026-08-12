export default function Hero({ courses, liveStatus, freshCount }) {
  const total = courses.length;
  const platformCount = new Set(courses.map((c) => c.platform)).size;

  const tickerSource = courses.slice(0, 12);
  const tickerContent = [...tickerSource, ...tickerSource].map((c, i) => (
    <span key={i}>
      <b>FREE</b> · {c.title} — {c.platform}
    </span>
  ));

  let eyebrowText = "Live free-course board · updated weekly";
  if (liveStatus === "live") {
    eyebrowText = `Live board · ${freshCount} fresh listing${freshCount === 1 ? "" : "s"} just synced`;
  }

  return (
    <section className="hero">
      <div className="wrap">
        <div className="board">
          <div className="board-inner">
            <div className="eyebrow">
              <span className="bulb"></span> {eyebrowText}
            </div>
            <h1 className="headline">
              Free courses
              <br />
              <span className="hl">don't stay lit</span> for long.
            </h1>
            <p className="sub">
              Blink rounds up courses that are free right now across Coursera, Udemy, edX and more — so you
              can grab one before the free window closes.
            </p>
            <div className="hero-actions">
              <a href="#browse" className="btn-primary">Browse the board</a>
              <a href="#how" className="btn-ghost">How we track "free"</a>
            </div>
            <div className="marquee">
              <div className="marquee-track">{tickerContent}</div>
            </div>
          </div>
        </div>

        <div className="stats">
          <div className="stat"><b>{total}</b><span>Free finds listed</span></div>
          <div className="stat"><b>{platformCount}</b><span>Platforms tracked</span></div>
          <div className="stat"><b>Weekly</b><span>Board refresh</span></div>
          <div className="stat"><b>$0</b><span>Cost to browse</span></div>
        </div>
      </div>
    </section>
  );
}
