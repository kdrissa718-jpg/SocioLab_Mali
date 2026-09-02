import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import heroImage from "../assets/hero.png";

function Courses() {
  const { courses, enrolledCourseIds, enrollCourse, language, translations } = useAppContext();
  const content = translations[language];

  return (
    <section className="page-section reveal-section">
      <div className="page-heading">
        <div>
          <span className="eyebrow">{content.courses.heading.eyebrow}</span>
          <h1>{content.courses.heading.title}</h1>
          <p>{content.courses.heading.description}</p>
        </div>
      </div>

      <div className="course-grid">
        {courses.map((course) => (
          <article key={course.id} className="course-card">
            <div className="course-card-meta">
              <span>{course.category}</span>
              <strong>{course.teacher}</strong>
            </div>
            <img
              className="catalog-course-image"
              src={course.imageUrl || heroImage}
              alt={`Illustration : ${course.category}`}
              onError={(event) => {
                event.currentTarget.src = heroImage;
              }}
            />
            <h2>{course.title}</h2>
            <p>{course.description}</p>
            <div className="course-card-footer">
              <Link to={`/course/${course.id}`} className="secondary-link">
                {content.courses.viewCourse}
              </Link>
              <button
                className={enrolledCourseIds.includes(course.id) ? "btn btn-ghost" : "btn btn-secondary"}
                onClick={() => enrollCourse(course.id)}
              >
                {enrolledCourseIds.includes(course.id) ? content.courses.enrolled : content.courses.enroll}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Courses;
