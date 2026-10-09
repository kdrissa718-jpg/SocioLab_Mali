import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { getCategoryLabel } from "../i18n/translations";
import { getLocalizedCourse } from "../i18n/course-content";
import heroImage from "../assets/hero.png";

function Courses() {
  const { courses, publishedCourses, enrolledCourseIds, enrollCourse, language, translations } = useAppContext();
  const content = translations[language];
  const visibleCourses = courses.filter((course) => course.isPublished || publishedCourses.includes(course.id));

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
        {visibleCourses.map((course) => {
          const isNew = Boolean(course.isPublished || publishedCourses.includes(course.id));
          const localizedCourse = getLocalizedCourse(course, language);

          return (
          <article key={course.id} className="course-card">
            <div className="course-card-meta">
              <span>{getCategoryLabel(content, course.category)}</span>
              <strong>{course.teacher}</strong>
              {isNew && <span className="course-badge">{content.common.new}</span>}
            </div>
            <img
              className="catalog-course-image"
              src={course.imageUrl || heroImage}
              alt={`${language === "fr" ? "Illustration :" : "Illustration:"} ${getCategoryLabel(content, course.category)}`}
              onError={(event) => {
                event.currentTarget.src = heroImage;
              }}
            />
            <h2>{localizedCourse.title}</h2>
            <p>{localizedCourse.description}</p>
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
          );
        })}
      </div>
    </section>
  );
}

export default Courses;
