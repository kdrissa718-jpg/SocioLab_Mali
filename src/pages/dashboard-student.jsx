import { Link, useNavigate } from "react-router-dom";
import { BookOpen, CheckCircle2, GraduationCap, ImageUp, LayoutDashboard, LibraryBig, LogOut, Settings, UsersRound } from "lucide-react";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import AiAssistant from "../components/ai-assistant";
import Courses from "./courses";
import Library from "./library.jsx";

             
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[character]));
   
function downloadAttestation({ learnerName, learnerId, course, module }) {
  const issuedAt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date());
  const certificateId = `SCL-${String(learnerId || "0000").toUpperCase()}-${Date.now().toString().slice(-6)}`;
  const studentName = escapeHtml(learnerName || "Apprenant SocioLab");
  //Le nom de l'etudiant est maintenant récupéré depuis le contexte de l'application pour éviter les problèmes d'encodage et de sécurité.
  //const studentName = escapeHtml(login.fullName);
  const moduleTitle = escapeHtml(module.title);
  const courseTitle = escapeHtml(course.title);
  const documentHtml = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Attestation - ${moduleTitle}</title><style>body{margin:0;padding:32px;background:#f4f7ff;font-family:Georgia,serif;color:#0f172a}.certificate{max-width:900px;margin:0 auto;background:white;border:18px solid #1d4ed8;border-radius:24px;padding:40px 48px;box-shadow:0 22px 60px rgba(15,23,42,.12)}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #dbeafe;padding-bottom:18px}.brand{font-size:22px;font-weight:700;color:#1d4ed8;letter-spacing:.08em;text-transform:uppercase}.subtitle{font-size:14px;color:#64748b;margin-top:6px}.badge{padding:8px 14px;border-radius:999px;background:#eff6ff;color:#1d4ed8;font-weight:700}.title{font-size:38px;text-align:center;margin:28px 0 12px;color:#0f172a}.line{width:140px;height:4px;margin:0 auto 28px;background:linear-gradient(90deg,#f59e0b,#1d4ed8)}.text{font-size:20px;line-height:1.7;text-align:center;max-width:760px;margin:0 auto}.name{font-size:32px;font-weight:700;margin:18px 0 14px;color:#1e3a8a;text-align:center}.module{font-size:24px;font-weight:700;margin:16px 0 8px;text-align:center}.footer{display:flex;justify-content:space-between;gap:16px;margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0;font-size:15px;color:#475569}.signature{border-top:1px solid #64748b;padding-top:8px;width:220px;text-align:center}.meta{margin-top:10px;text-align:center;font-size:15px;color:#334155}.seal{display:inline-block;margin-top:16px;padding:10px 18px;border:2px solid #f59e0b;border-radius:999px;color:#b45309;font-weight:700;background:#fff7ed}@media print{body{background:white;padding:0} .certificate{box-shadow:none;border-width:12px}}</style></head><body><main class="certificate"><div class="header"><div><div class="brand">SocioLab</div><div class="subtitle">Plateforme pédagogique en sciences humaines et sociales</div></div><div class="badge">Attestation officielle</div></div><h1 class="title">Attestation de réussite</h1><div class="line"></div><p class="text">Cette attestation certifie que</p><div class="name">${studentName}</div><p class="text">a validé avec succès le module</p><div class="module">${moduleTitle}</div><p class="text">du parcours « ${courseTitle} », d’une durée pédagogique de ${module.hours} heure${module.hours > 1 ? "s" : ""}.</p><div class="meta">N° d’attestation : ${escapeHtml(certificateId)}</div><div class="seal">Validation pédagogique confirmée</div><div class="footer"><div>Délivrée le ${issuedAt}</div><div class="signature">SocioLab<br/>Direction pédagogique</div></div></main></body></html>`;
  const blob = new Blob([documentHtml], { type: "text/html;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);
  const newWindow = window.open('', '_blank', 'width=1000,height=800');
  if (newWindow) {
    newWindow.document.write(documentHtml);
    newWindow.document.close();
    newWindow.focus();
    setTimeout(() => newWindow.print(), 400); 
  }
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `attestation-${module.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}-${certificateId}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
} 

function StudentDashboard() {
  const navigate = useNavigate();
  const { courses, enrolledCourseIds, completedLessons, toggleLesson, getCourseProgress, learnerName, setLearnerName, learnerId, learnerEmail, setLearnerEmail, studentProfile, setStudentProfile, profile, language, setLanguage, translations, signOut } = useAppContext();
  const content = translations[language];
  const [activeView, setActiveView] = useState("dashboard");
  const [settingsForm, setSettingsForm] = useState({ name: learnerName, email: learnerEmail, ...studentProfile });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const enrolledCourses = courses.filter((course) => enrolledCourseIds.includes(course.id));
  const allLessons = enrolledCourses.flatMap((course) => course.modules.flatMap((module) => module.lessons));
  const averageProgress = enrolledCourses.length ? Math.round(enrolledCourses.reduce((sum, course) => sum + getCourseProgress(course), 0) / enrolledCourses.length) : 0;
  const nextCourse = enrolledCourses.find((course) => getCourseProgress(course) < 100);
  const getModuleProgress = (module) => Math.round((module.lessons.filter((_, index) => completedLessons.includes(`${module.id}-${index}`)).length / module.lessons.length) * 100);
  const handleSignOut = () => { signOut(); navigate("/login", { replace: true }); };
  const saveSettings = (event) => {
    event.preventDefault();
    setLearnerName(settingsForm.name.trim() || "Apprenant SocioLab");
    setLearnerEmail(settingsForm.email.trim());
    setStudentProfile({ photoUrl: settingsForm.photoUrl, photoName: settingsForm.photoName });
    setSettingsSaved(true);
  };
  const handlePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) return;
    setSettingsForm((current) => ({ ...current, photoUrl: URL.createObjectURL(file), photoName: file.name }));
    setSettingsSaved(false);
  };
  const renderCourses = () => <section className="student-content-section"><div className="student-section-heading"><div><span className="eyebrow">Apprentissage</span><h1>Mes cours</h1><p>{content.studentDashboard.progressHint}</p></div></div><div className="learning-grid">{enrolledCourses.map((course) => <article key={course.id} className="learning-card"><div className="course-card-meta"><span>{course.category}</span><strong>{getCourseProgress(course)}% {content.common.completed}</strong></div><h2>{course.title}</h2><div className="progress-bar"><div style={{ width: `${getCourseProgress(course)}%` }} /></div><p className="course-progress-caption">{content.studentDashboard.progressCaption.replace("{name}", learnerName).replace("{progress}", getCourseProgress(course))}</p>{course.modules.map((module) => { const moduleProgress = getModuleProgress(module); const isCompleted = moduleProgress === 100; return <div key={module.id} className="module-block"><div className="module-heading"><strong>{module.title}</strong><span>{moduleProgress}% · {module.hours} h</span></div><div className="progress-bar module-progress"><div style={{ width: `${moduleProgress}%` }} /></div>{module.lessons.map((lesson, index) => { const key = `${module.id}-${index}`; return <label key={key} className="lesson-item"><input type="checkbox" checked={completedLessons.includes(key)} onChange={() => toggleLesson(key)} /><span>{lesson}</span></label>; })}{isCompleted ? <div className="attestation-ready"><div><strong>{content.common.certificateReady}</strong><span>{content.common.certificateReadyText}</span></div><button className="btn btn-secondary" type="button" onClick={() => downloadAttestation({ learnerName, learnerId, course, module })}>{content.common.downloadCertificate}</button></div> : <p className="attestation-pending">{content.common.certificatePending}</p>}</div>; })}<Link to={`/course/${course.id}`} className="secondary-link">{content.common.seeFullPath}</Link></article>)}</div></section>;

  return (
    <section className="student-dashboard-shell">
      <aside className="student-sidebar" aria-label="Navigation de l'espace apprenant">
        <div className="student-sidebar-brand"><GraduationCap size={22} aria-hidden="true" /><span>Espace apprenant</span></div>
        <nav className="student-sidebar-nav">
          <button className={activeView === "dashboard" ? "active" : ""} type="button" onClick={() => setActiveView("dashboard")}><LayoutDashboard size={18} aria-hidden="true" />Tableau de bord</button>
          <button className={activeView === "catalog" ? "active" : ""} type="button" onClick={() => setActiveView("catalog")}><BookOpen size={18} aria-hidden="true" />Catalogue</button>
          <p>Apprentissage</p>
          <button className={activeView === "courses" ? "active" : ""} type="button" onClick={() => setActiveView("courses")}><GraduationCap size={18} aria-hidden="true" />Mes cours</button>
          <button className={activeView === "library" ? "active" : ""} type="button" onClick={() => setActiveView("library")}><LibraryBig size={18} aria-hidden="true" />Bibliothèque</button>
          <button className={activeView === "community" ? "active" : ""} type="button" onClick={() => setActiveView("community")}><UsersRound size={18} aria-hidden="true" />Communauté</button>
        </nav>
        <div className="student-sidebar-bottom"><button className={activeView === "settings" ? "active" : ""} type="button" onClick={() => setActiveView("settings")}><Settings size={18} aria-hidden="true" />Paramètres</button><label className="sidebar-language">Changer de langue<select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="fr">Français</option><option value="en">English</option></select></label></div>
      </aside>
      <div className="student-dashboard-content">
        {activeView === "dashboard" && <><div className="student-section-heading"><div><span className="eyebrow">{content.studentDashboard.eyebrow}</span><h1>{content.studentDashboard.title}</h1><p>{content.studentDashboard.description.replace("{name}", learnerName)}</p></div><button type="button" className="btn btn-primary" onClick={() => setActiveView("catalog")}>{content.studentDashboard.addCourse}</button></div><div className="dashboard-cards"><article className="metric-card"><p>{content.studentDashboard.activeCourses}</p><strong>{enrolledCourses.length}</strong></article><article className="metric-card"><p>{content.studentDashboard.globalProgress}</p><strong>{averageProgress}%</strong></article><article className="metric-card"><p>{content.studentDashboard.completedLessons}</p><strong>{completedLessons.length}/{allLessons.length}</strong></article></div>{nextCourse && <section className="learning-focus"><div><span className="eyebrow">{content.studentDashboard.continueTitle}</span><h2>{nextCourse.title}</h2><p>{nextCourse.description}</p></div><div className="focus-progress"><strong>{getCourseProgress(nextCourse)}%</strong><div className="progress-bar"><div style={{ width: `${getCourseProgress(nextCourse)}%` }} /></div><Link to={`/course/${nextCourse.id}`} className="secondary-link">{content.common.openCourse}</Link></div></section>}<section className="student-instructor-summary"><span className="eyebrow">{content.studentDashboard.instructorProfileTitle}</span><div className="profile-preview-meta"><div className="profile-avatar">{profile.photoUrl ? <img src={profile.photoUrl} alt={profile.emoji || "Enseignant"} /> : <span>{profile.emoji || "👩‍🏫"}</span>}</div><div><h2>{profile.name}</h2><p>{profile.description}</p><span>{profile.address}</span></div></div></section><AiAssistant mode="student" context={content.studentDashboard.aiContext} title={content.studentDashboard.aiTitle} /></>}
        {activeView === "catalog" && <Courses />}
        {activeView === "courses" && renderCourses()}
        {activeView === "library" && <Library />}
        {activeView === "community" && <section className="student-content-section"><div className="student-section-heading"><div><span className="eyebrow">Communauté</span><h1>Espaces d'échange</h1><p>Retrouvez les groupes liés à vos apprentissages.</p></div></div><div className="community-list"><article><UsersRound size={20} aria-hidden="true" /><div><h2>Sociologie générale</h2><p>Discussions et ressources autour du parcours.</p></div></article><article><UsersRound size={20} aria-hidden="true" /><div><h2>Méthodes de travail</h2><p>Partagez vos pratiques et vos questions.</p></div></article></div></section>}
        {activeView === "settings" && <section className="student-content-section"><div className="student-section-heading"><div><span className="eyebrow">Espace apprenant</span><h1>Paramètres du compte</h1><p>Gérez vos informations personnelles et les préférences de votre compte.</p></div></div><form className="student-settings" onSubmit={saveSettings}><div className="student-profile-summary"><div className="student-avatar">{settingsForm.photoUrl ? <img src={settingsForm.photoUrl} alt="" /> : <span>{settingsForm.name.slice(0, 1).toUpperCase()}</span>}</div><div><h2>{settingsForm.name || "Apprenant SocioLab"}</h2><p>{settingsForm.email || "Adresse e-mail non renseignée"}</p><span><CheckCircle2 size={16} aria-hidden="true" />Email vérifié</span></div></div><div className="student-settings-form"><h2>Profil</h2><p>Gérez vos informations personnelles et votre photo de profil.</p><label className="student-photo-control" htmlFor="student-photo"><ImageUp size={18} aria-hidden="true" />Modifier ma photo<input id="student-photo" type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhoto} /></label><label>Nom complet<input value={settingsForm.name} onChange={(event) => { setSettingsForm((current) => ({ ...current, name: event.target.value })); setSettingsSaved(false); }} /></label><label>Adresse e-mail<input type="email" value={settingsForm.email} onChange={(event) => { setSettingsForm((current) => ({ ...current, email: event.target.value })); setSettingsSaved(false); }} /></label><label>Langue<select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="fr">Français</option><option value="en">English</option></select></label>{settingsSaved && <p className="settings-saved">Informations enregistrées.</p>}<button className="btn btn-primary" type="submit">Enregistrer</button></div><div className="student-signout-panel"><h2>Sécurité</h2><p>Terminez votre session sur cet appareil.</p><button className="btn btn-outline dashboard-logout" type="button" onClick={handleSignOut}><LogOut size={18} aria-hidden="true" />Déconnexion</button></div></form></section>}
      </div>
    </section>
  );
}

export default StudentDashboard;
