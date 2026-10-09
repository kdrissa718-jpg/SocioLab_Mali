import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { BookOpen, CheckCircle2, ClipboardCheck, Globe, GraduationCap, ImageUp, Layers3, LayoutDashboard, LogOut, Plus, Settings, UserRound, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/notification-bell";
import { getCategoryLabel } from "../i18n/translations";
import { getLocalizedCourse } from "../i18n/course-content";
import ThemeToggle from "../components/theme-toggle";

function InstructorDashboard() {
  const navigate = useNavigate();
  const { courses, publishedCourses, publishCourse, language, setLanguage, translations, learnerName, setLearnerName, learnerEmail, setLearnerEmail, profile, setProfile, signOut } = useAppContext();
  const content = translations[language];
  const settingsContent = content.instructorDashboard.settings;
  const instructorName = ["Enseignant SocioLab", "Enseignant SocioLab Mali"].includes(learnerName) ? "Enseignant SocioLab Mali" : learnerName;
  const emptyCourse = { title: "", titleEn: "", category: "Sociologie", description: "", descriptionEn: "", teacher: "", imageUrl: "", imageName: "", videoUrl: "", videoName: "", videoSource: "", pdfUrl: "", pdfName: "", pdfSource: "", fieldwork: { concept: "", conceptEn: "", prompts: [""], promptsEn: [""] }, modules: [{ title: "Module 1", titleEn: "", hours: 2, lessons: [""], lessonsEn: [""] }] };

   // creer une table pour les categories et cree un enum pour chaque categories sachant que elle peuvent tous avoir des sous categorie
  const categoryOptions = [ 
    { value: "Sociologie", label: content.instructorDashboard.form.categories.sociology },
    { value: "Psychologie", label: content.instructorDashboard.form.categories.psychology },
    { value: "Philosophie", label: content.instructorDashboard.form.categories.philosophy },
    { value: "Méthodologie", label: content.instructorDashboard.form.categories.methodology },
    { value: "Histoire", label: content.instructorDashboard.form.categories.history },
    { value: "Géographie", label: content.instructorDashboard.form.categories.geography },
    { value: "Anthropologie", label: content.instructorDashboard.form.categories.anthropology },
    { value: "Sciences politiques", label: content.instructorDashboard.form.categories.politicalScience },
    { value: "Économie", label: content.instructorDashboard.form.categories.economy },
    { value: "Communication", label: content.instructorDashboard.form.categories.communication },
    { value: "Éducation", label: content.instructorDashboard.form.categories.education },
  ];
  const [course, setCourse] = useState(emptyCourse);
  const [notice, setNotice] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [settingsForm, setSettingsForm] = useState({
    name: learnerName,
    email: learnerEmail,
    photoUrl: profile.photoUrl,
    photoName: profile.photoName,
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const published = courses.filter((item) => item.isPublished || publishedCourses.includes(item.id));
  const totalStudents = published.reduce((sum, item) => sum + item.students, 0);

  const updateModule = (index, field, value) => setCourse((current) => ({ ...current, modules: current.modules.map((module, i) => i === index ? { ...module, [field]: field === "hours" ? Number(value) : value } : module) }));
  const updateLesson = (moduleIndex, lessonIndex, value, isEnglish = false) => setCourse((current) => ({ ...current, modules: current.modules.map((module, i) => i === moduleIndex ? { ...module, [isEnglish ? "lessonsEn" : "lessons"]: module[isEnglish ? "lessonsEn" : "lessons"].map((lesson, j) => j === lessonIndex ? value : lesson) } : module) }));
  const addModule = () => setCourse((current) => ({ ...current, modules: [...current.modules, { title: `Module ${current.modules.length + 1}`, titleEn: "", hours: 2, lessons: [""], lessonsEn: [""] }] }));
  const addLesson = (moduleIndex) => setCourse((current) => ({ ...current, modules: current.modules.map((module, i) => i === moduleIndex ? { ...module, lessons: [...module.lessons, ""], lessonsEn: [...(module.lessonsEn || []), ""] } : module) }));
  const handleMediaFile = (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (type === "image") {
      if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
        setNotice("Choisissez une image plus petite que 10 Mo.");
        event.target.value = "";
        return;
      }
      const url = URL.createObjectURL(file);
      setCourse((current) => ({ ...current, imageUrl: url, imageName: file.name }));
      setNotice("");
      return;
    }

    if (type === "video") {
      if (!file.type.startsWith("video/") || file.size > 200 * 1024 * 1024) {
        setNotice("Choisissez une vidéo plus petite que 200 Mo.");
        event.target.value = "";
        return;
      }
      const url = URL.createObjectURL(file);
      setCourse((current) => ({ ...current, videoUrl: url, videoName: file.name, videoSource: "upload" }));
      setNotice("");
      return;
    }

    if (type === "pdf") {
      if (file.type !== "application/pdf" || file.size > 20 * 1024 * 1024) {
        setNotice("Choisissez un PDF plus petit que 20 Mo.");
        event.target.value = "";
        return;
      }
      const url = URL.createObjectURL(file);
      setCourse((current) => ({ ...current, pdfUrl: url, pdfName: file.name, pdfSource: "upload" }));
      setNotice("");
    }
  };
  const handleProfilePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setNotice(content.instructorDashboard.profilePhotoError);
      event.target.value = "";
      return;
    }
    const url = URL.createObjectURL(file);
    setSettingsForm((current) => ({ ...current, photoUrl: url, photoName: file.name }));
    setSettingsSaved(false);
  };

  const saveSettings = (event) => {
    event.preventDefault();
    const name = settingsForm.name.trim() || "Enseignant SocioLab";
    setLearnerName(name);
    setLearnerEmail(settingsForm.email.trim());
    setProfile((current) => ({
      ...current,
      name,
      photoUrl: settingsForm.photoUrl,
      photoName: settingsForm.photoName,
    }));
    setSettingsForm((current) => ({ ...current, name, email: settingsForm.email.trim() }));
    setSettingsSaved(true);
    setNotice("");
  };

  const submit = (event) => { event.preventDefault(); publishCourse(course); setCourse(emptyCourse); setNotice(content.instructorDashboard.noticeSuccess); };
  const handleSignOut = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  const focusCourseBuilder = () => { setActiveSection("builder"); document.getElementById("course-builder")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const focusCourses = () => { setActiveSection("courses"); document.getElementById("instructor-courses")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const focusOverview = () => { setActiveSection("overview"); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <section className="instructor-dashboard-shell">
      <aside className="instructor-sidebar" aria-label={settingsContent.navigationLabel}>
        <div className="instructor-sidebar-brand"><GraduationCap size={22} aria-hidden="true" /><span>{settingsContent.brand}</span></div>
        <nav className="instructor-sidebar-nav">
          <button className={activeSection === "overview" ? "active" : ""} type="button" onClick={focusOverview}><LayoutDashboard size={18} aria-hidden="true" />{settingsContent.dashboard}</button>
          <p>{settingsContent.teaching}</p>
          <button className={activeSection === "courses" ? "active" : ""} type="button" onClick={focusCourses}><BookOpen size={18} aria-hidden="true" />{settingsContent.courses}</button>
          <button className={activeSection === "builder" ? "active" : ""} type="button" onClick={focusCourseBuilder}><Plus size={18} aria-hidden="true" />{settingsContent.createCourse}</button>
        </nav>
        <div className="instructor-sidebar-bottom"><button className={activeSection === "settings" ? "active" : ""} type="button" onClick={() => setActiveSection("settings")}><Settings size={18} aria-hidden="true" />{settingsContent.settings}</button><button className="instructor-logout" type="button" onClick={handleSignOut}><LogOut size={18} aria-hidden="true" />{content.common.logout}</button></div>
      </aside>
      <div className="instructor-dashboard-content">
      {activeSection === "settings" ? (
        <section className="instructor-dashboard student-content-section">
          <div className="student-section-heading">
            <div><span className="eyebrow">{settingsContent.brand}</span><h1>{settingsContent.accountTitle}</h1><p>{settingsContent.accountDescription}</p></div>
          </div>
          <form className="student-settings instructor-settings" onSubmit={saveSettings}>
            <div className="student-profile-summary">
              <div className="student-avatar">{settingsForm.photoUrl ? <img src={settingsForm.photoUrl} alt="" /> : <span>{settingsForm.name.slice(0, 1).toUpperCase()}</span>}</div>
              <div><h2>{settingsForm.name || settingsContent.defaultName}</h2><p>{settingsForm.email || content.studentDashboard.settings.emailMissing}</p><span><CheckCircle2 size={16} aria-hidden="true" />{settingsContent.instructorProfile}</span></div>
            </div>
            <div className="student-settings-form">
              <h2>{settingsContent.profile}</h2>
              <p>{settingsContent.profileDescription}</p>
              <label className="student-photo-control" htmlFor="instructor-photo"><ImageUp size={18} aria-hidden="true" />{settingsContent.changePhoto}<input id="instructor-photo" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleProfilePhoto} /></label>
              {settingsForm.photoName && <small>{settingsForm.photoName}</small>}
              <label>{settingsContent.fullName}<input value={settingsForm.name} onChange={(event) => { setSettingsForm((current) => ({ ...current, name: event.target.value })); setSettingsSaved(false); }} /></label>
              <label>{settingsContent.email}<input type="email" value={settingsForm.email} onChange={(event) => { setSettingsForm((current) => ({ ...current, email: event.target.value })); setSettingsSaved(false); }} /></label>
              <label>{settingsContent.language}<select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="fr">Français</option><option value="en">English</option></select></label>
              {notice && <p className="login-note" role="alert">{notice}</p>}
              {settingsSaved && <p className="settings-saved" role="status">{settingsContent.saved}</p>}
              <button className="btn btn-primary" type="submit">{settingsContent.save}</button>
            </div>
            <div className="student-signout-panel">
              <div><h2>{settingsContent.security}</h2><p>{settingsContent.signOutDescription}</p></div>
              <button className="btn btn-outline dashboard-logout" type="button" onClick={handleSignOut}><LogOut size={18} aria-hidden="true" />{content.common.logout}</button>
            </div>
          </form>
        </section>
      ) : (
      <section className="instructor-dashboard">
      <header className="instructor-hero">
        <div className="instructor-hero-copy"><span className="eyebrow">{content.instructorDashboard.eyebrow}</span><h1>{content.instructorDashboard.title}</h1><p>{content.instructorDashboard.description}</p><p className="dashboard-welcome">{content.common.welcomeMessage.replace("{name}", instructorName)}</p></div>
        <div className="dashboard-heading-actions"><label className="dashboard-language-picker" aria-label={settingsContent.language}><Globe size={15} aria-hidden="true" /><select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="fr">FR</option><option value="en">EN</option></select></label><ThemeToggle /><NotificationBell audience="Enseignants" /><button className="profile-menu-trigger" type="button" onClick={() => setActiveSection("settings")} aria-label={settingsContent.openSettings} title={settingsContent.settings}>{profile.photoUrl ? <img src={profile.photoUrl} alt="" /> : <UserRound size={20} aria-hidden="true" />}</button></div>
      </header>
      <div className="dashboard-cards instructor-metrics">
        <article className="metric-card"><span className="instructor-metric-icon"><BookOpen size={20} aria-hidden="true" /></span><p>{content.instructorDashboard.publishedCourses}</p><strong>{published.length}</strong></article>
        <article className="metric-card"><span className="instructor-metric-icon"><UsersRound size={20} aria-hidden="true" /></span><p>{content.instructorDashboard.enrolledStudents}</p><strong>{totalStudents}</strong></article>
        <article className="metric-card"><span className="instructor-metric-icon"><ClipboardCheck size={20} aria-hidden="true" /></span><p>{content.instructorDashboard.proposedActivities}</p><strong>{published.reduce((sum, item) => sum + item.lessons, 0)}</strong></article>
      </div>
      <div className="instructor-main-grid">
        <section id="instructor-courses" className="section-panel instructor-courses-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">{content.instructorDashboard.publishedCourses}</span>
              <h2>{content.instructorDashboard.myCourses}</h2>
            </div>
            <button className="btn btn-secondary instructor-add-button" type="button" onClick={focusCourseBuilder}><Plus size={17} aria-hidden="true" />{settingsContent.createCourse}</button>
          </div>
          <div className="course-grid">
            {published.length ? published.map((item) => {
              const localizedCourse = getLocalizedCourse(item, language);
              return (
              <article key={item.id} className="course-card course-card--featured">
                <div className="course-card-meta">
                  <span>{getCategoryLabel(content, item.category)}</span>
                  <strong>{item.students} {content.common.students}</strong>
                </div>
                <div className="course-card-body">
                  <h3>{localizedCourse.title}</h3>
                  <p>{content.instructorDashboard.courseSummary.replace("{count}", item.modules.length).replace("{activities}", item.lessons).replace("{duration}", item.duration)}</p>
                </div>
                <div className="course-card-progress">
                  <div className="course-card-progress-header">
                    <span>{settingsContent.progress}</span>
                    <strong>{item.progress}%</strong>
                  </div>
                  <div className="progress-bar"><div style={{ width: `${item.progress}%` }} /></div>
                </div>
              </article>
              );
            }) : (
              <div className="instructor-empty-courses">
                <Layers3 size={28} aria-hidden="true" />
                <h3>{content.instructorDashboard.myCourses}</h3>
                <p>{settingsContent.createCourse}</p>
                <button className="btn btn-primary" type="button" onClick={focusCourseBuilder}><Plus size={17} aria-hidden="true" />{content.instructorDashboard.form.publish}</button>
              </div>
            )}
          </div>
        </section>
        <aside className="instructor-side-column">
          <section className="instructor-quick-panel"><span className="instructor-quick-icon"><Layers3 size={19} aria-hidden="true" /></span><div><h2>{content.instructorDashboard.createTitle}</h2><p>{content.instructorDashboard.form.mediaHelp}</p><button className="secondary-link text-button" type="button" onClick={focusCourseBuilder}>{settingsContent.createCourse} <span aria-hidden="true">→</span></button></div></section>
        </aside>
      </div>
      <section id="course-builder" className="workflow-card instructor-action"><div className="panel-header"><div><span className="eyebrow">{settingsContent.createCourse}</span><h2>{content.instructorDashboard.createTitle}</h2><p className="builder-intro">{content.instructorDashboard.description}</p></div></div>{notice && <p className="success-note">{notice}</p>}
        <form className="course-builder" onSubmit={submit}>
          <input required value={course.title} placeholder={content.instructorDashboard.form.titlePlaceholder} onChange={(event) => setCourse({ ...course, title: event.target.value })} />
          <label>{content.instructorDashboard.form.titleEnglishLabel}<input value={course.titleEn} placeholder={content.instructorDashboard.form.titleEnglishPlaceholder} onChange={(event) => setCourse({ ...course, titleEn: event.target.value })} /></label>
          <select value={course.category} onChange={(event) => setCourse({ ...course, category: event.target.value })}>{categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          <input required value={course.teacher} placeholder={content.instructorDashboard.form.teacherPlaceholder} onChange={(event) => setCourse({ ...course, teacher: event.target.value })} />
          <textarea required value={course.description} placeholder={content.instructorDashboard.form.descriptionPlaceholder} onChange={(event) => setCourse({ ...course, description: event.target.value })} />
          <label>{content.instructorDashboard.form.descriptionEnglishLabel}<textarea value={course.descriptionEn} placeholder={content.instructorDashboard.form.descriptionEnglishPlaceholder} onChange={(event) => setCourse({ ...course, descriptionEn: event.target.value })} /></label>
          <fieldset className="fieldwork-builder"><legend>{content.instructorDashboard.form.fieldworkLegend}</legend><input required value={course.fieldwork.concept} placeholder={content.instructorDashboard.form.fieldworkConceptPlaceholder} onChange={(event) => setCourse({ ...course, fieldwork: { ...course.fieldwork, concept: event.target.value } })} /><label>{content.instructorDashboard.form.fieldworkConceptEnglishLabel}<input value={course.fieldwork.conceptEn} placeholder={content.instructorDashboard.form.fieldworkConceptEnglishLabel} onChange={(event) => setCourse({ ...course, fieldwork: { ...course.fieldwork, conceptEn: event.target.value } })} /></label><input required value={course.fieldwork.prompts[0]} placeholder={content.instructorDashboard.form.fieldworkPromptPlaceholder} onChange={(event) => setCourse({ ...course, fieldwork: { ...course.fieldwork, prompts: [event.target.value] } })} /><label>{content.instructorDashboard.form.fieldworkPromptEnglishLabel}<input value={course.fieldwork.promptsEn[0]} placeholder={content.instructorDashboard.form.fieldworkPromptEnglishLabel} onChange={(event) => setCourse({ ...course, fieldwork: { ...course.fieldwork, promptsEn: [event.target.value] } })} /></label></fieldset>
          <fieldset className="media-section">
            <legend>{content.instructorDashboard.form.mediaLegend}</legend>
            <p className="media-help">{content.instructorDashboard.form.mediaHelp}</p>
            <div className="media-fields">
              <div className="media-card">
                <label htmlFor="course-image-file">{content.instructorDashboard.form.imageLabel}</label>
                <label className="upload-control" htmlFor="course-image-file"><span>{content.instructorDashboard.form.imageButton}</span><small>{content.instructorDashboard.form.imageHint}</small></label>
                <input id="course-image-file" className="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleMediaFile(event, "image")} />
                <span className="upload-file-name">{course.imageName || content.instructorDashboard.form.noFile}</span>
                <span className="media-divider">{content.instructorDashboard.form.linkOption}</span>
                <input type="url" value={course.imageName ? "" : course.imageUrl} placeholder={content.instructorDashboard.form.imageLinkPlaceholder} onChange={(event) => setCourse({ ...course, imageUrl: event.target.value, imageName: "" })} />
                {course.imageUrl && <img className="media-preview-image" src={course.imageUrl} alt={content.instructorDashboard.form.coverPreview} onError={(event) => { event.currentTarget.style.display = "none"; }} />}
              </div>
              <div className="media-card">
                <label htmlFor="course-video-file">{content.instructorDashboard.form.videoLabel}</label>
                <label className="upload-control" htmlFor="course-video-file"><span>{content.instructorDashboard.form.videoButton}</span><small>{content.instructorDashboard.form.videoHint}</small></label>
                <input id="course-video-file" className="visually-hidden" type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => handleMediaFile(event, "video")} />
                <span className="upload-file-name">{course.videoName || content.instructorDashboard.form.noFile}</span>
                <span className="media-divider">{content.instructorDashboard.form.linkOption}</span>
                <input type="url" value={course.videoName ? "" : course.videoUrl} placeholder={content.instructorDashboard.form.videoLinkPlaceholder} onChange={(event) => setCourse({ ...course, videoUrl: event.target.value, videoName: "", videoSource: "url" })} />
                {course.videoSource === "upload" && <video className="media-preview-video" controls src={course.videoUrl}>{content.instructorDashboard.form.browserUnsupported}</video>}
                {course.videoSource === "url" && course.videoUrl && <video className="media-preview-video" controls src={course.videoUrl}>{content.instructorDashboard.form.browserUnsupported}</video>}
              </div>
              <div className="media-card">
                <label htmlFor="course-pdf-file">{content.instructorDashboard.form.pdfLabel}</label>
                <label className="upload-control" htmlFor="course-pdf-file"><span>{content.instructorDashboard.form.pdfButton}</span><small>{content.instructorDashboard.form.pdfHint}</small></label>
                <input id="course-pdf-file" className="visually-hidden" type="file" accept="application/pdf" onChange={(event) => handleMediaFile(event, "pdf")} />
                <span className="upload-file-name">{course.pdfName || content.instructorDashboard.form.noFile}</span>
                <span className="media-divider">{content.instructorDashboard.form.linkOption}</span>
                <input type="url" value={course.pdfName ? "" : course.pdfUrl} placeholder={content.instructorDashboard.form.pdfLinkPlaceholder} onChange={(event) => setCourse({ ...course, pdfUrl: event.target.value, pdfName: "", pdfSource: "url" })} />
                {course.pdfUrl && (
                  <a className="pdf-preview-link" href={course.pdfUrl} target="_blank" rel="noreferrer">{content.instructorDashboard.form.openPdf}</a>
                )}
              </div>
            </div>
          </fieldset>
          {course.modules.map((module, moduleIndex) => <div className="builder-module" key={moduleIndex}>
            <label className="builder-module-field">
              <span>{content.instructorDashboard.form.moduleTitleLabel}</span>
              <input required value={module.title} onChange={(event) => updateModule(moduleIndex, "title", event.target.value)} />
            </label>
            <label className="builder-module-field">
              <span>{content.instructorDashboard.form.moduleTitleEnglishLabel}</span>
              <input value={module.titleEn} onChange={(event) => updateModule(moduleIndex, "titleEn", event.target.value)} />
            </label>
            <label className="builder-module-field builder-module-duration" htmlFor={`module-duration-${moduleIndex}`}>
              <span>{content.instructorDashboard.form.moduleHoursLabel}</span>
              <span className="builder-module-duration-input">
                <input id={`module-duration-${moduleIndex}`} required min="1" step="1" type="number" value={module.hours} onChange={(event) => updateModule(moduleIndex, "hours", event.target.value)} />
                <span>{content.instructorDashboard.form.moduleHoursUnit}</span>
              </span>
            </label>
            {module.lessons.map((lesson, lessonIndex) => <div className="builder-module-field" key={lessonIndex}><input required value={lesson} placeholder={content.instructorDashboard.form.lessonPlaceholder} onChange={(event) => updateLesson(moduleIndex, lessonIndex, event.target.value)} /><input value={module.lessonsEn?.[lessonIndex] || ""} placeholder={content.instructorDashboard.form.lessonEnglishPlaceholder} onChange={(event) => updateLesson(moduleIndex, lessonIndex, event.target.value, true)} /></div>)}
            <button type="button" className="secondary-link text-button" onClick={() => addLesson(moduleIndex)}>{content.instructorDashboard.form.addLesson}</button>
          </div>)}
          <button type="button" className="btn btn-secondary" onClick={addModule}>{content.instructorDashboard.form.addModule}</button><button className="btn btn-primary" type="submit">{content.instructorDashboard.form.publish}</button>
        </form>
      </section>
      </section>
      )}
      </div>
    </section>
  );
}

export default InstructorDashboard;
