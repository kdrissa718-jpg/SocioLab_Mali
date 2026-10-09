import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, CheckCircle2, Globe, GraduationCap, ImageUp, LayoutDashboard, LibraryBig, LogOut, MapPinned, Settings, UsersRound } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import AiAssistant from "../components/ai-assistant";
import Courses from "./courses";
import Library from "./library.jsx";
import Fieldwork from "./fieldwork";
import NotificationBell from "../components/notification-bell";
import ThemeToggle from "../components/theme-toggle";
import signatureImage from "../assets/Signature.png";
import QRCode from "qrcode";
import { getCategoryLabel } from "../i18n/translations";
import { getLocalizedCourse } from "../i18n/course-content";

             
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[character]));

function getDashboardView(pathname) {
  const normalizedPath = pathname.toLowerCase();
  if (normalizedPath.endsWith("/bibliotheque") || normalizedPath.endsWith("/library")) return "library";
  if (normalizedPath.endsWith("/cours") || normalizedPath.endsWith("/catalogue")) return "catalog";
  if (normalizedPath.endsWith("/mes-cours")) return "courses";
  if (normalizedPath.includes("enquete") || normalizedPath.includes("fieldwork") || normalizedPath.endsWith("/terrain")) return "fieldwork";
  return null;
}
   
function downloadAttestation({ learnerName, learnerId, course, module }) {
  const issuedAt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date());
  const certificateId = `SCL-${String(learnerId || "0000").toUpperCase()}-${Date.now().toString().slice(-6)}`;
  const studentName = escapeHtml(learnerName || "Enseignant SocioLab");
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

void downloadAttestation;

