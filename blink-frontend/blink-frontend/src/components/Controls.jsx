export default function Controls({
  platforms,
  categories,
  activePlatform,
  activeCategory,
  searchTerm,
  resultCount,
  onPlatformChange,
  onCategoryChange,
  onSearchChange,
}) {
  return (
    <section className="controls" id="browse">
      <div className="wrap">
        <div className="controls-head">
          <h2>The board</h2>
          <span id="resultCount">
            {resultCount} result{resultCount === 1 ? "" : "s"}
          </span>
        </div>

        <div className="search-row">
          <input
            type="search"
            placeholder="Search by title, skill, or platform…"
            aria-label="Search free courses"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <select
            aria-label="Filter by category"
            value={activeCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="pills">
          {platforms.map((p) => (
            <button
              key={p}
              type="button"
              className={"pill" + (p === activePlatform ? " active" : "")}
              aria-pressed={p === activePlatform}
              onClick={() => onPlatformChange(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
