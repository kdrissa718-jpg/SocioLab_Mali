import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { UserRound, X } from "lucide-react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

function InstructorDashboard() {
  const navigate = useNavigate();
  const { courses, publishedCourses, publishCourse, language, translations, learnerName, profile, setProfile, signOut } = useAppContext();
  const content = translations[language];
  const emptyCourse = { title: "", category: content.instructorDashboard.form.categories.sociology, description: "", teacher: "", imageUrl: "", imageName: "", videoUrl: "", videoName: "", videoSource: "", pdfUrl: "", pdfName: "", pdfSource: "", fieldwork: { concept: "", prompts: [""] }, modules: [{ title: "Module 1", hours: 2, lessons: [""] }] };

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
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: profile.name,
    photoUrl: profile.photoUrl,
    photoName: profile.photoName,
    emoji: profile.emoji,
    description: profile.description,
    address: profile.address,
  }); 
  const published = courses.filter((item) => item.isPublished || publishedCourses.includes(item.id));
  const totalStudents = published.reduce((sum, item) => sum + item.students, 0);

  const updateModule = (index, field, value) => setCourse((current) => ({ ...current, modules: current.modules.map((module, i) => i === index ? { ...module, [field]: field === "hours" ? Number(value) : value } : module) }));
  const updateLesson = (moduleIndex, lessonIndex, value) => setCourse((current) => ({ ...current, modules: current.modules.map((module, i) => i === moduleIndex ? { ...module, lessons: module.lessons.map((lesson, j) => j === lessonIndex ? value : lesson) } : module) }));
  const addModule = () => setCourse((current) => ({ ...current, modules: [...current.modules, { title: `Module ${current.modules.length + 1}`, hours: 2, lessons: [""] }] }));
  const addLesson = (moduleIndex) => setCourse((current) => ({ ...current, modules: current.modules.map((module, i) => i === moduleIndex ? { ...module, lessons: [...module.lessons, ""] } : module) }));
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
    setProfileForm((current) => ({ ...current, photoUrl: url, photoName: file.name }));
    setNotice("");
  };

  const saveProfile = (event) => {
    event.preventDefault();
    setProfile(profileForm);
    setNotice(content.instructorDashboard.profileSaved);
    setIsProfileEditorOpen(false);
  };

  const submit = (event) => { event.preventDefault(); publishCourse(course); setCourse(emptyCourse); setNotice(content.instructorDashboard.noticeSuccess); };
  const handleSignOut = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  return (
    <section className="page-section">
      <div className="page-heading"><div><span className="eyebrow">{content.instructorDashboard.eyebrow}</span><h1>{content.instructorDashboard.title}</h1><p>{content.instructorDashboard.description}</p><p className="dashboard-welcome">{content.common.welcomeMessage.replace("{name}", learnerName)}</p></div><div className="dashboard-heading-actions"><button className="profile-menu-trigger" type="button" onClick={() => setIsProfileEditorOpen(true)} aria-label="Modifier mon profil" title="Modifier mon profil">{profile.photoUrl ? <img src={profile.photoUrl} alt="" /> : <UserRound size={20} aria-hidden="true" />}</button><button className="btn btn-outline dashboard-logout" type="button" onClick={handleSignOut}><LogOut size={18} aria-hidden="true" />{content.common.logout}</button></div></div>
      <div className="dashboard-cards">
        <article className="metric-card"><p>{content.instructorDashboard.publishedCourses}</p><strong>{published.length}</strong></article>
        <article className="metric-card"><p>{content.instructorDashboard.enrolledStudents}</p><strong>{totalStudents}</strong></article>
        <article className="metric-card"><p>{content.instructorDashboard.proposedActivities}</p><strong>{published.reduce((sum, item) => sum + item.lessons, 0)}</strong></article>
      </div>
      <section className="section-panel"><div className="panel-header"><h2>{content.instructorDashboard.myCourses}</h2></div><div className="course-grid">{published.map((item) => <article key={item.id} className="course-card"><div className="course-card-meta"><span>{item.category}</span><strong>{item.students} {content.common.students}</strong></div><h2>{item.title}</h2><p>{content.instructorDashboard.courseSummary.replace("{count}", item.modules.length).replace("{activities}", item.lessons).replace("{duration}", item.duration)}</p><div className="progress-bar"><div style={{ width: `${item.progress}%` }} /></div></article>)}</div></section>
      {isProfileEditorOpen && (
        <div className="profile-modal-backdrop" role="presentation" onMouseDown={() => setIsProfileEditorOpen(false)}>
          <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="panel-header"><div><span className="eyebrow">{content.instructorDashboard.profileSectionLabel}</span><h2 id="profile-modal-title">{content.instructorDashboard.profileTitle}</h2></div><button className="modal-close-button" type="button" onClick={() => setIsProfileEditorOpen(false)} aria-label="Fermer" title="Fermer"><X size={20} aria-hidden="true" /></button></div>
            {notice && <p className="success-note">{notice}</p>}
            <form className="profile-editor" onSubmit={saveProfile}>
          <div className="profile-form-panel">
            <div className="profile-field">
              <label htmlFor="profile-photo">{content.instructorDashboard.profilePhotoLabel}</label>
              <label className="upload-control" htmlFor="profile-photo"><span>{content.instructorDashboard.profilePhotoButton}</span><small>{content.instructorDashboard.profilePhotoHint}</small></label>
              <input id="profile-photo" className="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleProfilePhoto} />
              <span className="upload-file-name">{profileForm.photoName || content.instructorDashboard.form.noFile}</span>
            </div>
            <div className="profile-field">
              <label htmlFor="profile-name">Nom affiché</label>
              <input id="profile-name" value={profileForm.name || learnerName} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} placeholder={learnerName} />
            </div>
            <div className="profile-field">
              <label htmlFor="profile-emoji">{content.instructorDashboard.profileEmojiLabel}</label>
              <input id="profile-emoji" value={profileForm.emoji} onChange={(event) => setProfileForm((current) => ({ ...current, emoji: event.target.value }))} placeholder="👩‍🏫" />
            </div>
            <div className="profile-field">
              <label htmlFor="profile-description">{content.instructorDashboard.profileDescriptionLabel}</label>
              <textarea id="profile-description" value={profileForm.description} onChange={(event) => setProfileForm((current) => ({ ...current, description: event.target.value }))} placeholder={content.instructorDashboard.profileDescriptionPlaceholder} />
            </div>
            <div className="profile-field">
              <label htmlFor="profile-address">{content.instructorDashboard.profileAddressLabel}</label>
              <input id="profile-address" value={profileForm.address} onChange={(event) => setProfileForm((current) => ({ ...current, address: event.target.value }))} placeholder={content.instructorDashboard.profileAddressPlaceholder} />
            </div>
            <button className="btn btn-primary" type="submit">{content.instructorDashboard.profileSave}</button>
          </div>
          <aside className="profile-preview-panel">
            <div className="profile-preview-meta">
              <div className="profile-avatar">{profileForm.photoUrl ? <img src={profileForm.photoUrl} alt={learnerName} /> : <span>{profileForm.emoji || "👩‍🏫"}</span>}</div>
              <div>
                <h3>{profileForm.name || learnerName}</h3>
                <p>{content.instructorDashboard.profilePreviewSubtitle}</p>
              </div>
            </div>
            <p className="profile-preview-description">{profileForm.description || content.instructorDashboard.profileDescriptionPlaceholder}</p>
            <p className="profile-preview-address">📍 {profileForm.address || content.instructorDashboard.profileAddressPlaceholder}</p>
          </aside>
            </form>
          </section>
        </div>
      )}
      <section className="workflow-card instructor-action"><div className="panel-header"><div><span className="eyebrow">{content.instructorDashboard.form.creation}</span><h2>{content.instructorDashboard.createTitle}</h2></div></div>{notice && <p className="success-note">{notice}</p>}
        <form className="course-builder" onSubmit={submit}>
          <input required value={course.title} placeholder={content.instructorDashboard.form.titlePlaceholder} onChange={(event) => setCourse({ ...course, title: event.target.value })} />
          <select value={course.category} onChange={(event) => setCourse({ ...course, category: event.target.value })}>{categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          <input required value={course.teacher} placeholder={content.instructorDashboard.form.teacherPlaceholder} onChange={(event) => setCourse({ ...course, teacher: event.target.value })} />
          <textarea required value={course.description} placeholder={content.instructorDashboard.form.descriptionPlaceholder} onChange={(event) => setCourse({ ...course, description: event.target.value })} />
          <fieldset className="fieldwork-builder"><legend>{content.instructorDashboard.form.fieldworkLegend}</legend><input required value={course.fieldwork.concept} placeholder={content.instructorDashboard.form.fieldworkConceptPlaceholder} onChange={(event) => setCourse({ ...course, fieldwork: { ...course.fieldwork, concept: event.target.value } })} /><input required value={course.fieldwork.prompts[0]} placeholder={content.instructorDashboard.form.fieldworkPromptPlaceholder} onChange={(event) => setCourse({ ...course, fieldwork: { ...course.fieldwork, prompts: [event.target.value] } })} /></fieldset>
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
          {course.modules.map((module, moduleIndex) => <div className="builder-module" key={moduleIndex}><input required value={module.title} aria-label={content.instructorDashboard.form.moduleTitleLabel} onChange={(event) => updateModule(moduleIndex, "title", event.target.value)} /><input required min="1" type="number" value={module.hours} aria-label={content.instructorDashboard.form.moduleHoursLabel} onChange={(event) => updateModule(moduleIndex, "hours", event.target.value)} />{module.lessons.map((lesson, lessonIndex) => <input required key={lessonIndex} value={lesson} placeholder={content.instructorDashboard.form.lessonPlaceholder} onChange={(event) => updateLesson(moduleIndex, lessonIndex, event.target.value)} />)}<button type="button" className="secondary-link text-button" onClick={() => addLesson(moduleIndex)}>{content.instructorDashboard.form.addLesson}</button></div>)}
          <button type="button" className="btn btn-secondary" onClick={addModule}>{content.instructorDashboard.form.addModule}</button><button className="btn btn-primary" type="submit">{content.instructorDashboard.form.publish}</button>
        </form>
      </section>
    </section>
  );
}

export default InstructorDashboard;