async function generateModuleAttestation({ learnerName, learnerId, course, module }) {
  const newWindow = window.open("", "_blank", "width=1000,height=800");
  const certificateId = `SCL-${String(learnerId || "0000").toUpperCase()}-${String(module.id).toUpperCase()}-${Date.now().toString().slice(-6)}`;
  const issuedAt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date());
  const verificationUrl = new URL(`/verifier-attestation/${encodeURIComponent(certificateId)}`, window.location.origin).toString();
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { width: 180, margin: 1, color: { dark: "#173846", light: "#ffffff" } });
  try {
    const storageKey = "sociolab_admin_attestations";
    const existing = JSON.parse(localStorage.getItem(storageKey)) || [];
    if (!existing.some((item) => item.id === certificateId)) {
      localStorage.setItem(storageKey, JSON.stringify([{ id: certificateId, learner: learnerName || "Enseignant SocioLab", course: `${course.title} — ${module.title}`, date: new Intl.DateTimeFormat("fr-FR").format(new Date()), status: "Validée" }, ...existing]));
    }
  } catch {
    // Le document reste disponible même si le registre local ne peut pas être mis à jour.
  }
  const signatureDataUrl = await fetch(signatureImage).then((response) => response.blob()).then((blob) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); }));
  const documentHtml = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Attestation - ${escapeHtml(module.title)}</title><style>@page{size:A4 landscape;margin:10mm}body{margin:0;padding:0;background:#fff;font-family:Georgia,serif;color:#0f172a}.certificate{position:relative;box-sizing:border-box;width:277mm;height:190mm;margin:0;padding:22mm 26mm;border:10px solid #1d4ed8;overflow:hidden;text-align:center}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #dbeafe;padding-bottom:12px}.brand{font-size:22px;font-weight:700;color:#1d4ed8;letter-spacing:.08em;text-transform:uppercase}.subtitle{font-size:14px;color:#64748b;margin-top:6px}.badge{padding:8px 14px;background:#eff6ff;color:#1d4ed8;font-weight:700}.title{font-size:38px;margin:22px 0 10px;color:#0f172a}.line{width:140px;height:4px;margin:0 auto 18px;background:#1d4ed8}.text{font-size:20px;line-height:1.45;margin:8px auto}.name{font-size:32px;font-weight:700;margin:12px 0;color:#1e3a8a}.module{font-size:24px;font-weight:700;margin:12px 0 6px}.seal{display:inline-block;margin-top:14px;padding:9px 18px;border:2px solid #f59e0b;color:#b45309;font-weight:700;background:#fff7ed}.direction{position:absolute;left:12%;bottom:43mm;color:#1d4ed8;font:700 14px Arial,sans-serif}.signature{position:absolute;left:12%;bottom:12mm;width:150px;height:auto}.meta{position:absolute;right:12%;bottom:16mm;text-align:right;font:14px Arial,sans-serif;color:#334155}</style></head><body><main class="certificate"><div class="header"><div><div class="brand">SocioLab</div><div class="subtitle">Plateforme pédagogique en sciences humaines et sociales</div></div><div class="badge">Attestation officielle</div></div><h1 class="title">Attestation de réussite</h1><div class="line"></div><p class="text">Nous certifions que</p><div class="name">${escapeHtml(learnerName || "Enseignant SocioLab")}</div><p class="text">a validé avec succès le module</p><div class="module">${escapeHtml(module.title)}</div><p class="text">de la formation <strong>${escapeHtml(course.title)}</strong>.</p><div class="seal">Module validé</div><div class="direction">Direction Pédagogique</div><img class="signature" src="${signatureDataUrl}" alt="Signature officielle SocioLab"><div class="meta">Identifiant : ${certificateId}<br>Émise le ${issuedAt}</div></main></body></html>`;
  if (newWindow) { newWindow.document.write(documentHtml); newWindow.document.close(); newWindow.document.querySelector(".meta")?.insertAdjacentHTML("beforebegin", `<img src="${qrCodeDataUrl}" alt="QR de vérification" style="position:absolute;right:12%;bottom:43mm;width:32mm;height:32mm;object-fit:contain">`); newWindow.focus(); newWindow.setTimeout(() => newWindow.print(), 500); }
  const downloadableDocument = documentHtml.replace("</main>", `<img src="${qrCodeDataUrl}" alt="QR de vérification" style="position:absolute;right:12%;bottom:43mm;width:32mm;height:32mm;object-fit:contain"></main>`);
  const blobUrl = URL.createObjectURL(new Blob([downloadableDocument], { type: "text/html;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `attestation-${module.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}-${certificateId}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  return certificateId;
}

const StudentOverview = memo(function StudentOverview({ content, learnerName, enrolledCourses, averageProgress, completedLessons, allLessons, nextCourse, nextCourseProgress, onCatalog }) {
  return <><div className="student-section-heading"><div><span className="eyebrow">{content.studentDashboard.eyebrow}</span><h1>{content.studentDashboard.title}</h1><p>{content.studentDashboard.description.replace("{name}", learnerName)}</p></div><button type="button" className="btn btn-primary" onClick={onCatalog}>{content.studentDashboard.addCourse}</button></div><div className="dashboard-cards"><article className="metric-card"><p>{content.studentDashboard.activeCourses}</p><strong>{enrolledCourses.length}</strong></article><article className="metric-card"><p>{content.studentDashboard.globalProgress}</p><strong>{averageProgress}%</strong></article><article className="metric-card"><p>{content.studentDashboard.completedLessons}</p><strong>{completedLessons.length}/{allLessons}</strong></article></div>{nextCourse && <section className="learning-focus"><div><span className="eyebrow">{content.studentDashboard.continueTitle}</span><h2>{nextCourse.title}</h2><p>{nextCourse.description}</p></div><div className="focus-progress"><strong>{nextCourseProgress}%</strong><div className="progress-bar"><div style={{ width: `${nextCourseProgress}%` }} /></div><Link to={`/course/${nextCourse.id}`} className="secondary-link">{content.common.openCourse}</Link></div></section>}<AiAssistant mode="student" context={content.studentDashboard.aiContext} title={content.studentDashboard.aiTitle} /></>;
});

function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { courses, enrolledCourseIds, completedLessons, toggleLesson, getCourseProgress, learnerName, setLearnerName, learnerId, learnerEmail, setLearnerEmail, studentProfile, setStudentProfile, language, setLanguage, translations, signOut } = useAppContext();
  const content = translations[language];
  const navigation = content.studentDashboard.navigation;
  const dashboardSettings = content.studentDashboard.settings;
  const community = content.studentDashboard.community;
  const [selectedView, setSelectedView] = useState("dashboard");
  const activeView = getDashboardView(location.pathname) ?? selectedView;
  const setActiveView = setSelectedView;
  const [isStudentProfileOpen, setIsStudentProfileOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: ["Enseignant SocioLab", "Enseignant SocioLab Mali"].includes(learnerName) ? "Apprenant SocioLab" : learnerName,
    email: learnerEmail,
    photoUrl: studentProfile.photoUrl || "",
    photoName: studentProfile.photoName || "",
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  const completedLessonSet = useMemo(() => new Set(completedLessons), [completedLessons]);
  const enrolledCourses = useMemo(() => courses.filter((course) => enrolledCourseIds.includes(course.id)), [courses, enrolledCourseIds]);
  const progressByCourse = useMemo(() => Object.fromEntries(enrolledCourses.map((course) => [course.id, getCourseProgress(course)])), [enrolledCourses, getCourseProgress]);
  const allLessons = useMemo(() => enrolledCourses.reduce((total, course) => total + course.modules.reduce((moduleTotal, module) => moduleTotal + module.lessons.length, 0), 0), [enrolledCourses]);
  const averageProgress = useMemo(() => enrolledCourses.length ? Math.round(Object.values(progressByCourse).reduce((sum, progress) => sum + progress, 0) / enrolledCourses.length) : 0, [enrolledCourses.length, progressByCourse]);
  const nextCourse = useMemo(() => enrolledCourses.find((course) => progressByCourse[course.id] < 100), [enrolledCourses, progressByCourse]);

  const getModuleProgress = useCallback((module) => {
    if (!module.lessons.length) return 0;
    let completedCount = 0;
    for (let index = 0; index < module.lessons.length; index += 1) {
      if (completedLessonSet.has(`${module.id}-${index}`)) completedCount += 1;
    }
    return Math.round((completedCount / module.lessons.length) * 100);
  }, [completedLessonSet]);

  const handleLessonToggle = useCallback((course, module, index) => {
    const key = `${module.id}-${index}`;
    const wasCompleted = completedLessonSet.has(key);
    const completedBefore = module.lessons.reduce((count, _, lessonIndex) => count + (completedLessonSet.has(`${module.id}-${lessonIndex}`) ? 1 : 0), 0);
    toggleLesson(key);

    if (!wasCompleted && completedBefore + 1 === module.lessons.length) {
      const certificateKey = `sociolab_module_certificate_${learnerId}_${module.id}`;
      if (!localStorage.getItem(certificateKey)) {
        localStorage.setItem(certificateKey, "generated");
        generateModuleAttestation({ learnerName, learnerId, course, module });
      }
    }
  }, [completedLessonSet, learnerId, learnerName, toggleLesson]);

  const handleSignOut = useCallback(() => {
    signOut();
    navigate("/login", { replace: true });
  }, [navigate, signOut]);

  const saveSettings = useCallback((event) => {
    event.preventDefault();
    setLearnerName(settingsForm.name.trim() || "Apprenant SocioLab");
    setLearnerEmail(settingsForm.email.trim());
    setStudentProfile({ photoUrl: settingsForm.photoUrl, photoName: settingsForm.photoName });
    setSettingsSaved(true);
  }, [setLearnerEmail, setLearnerName, setStudentProfile, settingsForm]);

  const handlePhoto = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) return;
    setSettingsForm((current) => ({ ...current, photoUrl: URL.createObjectURL(file), photoName: file.name }));
    setSettingsSaved(false);
  }, []);

  const renderCourses = useMemo(
    () => (
      <section className="student-content-section">
        <div className="student-section-heading">
          <div>
            <span className="eyebrow">{navigation.learningLabel}</span>
            <h1>Mes cours</h1>
            <p>{content.studentDashboard.progressHint}</p>
          </div>
        </div>
        <div className="learning-grid">
          {enrolledCourses.map((course) => {
            const localizedCourse = getLocalizedCourse(course, language);
            const courseProgress = progressByCourse[course.id] ?? 0;
            return (
              <article key={course.id} className="learning-card">
                <div className="course-card-meta">
                  <span>{getCategoryLabel(content, course.category)}</span>
                  <strong>{courseProgress}% {content.common.completed}</strong>
                </div>
                <h2>{localizedCourse.title}</h2>
                <div className="progress-bar">
                  <div style={{ width: `${courseProgress}%` }} />
                </div>
                <p className="course-progress-caption">
                  {content.studentDashboard.progressCaption.replace("{name}", learnerName).replace("{progress}", String(courseProgress))}
                </p>
                {localizedCourse.modules.map((module) => {
                  const moduleProgress = getModuleProgress(module);
                  const isCompleted = moduleProgress === 100;
                  return (
                    <div key={module.id} className="module-block">
                      <div className="module-heading">
                        <strong>{module.title}</strong>
                        <span>{moduleProgress}% · {module.hours} h</span>
                      </div>
                      <div className="progress-bar module-progress">
                        <div style={{ width: `${moduleProgress}%` }} />
                      </div>
                      {module.lessons.map((lesson, index) => {
                        const key = `${module.id}-${index}`;
                        return (
                          <label key={key} className="lesson-item">
                            <input
                              type="checkbox"
                              checked={completedLessonSet.has(key)}
                              onChange={() => handleLessonToggle(course, module, index)}
                            />
                            <span>{lesson}</span>
                          </label>
                        );
                      })}
                      {isCompleted ? (
                        <div className="attestation-ready">
                          <div>
                            <strong>{content.common.certificateReady}</strong>
                            <span>{content.common.certificateReadyText}</span>
                          </div>
                          <button
                            className="btn btn-secondary"
                            type="button"
                            onClick={() => generateModuleAttestation({ learnerName, learnerId, course, module })}
                          >
                            {content.common.downloadCertificate}
                          </button>
                        </div>
                      ) : (
                        <p className="attestation-pending">{content.common.certificatePending}</p>
                      )}
                    </div>
                  );
                })}
                <Link to={`/course/${course.id}`} className="secondary-link">
                  {content.common.openCourse}
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    ),
    [completedLessonSet, content, enrolledCourses, getModuleProgress, handleLessonToggle, language, learnerId, learnerName, navigation.learningLabel, progressByCourse]
  );

  return (
    <section className="student-dashboard-shell">
      <aside className="student-sidebar" aria-label={navigation.label}>
        <div className="student-sidebar-brand"><GraduationCap size={22} aria-hidden="true" /><span>{navigation.brand}</span></div>
        <nav className="student-sidebar-nav">
          <button className={activeView === "dashboard" ? "active" : ""} type="button" onClick={() => { setSelectedView("dashboard"); navigate("/dashboard/etudiant"); }}><LayoutDashboard size={18} aria-hidden="true" />{navigation.dashboard}</button>
          <button className="student-sidebar-link" type="button" onClick={() => navigate("/dashboard/etudiant/cours")}><BookOpen size={18} aria-hidden="true" />{navigation.catalog}</button>
          <p>{navigation.learning}</p>
          <button className={activeView === "courses" ? "active" : ""} type="button" onClick={() => { setSelectedView("courses"); navigate("/dashboard/etudiant/mes-cours"); }}><GraduationCap size={18} aria-hidden="true" />{navigation.courses}</button>
          <button className={activeView === "fieldwork" ? "active" : ""} type="button" onClick={() => navigate("/dashboard/etudiant/enquete-terrain")}><MapPinned size={18} aria-hidden="true" />{navigation.fieldwork}</button>
          <button className="student-sidebar-link" type="button" onClick={() => navigate("/dashboard/etudiant/bibliotheque")}><LibraryBig size={18} aria-hidden="true" />{navigation.library}</button>
          <button className={activeView === "community" ? "active" : ""} type="button" onClick={() => { setSelectedView("community"); navigate("/dashboard/etudiant"); }}><UsersRound size={18} aria-hidden="true" />{navigation.community}</button>
        </nav>
        <div className="student-sidebar-bottom"><button className={activeView === "settings" ? "active" : ""} type="button" onClick={() => setActiveView("settings")}><Settings size={18} aria-hidden="true" />{navigation.settings}</button><label className="sidebar-language"><span className="sidebar-language-label"><Globe size={14} aria-hidden="true" />{navigation.changeLanguage}</span><select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="fr">FR</option><option value="en">EN</option></select></label></div>
      </aside>
      <div className="student-dashboard-content">
        <div className="student-dashboard-topbar"><label className="dashboard-language-picker" aria-label={navigation.changeLanguage}><Globe size={15} aria-hidden="true" /><select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="fr">FR</option><option value="en">EN</option></select></label><ThemeToggle /><NotificationBell audience="Étudiants" /><div className="student-profile-menu"><button className="student-profile-trigger" type="button" onClick={() => setIsStudentProfileOpen((current) => !current)} aria-label={navigation.profile} aria-expanded={isStudentProfileOpen} title={navigation.profile}>{studentProfile.photoUrl ? <img src={studentProfile.photoUrl} alt="" /> : <span>{learnerName.slice(0, 1).toUpperCase()}</span>}</button>{isStudentProfileOpen && <section className="student-profile-popover" role="dialog" aria-label={navigation.profile}><div className="student-profile-popover-heading"><span className="eyebrow">{navigation.profile}</span><button type="button" onClick={() => setIsStudentProfileOpen(false)} aria-label={navigation.close}>×</button></div><div className="profile-preview-meta"><div className="profile-avatar student-profile-popover-avatar">{studentProfile.photoUrl ? <img src={studentProfile.photoUrl} alt="" /> : <span>{learnerName.slice(0, 1).toUpperCase()}</span>}</div><div><h2>{learnerName || dashboardSettings.learnerName}</h2><p>{learnerEmail || dashboardSettings.emailMissing}</p></div></div><p className="student-profile-popover-description">{navigation.profileDescription}</p><button className="btn btn-secondary student-profile-settings-link" type="button" onClick={() => { setActiveView("settings"); setIsStudentProfileOpen(false); }}>{navigation.editProfile}</button></section>}</div></div>
        {activeView === "dashboard" && <StudentOverview content={content} learnerName={learnerName} enrolledCourses={enrolledCourses} averageProgress={averageProgress} completedLessons={completedLessons} allLessons={allLessons} nextCourse={getLocalizedCourse(nextCourse, language)} nextCourseProgress={nextCourse ? progressByCourse[nextCourse.id] : 0} onCatalog={() => navigate("/dashboard/etudiant/cours")} />}
        {activeView === "catalog" && <div className="student-inline-view"><Courses /></div>}
        {activeView === "courses" && renderCourses}
        {activeView === "library" && <div className="student-inline-view"><Library /></div>}
        {activeView === "fieldwork" && <div className="student-inline-view"><Fieldwork /></div>}
        {activeView === "community" && <section className="student-content-section"><div className="student-section-heading"><div><span className="eyebrow">{community.label}</span><h1>{community.title}</h1><p>{community.description}</p></div></div><div className="community-list"><article><UsersRound size={20} aria-hidden="true" /><div><h2>{community.sociology}</h2><p>{community.sociologyDescription}</p></div></article><article><UsersRound size={20} aria-hidden="true" /><div><h2>{community.methods}</h2><p>{community.methodsDescription}</p></div></article></div></section>}
        {activeView === "settings" && <section className="student-content-section"><div className="student-section-heading"><div><span className="eyebrow">{navigation.brand}</span><h1>{dashboardSettings.accountTitle}</h1><p>{dashboardSettings.accountDescription}</p></div></div><form className="student-settings" onSubmit={saveSettings}><div className="student-profile-summary"><div className="student-avatar">{settingsForm.photoUrl ? <img src={settingsForm.photoUrl} alt="" /> : <span>{settingsForm.name.slice(0, 1).toUpperCase()}</span>}</div><div><h2>{settingsForm.name || dashboardSettings.learnerName}</h2><p>{settingsForm.email || dashboardSettings.emailMissing}</p><span><CheckCircle2 size={16} aria-hidden="true" />{dashboardSettings.verifiedEmail}</span></div></div><div className="student-settings-form"><h2>{dashboardSettings.profileTitle}</h2><p>{dashboardSettings.profileDescription}</p><label className="student-photo-control" htmlFor="student-photo"><ImageUp size={18} aria-hidden="true" />{dashboardSettings.changePhoto}<input id="student-photo" type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhoto} /></label><label>{dashboardSettings.fullName}<input value={settingsForm.name} onChange={(event) => { setSettingsForm((current) => ({ ...current, name: event.target.value })); setSettingsSaved(false); }} /></label><label>{dashboardSettings.email}<input type="email" value={settingsForm.email} onChange={(event) => { setSettingsForm((current) => ({ ...current, email: event.target.value })); setSettingsSaved(false); }} /></label><label>{dashboardSettings.language}<select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="fr">Français</option><option value="en">English</option></select></label>{settingsSaved && <p className="settings-saved">{dashboardSettings.saved}</p>}<button className="btn btn-primary" type="submit">{dashboardSettings.save}</button></div><div className="student-signout-panel"><h2>{dashboardSettings.security}</h2><p>{dashboardSettings.signOutDescription}</p><button className="btn btn-outline dashboard-logout" type="button" onClick={handleSignOut}><LogOut size={18} aria-hidden="true" />{dashboardSettings.signOut}</button></div></form></section>}
      </div>
    </section>
  );
}

export default StudentDashboard;
