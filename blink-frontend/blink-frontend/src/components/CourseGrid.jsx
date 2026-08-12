import CourseCard from "./CourseCard.jsx";

export default function CourseGrid({ courses }) {
  return (
    <div className="wrap">
      <div className="grid">
        {courses.map((course, i) => (
          <CourseCard key={course.id || `${course.platform}-${course.title}-${i}`} course={course} />
        ))}
      </div>
      <div className={"empty" + (courses.length === 0 ? " show" : "")}>
        No blinking matches. Try clearing a filter — the board refills fast.
      </div>
    </div>
  );
}
