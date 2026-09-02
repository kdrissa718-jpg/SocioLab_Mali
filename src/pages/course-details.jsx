import { useParams, Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

function getVideoEmbedUrl(url) {
  if (!url) return "";
  if (url.includes("youtu.be/")) return url.replace("youtu.be/", "youtube.com/embed/");
  if (url.includes("youtube.com/watch?v=")) return url.replace("watch?v=", "embed/");
  if (url.includes("vimeo.com/") && !url.includes("player.vimeo.com")) {
    return `https://player.vimeo.com/video/${url.split("/").pop()}`;
  }
  return url;
}

function CourseDetails() {
  const { id } = useParams();
  const { courses, enrolledCourseIds, enrollCourse, completedLessons, toggleLesson, getCourseProgress, language, translations } = useAppContext();
  const content = translations[language];
  const course = courses.find((item) => item.id === Number(id));

  if (!course) {
    return (
      <section className="page-section reveal-section">
        <h1>{content.courseDetails.notFoundTitle}</h1>
        <p>{content.courseDetails.notFoundDescription}</p>
        <Link to="/courses" className="secondary-link">
          {content.common.backToCatalog}
        </Link>
      </section>
    );
  }

  const isEnrolled = enrolledCourseIds.includes(course.id);
  const videoEmbedUrl = getVideoEmbedUrl(course.videoUrl);
  const isUploadedVideo = course.videoSource === "upload";

  return (
    <section className="page-section page-card reveal-section">
      <div className="course-detail-header">
        <div>
          <span className="eyebrow">{course.category}</span>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
        </div>
        <div className="course-detail-meta">
          <div>
            <strong>{course.lessons}</strong>
            <span>{content.courseDetails.lessonsLabel}</span>
          </div>
          <div>
            <strong>{course.duration}</strong>
            <span>{content.courseDetails.durationLabel}</span>
          </div>
          <div>
            <strong>{course.students}</strong>
            <span>{content.courseDetails.studentsLabel}</span>
          </div>
        </div>
      </div>
      {(course.imageUrl || videoEmbedUrl) && (
        <section className="course-media">
          {course.imageUrl && <img src={course.imageUrl} alt={`${content.courseDetails.mediaAlt} ${course.title}`} />}
          {isUploadedVideo ? <video controls src={course.videoUrl}>{content.courseDetails.browserUnsupported}</video> : videoEmbedUrl && <iframe src={videoEmbedUrl} title={`${content.courseDetails.videoAlt} ${course.title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
        </section>
      )}
      <div className="course-detail-actions">
        <button className={isEnrolled ? "btn btn-ghost" : "btn btn-primary"} onClick={() => enrollCourse(course.id)}>
          {isEnrolled ? content.common.alreadyEnrolled : content.common.register}
        </button>
        <Link to="/courses" className="secondary-link">
          Retour au catalogue
        </Link>
      </div>
      <section className="fieldwork-callout">
        <div><span className="eyebrow">{content.courseDetails.practiceLabel}</span><h2>{content.courseDetails.fieldworkTitle} {course.fieldwork?.concept}</h2><p>{content.courseDetails.fieldworkDescription}</p></div>
        <Link className="btn btn-secondary" to="/fieldwork">{content.courseDetails.fieldworkCta}</Link>
      </section>
      <section className="curriculum-section">
        <div className="panel-header"><div><span className="eyebrow">{content.courseDetails.curriculumTitle}</span><h2>{content.courseDetails.curriculumSubtitle}</h2></div>{isEnrolled && <strong>{getCourseProgress(course)}% {content.common.completed}</strong>}</div>
        <div className="curriculum-list">
          {course.modules.map((module) => (
            <article key={module.id} className="curriculum-module">
              {module.imageUrl && <img className="module-image" src={module.imageUrl} alt={`Illustration : ${module.title}`} />}
              <div className="module-heading"><h3>{module.title}</h3><span>{module.hours} h</span></div>
              {module.lessons.map((lesson, index) => {
                const lessonKey = `${module.id}-${index}`;
                return isEnrolled ? <label className="lesson-item" key={lessonKey}><input type="checkbox" checked={completedLessons.includes(lessonKey)} onChange={() => toggleLesson(lessonKey)} /><span>{lesson}</span></label> : <p className="lesson-preview" key={lessonKey}>{index + 1}. {lesson}</p>;
              })}
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default CourseDetails;
