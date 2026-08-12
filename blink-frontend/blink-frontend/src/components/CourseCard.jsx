export default function CourseCard({ course }) {
  const category = course.category || "General";
  const blurb =
    course.blurb ||
    `Live listing from ${course.partner ? course.partner + " via " : ""}${course.platform}.`;

  return (
    <article className="card">
      <div className="card-top">
        <span className="status">
          <span className="bulb"></span>
          {course.access || "Check on platform"}
        </span>
        <span className="platform-tag">{course.platform}</span>
      </div>
      <h3>{course.title}</h3>
      <p>{blurb}</p>
      <div className="meta-row">
        <span>{course.level || "Not specified"}</span>
        <span>{course.duration || "See course page"}</span>
      </div>
      <div className="card-cta">
        <span className="category-tag">{category}</span>
        <a className="grab" href={course.url} target="_blank" rel="noopener noreferrer">
          Grab it <span className="arrow">→</span>
        </a>
      </div>
    </article>
  );
}
