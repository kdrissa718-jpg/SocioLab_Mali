import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Archive,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  ChevronRight,
  ClipboardList,
  FileText,
  Globe,
  GraduationCap,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Settings,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import NotificationBell from "../components/notification-bell";
import signatureImage from "../assets/Signature.png";
import QRCode from "qrcode";
import AttestationVerification from "./attestation-verification";
import { initialAttestations } from "../data/attestations";
import { getLocalizedCourse } from "../i18n/course-content";
import { getLocalizedResource } from "../i18n/library-content";
import { getCategoryLabel } from "../i18n/translations";
import ThemeToggle from "../components/theme-toggle";

const emptyResourceForm = () => ({ title: "", titleEn: "", type: "Livre", category: "Sociologie", categoryEn: "", author: "SocioLab", authorEn: "", year: new Date().getFullYear(), description: "", descriptionEn: "", format: "PDF", url: "", coverUrl: "", coverName: "", coverSource: "", pdfUrl: "", pdfName: "", pdfSource: "" });

const menuGroups = [
  {
    label: "Pilotage",
    items: [{ id: "overview", label: "Tableau de bord", icon: LayoutDashboard }],
  },
  {
    label: "Gestion",
    items: [
      { id: "users", label: "Utilisateurs", icon: Users, children: ["Étudiants", "Enseignants", "Administrateurs"] },
      { id: "courses", label: "Formations", icon: BookOpen, children: ["Cours", "Modules", "Catégories", "Attestations", "Vérification"] },
      { id: "library", label: "Bibliothèque", icon: Archive, children: ["Livres", "Articles", "Mémoires", "Guides", "Rapports"] },
      { id: "registrations", label: "Inscriptions", icon: ClipboardList },
    ],
  },
  {
    label: "Accompagnement",
    items: [{ id: "progress", label: "Suivi pédagogique", icon: BarChart3, children: ["Progression", "Notes", "Certifications"] }],
  },
  {
    label: "Communication",
    items: [{ id: "communication", label: "Communication", icon: Megaphone, children: ["Annonces", "Notifications"] }],
  },
];

const initialUsers = [
  { name: "Aminata Traoré", email: "aminata.t@gmail.com", role: "Étudiante", status: "Actif", initials: "AT" },
  { name: "Moussa Coulibaly", email: "moussa.c@sociolab.ml", role: "Enseignant", status: "Actif", initials: "MC" },
  { name: "Fatoumata Diallo", email: "fatoumata.d@sociolab.ml", role: "Enseignante", status: "En attente", initials: "FD" },
  { name: "Ibrahim Keita", email: "ibrahim.k@gmail.com", role: "Étudiant", status: "Actif", initials: "IK" },
];

const initialNotes = [
  { id: 1, learner: "Aminata Traoré", course: "Introduction à la sociologie", note: 16, status: "Validée" },
  { id: 2, learner: "Ibrahim Keita", course: "Méthodologie de recherche sociale", note: 13, status: "En attente" },
  { id: 3, learner: "Nadia Diarra", course: "Introduction à la sociologie", note: 18, status: "Validée" },
];

const initialRegistrations = [
  { id: 1, learner: "Aminata Traoré", email: "aminata.t@gmail.com", course: "Introduction à la sociologie", date: "10 sept. 2026", status: "En attente" },
  { id: 2, learner: "Ibrahim Keita", email: "ibrahim.k@gmail.com", course: "Méthodologie de recherche sociale", date: "09 sept. 2026", status: "Acceptée" },
  { id: 3, learner: "Nadia Diarra", email: "nadia.d@gmail.com", course: "Éthique et philosophie politique", date: "08 sept. 2026", status: "Refusée" },
];

const progressViews = ["progress", "progression", "notes", "certifications"];
const communicationViews = ["communication", "annonces", "notifications"];
const libraryViews = ["library", "livres", "articles", "memoires", "guides", "rapports"];
const libraryViewTypes = { livres: "Livre", articles: "Article scientifique", memoires: "Mémoire", guides: "Guide", rapports: "Rapport" };
const userViews = ["users", "etudiants", "enseignants", "administrateurs"];
const formationViews = ["courses", "modules", "categories", "attestations", "verification"];
const userViewRoles = { etudiants: ["Étudiante", "Étudiant"], enseignants: ["Enseignant", "Enseignante"], administrateurs: ["Administrateur"] };
const viewLabels = { overview: "Tableau de bord", users: "Utilisateurs", etudiants: "Étudiants", enseignants: "Enseignants", administrateurs: "Administrateurs", courses: "Formations", modules: "Modules", categories: "Catégories", library: "Bibliothèque", livres: "Livres", articles: "Articles", memoires: "Mémoires", guides: "Guides", rapports: "Rapports", attestations: "Attestations", verification: "Vérification", progression: "Progression", notes: "Notes", certifications: "Certifications", registrations: "Inscriptions", communication: "Communication", annonces: "Annonces", notifications: "Notifications", settings: "Paramètres" };

function readAdminCollection(key, fallback) {
  const stored = localStorage.getItem(key);
  if (!stored) return fallback;
  try { return JSON.parse(stored); } catch { return fallback; }
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { courses, publishedCourses, learnerName, setLearnerName, learnerEmail, setLearnerEmail, profile, setProfile, signOut, deleteCourse, libraryResources, addLibraryResource, deleteLibraryResource, notifications, setNotifications, language, setLanguage, translations } = useAppContext();
  const content = translations[language];
  const [activeView, setActiveView] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [attestations, setAttestations] = useState(() => readAdminCollection("sociolab_admin_attestations", initialAttestations));
  const [attestationFilter, setAttestationFilter] = useState("Toutes");
  const [users, setUsers] = useState(() => {
    const storedUsers = localStorage.getItem("sociolab_admin_users");
    if (!storedUsers) return initialUsers;
    try { return JSON.parse(storedUsers); } catch { return initialUsers; }
  });
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "Étudiant", status: "Actif" });
  const [isResourceFormOpen, setIsResourceFormOpen] = useState(false);
  const [resourceForm, setResourceForm] = useState(emptyResourceForm);
  const [notes, setNotes] = useState(() => {
    const storedNotes = localStorage.getItem("sociolab_admin_notes");
    if (!storedNotes) return initialNotes;
    try { return JSON.parse(storedNotes); } catch { return initialNotes; }
  });
  const [registrations, setRegistrations] = useState(() => readAdminCollection("sociolab_admin_registrations", initialRegistrations));
  const [registrationFilter, setRegistrationFilter] = useState("Toutes");
  const [announcements, setAnnouncements] = useState(() => readAdminCollection("sociolab_admin_announcements", [
    { id: 1, title: "Bienvenue sur SocioLab", audience: "Tous", date: "10 sept. 2026", status: "Publiée", content: "Les nouveaux parcours sont disponibles dans le catalogue." },
  ]));
  const [isAnnouncementFormOpen, setIsAnnouncementFormOpen] = useState(false);
  const [isNotificationFormOpen, setIsNotificationFormOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: learnerName || "Admin SocioLab",
    email: learnerEmail || "",
    photoUrl: profile?.photoUrl || "",
    photoName: profile?.photoName || "",
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const published = courses.filter((course) => course.isPublished || publishedCourses.includes(course.id));
  const stats = useMemo(() => [
    { label: "Utilisateurs actifs", value: "1 248", change: "+12,4 %", icon: Users, tone: "blue" },
    { label: "Formations publiées", value: published.length, change: "+3 ce mois", icon: BookOpen, tone: "orange" },
    { label: "Inscriptions en cours", value: "326", change: "+8,7 %", icon: ClipboardList, tone: "green" },
    { label: "Taux de réussite", value: "78,6 %", change: "+4,2 %", icon: GraduationCap, tone: "purple" },
  ], [published.length]);

  const activeLabel = viewLabels[activeView] || "Tableau de bord";

  const handleSignOut = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  const handleProfilePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setSettingsSaved(false);
      return;
    }
    const url = URL.createObjectURL(file);
    setSettingsForm((current) => ({ ...current, photoUrl: url, photoName: file.name }));
    setSettingsSaved(false);
  };

  const saveSettings = (event) => {
    event.preventDefault();
    const nextName = settingsForm.name.trim() || "Admin SocioLab";
    setLearnerName(nextName);
    setLearnerEmail(settingsForm.email.trim());
    setProfile((current) => ({
      ...current,
      name: nextName,
      photoUrl: settingsForm.photoUrl,
      photoName: settingsForm.photoName,
    }));
    setSettingsForm((current) => ({ ...current, name: nextName, email: settingsForm.email.trim() }));
    setSettingsSaved(true);
  };

  const selectView = (view) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  const saveUsers = (nextUsers) => {
    setUsers(nextUsers);
    localStorage.setItem("sociolab_admin_users", JSON.stringify(nextUsers));
  };

  const saveNotes = (nextNotes) => {
    setNotes(nextNotes);
    localStorage.setItem("sociolab_admin_notes", JSON.stringify(nextNotes));
  };

  const saveCommunication = (key, setter, items) => {
    setter(items);
    localStorage.setItem(key, JSON.stringify(items));
  };

  const saveRegistrations = (items) => {
    setRegistrations(items);
    localStorage.setItem("sociolab_admin_registrations", JSON.stringify(items));
  };

  const saveAttestations = (items) => {
    setAttestations(items);
    localStorage.setItem("sociolab_admin_attestations", JSON.stringify(items));
  };

  const addUser = (event) => {
    event.preventDefault();
    const name = userForm.name.trim();
    const email = userForm.email.trim();
    if (!name || !email) return;
    saveUsers([{ ...userForm, name, email, initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() }, ...users]);
    setUserForm({ name: "", email: "", role: "Étudiant", status: "Actif" });
    setIsUserFormOpen(false);
  };

  const addResource = (event) => {
    event.preventDefault();
    if (!resourceForm.title.trim() || (!resourceForm.pdfUrl && !resourceForm.url.trim())) return;
    addLibraryResource({ ...resourceForm, title: resourceForm.title.trim(), titleEn: resourceForm.titleEn.trim(), categoryEn: resourceForm.categoryEn.trim(), authorEn: resourceForm.authorEn.trim(), descriptionEn: resourceForm.descriptionEn.trim(), year: Number(resourceForm.year), url: resourceForm.pdfUrl || resourceForm.url, format: resourceForm.pdfSource === "upload" ? "PDF" : "Lien" });
    setResourceForm(emptyResourceForm());
    setIsResourceFormOpen(false);
  };

  const handleResourceFile = (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isCover = field === "cover";
    const isValid = isCover ? file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024 : file.type === "application/pdf" && file.size <= 20 * 1024 * 1024;
    if (!isValid) {
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setResourceForm((current) => ({ ...current, ...(isCover ? { coverUrl: reader.result, coverName: file.name, coverSource: "upload" } : { pdfUrl: reader.result, pdfName: file.name, pdfSource: "upload", url: "" }) }));
    reader.readAsDataURL(file);
  };

  return (
    <section className="admin-shell">
      <aside className={`admin-sidebar ${mobileMenuOpen ? "is-open" : ""}`}>
        <div className="admin-sidebar-header">
          <div className="admin-mark"><ShieldCheck size={22} aria-hidden="true" /></div>
          <div><strong>ADMIN SOCIOLAB</strong><span>Centre de pilotage</span></div>
          <button className="admin-close" type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Fermer le menu"><X size={20} /></button>
        </div>
        <nav className="admin-nav" aria-label="Navigation administrateur">
          {menuGroups.map((group) => (
            <div className="admin-nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id}>
                    <button className={`admin-nav-item ${activeView === item.id || (item.id === "users" && userViews.includes(activeView)) || (item.id === "courses" && formationViews.includes(activeView)) || (item.id === "progress" && progressViews.includes(activeView)) || (item.id === "communication" && communicationViews.includes(activeView)) || (item.id === "library" && libraryViews.includes(activeView)) ? "active" : ""}`} type="button" onClick={() => selectView(item.id)}>
                      <Icon size={18} aria-hidden="true" /><span>{item.label}</span>{item.children && <ChevronRight size={15} className="admin-nav-chevron" aria-hidden="true" />}
                    </button>
                    {item.children && (activeView === item.id || (item.id === "users" && userViews.includes(activeView)) || (item.id === "courses" && formationViews.includes(activeView)) || (item.id === "progress" && progressViews.includes(activeView)) || (item.id === "communication" && communicationViews.includes(activeView)) || (item.id === "library" && libraryViews.includes(activeView))) && <div className="admin-subnav">{item.children.map((child) => { const childView = item.id === "users" ? ({ Étudiants: "etudiants", Enseignants: "enseignants", Administrateurs: "administrateurs" }[child]) : item.id === "courses" ? ({ Cours: "courses", Modules: "modules", Catégories: "categories", Attestations: "attestations", Vérification: "verification" }[child]) : item.id === "progress" || item.id === "communication" ? child.toLowerCase() : item.id === "library" ? ({ Livres: "livres", Articles: "articles", Mémoires: "memoires", Guides: "guides", Rapports: "rapports" }[child]) : item.id; return <button className={activeView === childView ? "active" : ""} type="button" key={child} onClick={() => selectView(childView)}>{child}</button>; })}</div>}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className={`admin-nav-item ${activeView === "settings" ? "active" : ""}`} type="button" onClick={() => selectView("settings")}><Settings size={18} aria-hidden="true" /><span>Paramètres</span></button>
          <button className="admin-nav-item admin-logout" type="button" onClick={handleSignOut}><LogOut size={18} aria-hidden="true" /><span>Déconnexion</span></button>
        </div>
      </aside>
      {mobileMenuOpen && <button className="admin-overlay" type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Fermer la navigation" />}

      <div className="admin-content">
        <header className="admin-topbar">
          <button className="admin-menu-toggle" type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Ouvrir le menu"><span /><span /><span /></button>
          <div><span className="admin-breadcrumb">Administration /</span><h1>{activeLabel}</h1></div>
          <div className="admin-user-area"><label className="admin-language-select"><Globe size={15} aria-hidden="true" />{content.common.language}<select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="fr">FR</option><option value="en">EN</option></select></label><ThemeToggle /><NotificationBell audience="Administrateurs" /><div className="admin-user-avatar">{learnerName.slice(0, 1).toUpperCase()}</div><div className="admin-user-copy"><strong>{learnerName}</strong><span>{language === "fr" ? "Administrateur" : "Administrator"}</span></div></div>
        </header>

        {activeView === "overview" && <>
          <div className="admin-welcome"><div><span className="admin-kicker">Vue générale</span><h2>Bonjour, Admin</h2><p>Voici ce qui se passe sur votre plateforme aujourd'hui.</p></div><button className="admin-primary-button" type="button" onClick={() => selectView("users")}><Users size={17} />Gérer les utilisateurs</button></div>
          <div className="admin-stat-grid">{stats.map((stat) => { const Icon = stat.icon; return <article className="admin-stat-card" key={stat.label}><div className={`admin-stat-icon ${stat.tone}`}><Icon size={20} /></div><p>{stat.label}</p><strong>{stat.value}</strong><span className="admin-stat-change">{stat.change}</span></article>; })}</div>
          <div className="admin-main-grid">
            <section className="admin-panel admin-chart-panel"><div className="admin-panel-heading"><div><span className="admin-kicker">Activité de la plateforme</span><h2>Inscriptions mensuelles</h2></div><select aria-label="Période"><option>Cette année</option><option>Cette année</option></select></div><div className="admin-chart"><div className="admin-chart-y"><span>400</span><span>300</span><span>200</span><span>100</span><span>0</span></div><div className="admin-chart-area"><div className="admin-chart-lines"><i /><i /><i /><i /><i /></div><div className="admin-bars">{[42, 55, 48, 72, 64, 80, 68, 92, 74, 88, 78, 96].map((height, index) => <div className="admin-bar-column" key={index}><span style={{ height: `${height}%` }} /><small>{["Jan", "Fév", "Mar", "Avr", "Mai", "Jui", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"][index]}</small></div>)}</div></div></div></section>
            <section className="admin-panel admin-activity-panel"><div className="admin-panel-heading"><div><span className="admin-kicker">À traiter</span><h2>Activité récente</h2></div><button className="admin-text-button" type="button" onClick={() => selectView("users")}>Tout voir</button></div><div className="admin-activity-list"><div><span className="admin-activity-avatar orange">ND</span><p><strong>Nadia Diarra</strong> a rejoint la formation <b>Introduction à la sociologie</b><small>Il y a 12 minutes</small></p></div><div><span className="admin-activity-avatar blue">MK</span><p><strong>Modibo Keita</strong> a envoyé une demande de publication<small>Il y a 42 minutes</small></p></div><div><span className="admin-activity-avatar green">AS</span><p><strong>Awa Sangaré</strong> a terminé une certification<small>Il y a 2 heures</small></p></div></div></section>
          </div>
          <section className="admin-panel admin-table-panel"><div className="admin-panel-heading"><div><span className="admin-kicker">Gestion des accès</span><h2>Utilisateurs récents</h2></div><button className="admin-text-button" type="button" onClick={() => selectView("users")}>Voir tous les utilisateurs <ChevronRight size={16} /></button></div><UserTable users={users} onDelete={(email) => saveUsers(users.filter((user) => user.email !== email))} /></section>
        </>}
        {userViews.includes(activeView) && <section className="admin-panel admin-full-panel"><div className="admin-panel-heading"><div><span className="admin-kicker">Gestion des accès</span><h2>{activeLabel}</h2><p className="admin-panel-description">Gérez les comptes de cette catégorie.</p></div><button className="admin-primary-button" type="button" onClick={() => setIsUserFormOpen(true)}><UserRound size={17} />Ajouter un utilisateur</button></div>{isUserFormOpen && <UserForm form={userForm} setForm={setUserForm} onSubmit={addUser} onCancel={() => setIsUserFormOpen(false)} />}<UserTable users={users} roleFilter={userViewRoles[activeView]} onDelete={(email) => saveUsers(users.filter((user) => user.email !== email))} /></section>}
        {activeView === "courses" && <CourseManagement courses={published} onDelete={deleteCourse} language={language} content={content} />}
        {activeView === "modules" && <ModuleManagement courses={published} language={language} />}
        {activeView === "categories" && <CategoryManagement courses={published} />}
        {libraryViews.includes(activeView) && <LibraryManagement resources={libraryResources} typeFilter={libraryViewTypes[activeView]} onAdd={() => setIsResourceFormOpen(true)} onDelete={deleteLibraryResource} language={language} content={content} />}
        {isResourceFormOpen && <ResourceForm form={resourceForm} setForm={setResourceForm} onFile={handleResourceFile} onSubmit={addResource} onCancel={() => setIsResourceFormOpen(false)} content={content} language={language} />}
        {activeView === "attestations" && <AttestationsView attestations={attestations} courses={courses.map((course) => ({ ...course, title: `${course.title} — ${course.category}` }))} filter={attestationFilter} setFilter={setAttestationFilter} onCreate={(item) => saveAttestations([item, ...attestations])} onStatusChange={(id, status) => saveAttestations(attestations.map((item) => item.id === id ? { ...item, status } : item))} />}
        {activeView === "verification" && <AttestationVerification attestations={attestations} />}
        {activeView === "progression" && <ProgressManagement users={users} courses={published} />}
        {activeView === "progress" && <PedagogicalOverview users={users} courses={published} notes={notes} attestations={attestations} onProgression={() => selectView("progression")} onNotes={() => selectView("notes")} onCertifications={() => selectView("certifications")} />}
        {activeView === "notes" && <NotesManagement notes={notes} onSave={saveNotes} />}
        {activeView === "certifications" && <CertificationManagement attestations={attestations} learners={users} courses={published} onCreate={(item) => saveAttestations([item, ...attestations])} onStatusChange={(id, status) => saveAttestations(attestations.map((item) => item.id === id ? { ...item, status } : item))} />}
        {activeView === "registrations" && <RegistrationManagement registrations={registrations} filter={registrationFilter} setFilter={setRegistrationFilter} onStatusChange={(id, status) => saveRegistrations(registrations.map((item) => item.id === id ? { ...item, status } : item))} onDelete={(id) => saveRegistrations(registrations.filter((item) => item.id !== id))} />}
        {activeView === "communication" && <CommunicationOverview announcements={announcements} notifications={notifications} onAnnouncements={() => selectView("annonces")} onNotifications={() => selectView("notifications")} />}
        {activeView === "annonces" && <AnnouncementManagement announcements={announcements} isFormOpen={isAnnouncementFormOpen} setIsFormOpen={setIsAnnouncementFormOpen} onSave={(items) => saveCommunication("sociolab_admin_announcements", setAnnouncements, items)} />}
        {activeView === "notifications" && <NotificationManagement notifications={notifications} isFormOpen={isNotificationFormOpen} setIsFormOpen={setIsNotificationFormOpen} onSave={(items) => saveCommunication("sociolab_admin_notifications", setNotifications, items)} />}
        {activeView === "settings" && <AdminSettingsView settingsForm={settingsForm} setSettingsForm={setSettingsForm} onPhotoChange={handleProfilePhoto} onSave={saveSettings} settingsSaved={settingsSaved} language={language} />}
        {!['overview', ...userViews, ...formationViews, ...progressViews, ...communicationViews, ...libraryViews, "settings"].includes(activeView) && <section className="admin-empty-view"><div className="admin-empty-icon"><FileText size={32} /></div><span className="admin-kicker">Module en préparation</span><h2>{activeLabel}</h2><p>Cette section est prête à accueillir vos outils de gestion et vos indicateurs.</p><button className="admin-primary-button" type="button" onClick={() => selectView("overview")}>Retour au tableau de bord</button></section>}
      </div>
    </section>
  );
}

function UserTable({ users, roleFilter, onDelete }) {
  const visibleUsers = roleFilter ? users.filter((user) => roleFilter.includes(user.role)) : users;
  return <div className="admin-table-wrap">{visibleUsers.length ? <table className="admin-table"><thead><tr><th>Utilisateur</th><th>Rôle</th><th>Statut</th><th>Dernière activité</th><th aria-label="Actions" /></tr></thead><tbody>{visibleUsers.map((user, index) => <tr key={user.email}><td><div className="admin-table-user"><span className={`admin-table-avatar avatar-${index % 4}`}>{user.initials}</span><span><strong>{user.name}</strong><small>{user.email}</small></span></div></td><td>{user.role}</td><td><span className={`admin-status ${user.status === "Actif" ? "active" : "pending"}`}><i />{user.status}</span></td><td>{index === 0 ? "Aujourd’hui, 09:24" : index === 1 ? "Hier, 16:40" : "Il y a 2 jours"}</td><td><button className="admin-row-action admin-delete-action" type="button" onClick={() => onDelete(user.email)} aria-label={`Supprimer ${user.name}`} title="Supprimer"><Trash2 size={16} /></button></td></tr>)}</tbody></table> : <p className="admin-panel-description">Aucun utilisateur dans cette catégorie.</p>}</div>;
}

function UserForm({ form, setForm, onSubmit, onCancel }) {
  return <form className="admin-inline-form" onSubmit={onSubmit}><label>Nom<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Rôle<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option>Étudiant</option><option>Enseignant</option><option>Administrateur</option></select></label><label>Statut<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>Actif</option><option>En attente</option></select></label><div className="admin-form-actions"><button className="admin-primary-button" type="submit">Ajouter</button><button className="admin-secondary-button" type="button" onClick={onCancel}>Annuler</button></div></form>;
}

function CourseManagement({ courses, onDelete, language, content }) {
  return <section className="admin-panel admin-full-panel"><div className="admin-panel-heading"><div><span className="admin-kicker">Gestion pédagogique</span><h2>Formations publiées</h2><p className="admin-panel-description">Consultez et retirez une formation du catalogue.</p></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Formation</th><th>Enseignant</th><th>Étudiants</th><th>Modules</th><th aria-label="Actions" /></tr></thead><tbody>{courses.map((course) => { const localized = getLocalizedCourse(course, language); return <tr key={course.id}><td><strong>{localized.title}</strong><small className="admin-table-subtext">{getCategoryLabel(content, course.category)}</small></td><td>{course.teacher}</td><td>{course.students}</td><td>{course.modules.length}</td><td><button className="admin-row-action admin-delete-action" type="button" onClick={() => onDelete(course.id)} aria-label={`Delete ${localized.title}`} title="Delete"><Trash2 size={16} /></button></td></tr>; })}</tbody></table></div></section>;
}

function ModuleManagement({ courses, language }) {
  const modules = courses.flatMap((course) => getLocalizedCourse(course, language).modules.map((module) => ({ ...module, courseTitle: getLocalizedCourse(course, language).title })));
  return <section className="admin-panel admin-full-panel"><div className="admin-panel-heading"><div><span className="admin-kicker">Formations</span><h2>Modules</h2><p className="admin-panel-description">Consultez les modules associés aux formations publiées.</p></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Module</th><th>Formation</th><th>Durée</th><th>Activités</th></tr></thead><tbody>{modules.map((module) => <tr key={module.id}><td><strong>{module.title}</strong></td><td>{module.courseTitle}</td><td>{module.hours} h</td><td>{module.lessons.length}</td></tr>)}</tbody></table></div></section>;
}

function CategoryManagement({ courses }) {
  const categories = [...new Set(courses.map((course) => course.category))];
  return <section className="admin-panel admin-full-panel"><div className="admin-panel-heading"><div><span className="admin-kicker">Formations</span><h2>Catégories</h2><p className="admin-panel-description">Visualisez les catégories utilisées par les formations publiées.</p></div></div><div className="admin-category-grid">{categories.map((category) => <article key={category}><strong>{category}</strong><span>{courses.filter((course) => course.category === category).length} formation(s)</span></article>)}</div></section>;
}

function LibraryManagement({ resources, typeFilter, onAdd, onDelete, language, content }) {
  const visibleResources = typeFilter ? resources.filter((resource) => resource.type === typeFilter) : resources;
  const typeKey = ({ Livre: "book", "Article scientifique": "article", Mémoire: "dissertation", Guide: "guide", Rapport: "report" })[typeFilter];
  const title = typeFilter ? content.library.types[typeKey] : content.library.title;
  const typeLabels = content.library.types;
  return <section className="admin-panel admin-full-panel"><div className="admin-panel-heading"><div><span className="admin-kicker">{language === "fr" ? "Gestion documentaire" : "Document management"}</span><h2>{title}</h2><p className="admin-panel-description">{typeFilter ? `${visibleResources.length} ${content.library.available}` : language === "fr" ? "Ajoutez, consultez et supprimez les ressources visibles par les apprenants." : "Add, view and remove resources available to learners."}</p></div><button className="admin-primary-button" type="button" onClick={onAdd}><Archive size={17} />{language === "fr" ? "Ajouter une ressource" : "Add a resource"}</button></div>{visibleResources.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{language === "fr" ? "Ressource" : "Resource"}</th><th>{content.library.type}</th><th>{content.library.author.replace(":", "")}</th><th>{language === "fr" ? "Année" : "Year"}</th><th aria-label={language === "fr" ? "Actions" : "Actions"} /></tr></thead><tbody>{visibleResources.map((resource) => { const localized = getLocalizedResource(resource, language); const category = resource.categoryEn || (localized.category !== resource.category ? localized.category : getCategoryLabel(content, resource.category)); return <tr key={resource.id}><td><strong>{localized.title}</strong><small className="admin-table-subtext">{category}</small></td><td>{typeLabels[({ Livre: "book", "Article scientifique": "article", Mémoire: "dissertation", Guide: "guide", Rapport: "report" })[resource.type]] || resource.type}</td><td>{localized.author}</td><td>{resource.year}</td><td><div className="admin-resource-actions"><a className="admin-row-action" href={resource.url} target="_blank" rel="noreferrer" aria-label={`${language === "fr" ? "Consulter" : "Open"} ${localized.title}`} title={language === "fr" ? "Consulter" : "Open"}><ChevronRight size={18} /></a><button className="admin-row-action admin-delete-action" type="button" onClick={() => onDelete(resource.id)} aria-label={`${language === "fr" ? "Supprimer" : "Delete"} ${localized.title}`} title={language === "fr" ? "Supprimer" : "Delete"}><Trash2 size={16} /></button></div></td></tr>; })}</tbody></table></div> : <div className="admin-empty-view admin-small-empty"><div className="admin-empty-icon"><Archive size={28} /></div><h3>{language === "fr" ? "Aucune ressource" : "No resources"}</h3><p>{language === "fr" ? "Ajoutez la première ressource de cette catégorie." : "Add the first resource in this category."}</p><button className="admin-primary-button" type="button" onClick={onAdd}>{language === "fr" ? "Ajouter une ressource" : "Add a resource"}</button></div>}</section>;
}

function ResourceForm({ form, setForm, onFile, onSubmit, onCancel, content, language }) {
  const labels = content.adminResources;
  return <div className="admin-modal-backdrop"><form className="admin-modal" onSubmit={onSubmit}>
    <div className="admin-panel-heading"><div><span className="admin-kicker">{content.library.title}</span><h2>{language === "fr" ? "Ajouter une ressource" : "Add a resource"}</h2></div><button className="admin-row-action" type="button" onClick={onCancel} aria-label={language === "fr" ? "Fermer" : "Close"}><X size={20} /></button></div>
    <div className="admin-inline-form">
      <label>{labels.title}<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
      <label>{labels.titleEnglish}<input value={form.titleEn} onChange={(event) => setForm({ ...form, titleEn: event.target.value })} /></label>
      <label>{content.library.type}<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="Livre">{content.library.types.book}</option><option value="Article scientifique">{content.library.types.article}</option><option value="Mémoire">{content.library.types.dissertation}</option><option value="Guide">{content.library.types.guide}</option><option value="Rapport">{content.library.types.report}</option></select></label>
      <label>{labels.category}<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label>
      <label>{labels.categoryEnglish}<input value={form.categoryEn} onChange={(event) => setForm({ ...form, categoryEn: event.target.value })} /></label>
      <label>{labels.author}<input value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} /></label>
      <label>{labels.authorEnglish}<input value={form.authorEn} onChange={(event) => setForm({ ...form, authorEn: event.target.value })} /></label>
      <label>{language === "fr" ? "Année" : "Year"}<input type="number" value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} /></label>
      <label className="admin-form-wide">{labels.description}<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
      <label className="admin-form-wide">{labels.descriptionEnglish}<textarea value={form.descriptionEn} onChange={(event) => setForm({ ...form, descriptionEn: event.target.value })} /></label>
      <div className="admin-form-wide admin-upload-group"><span>{language === "fr" ? "Page de couverture" : "Cover image"}</span><label className="admin-file-button"><ImagePlus size={16} />{language === "fr" ? "Choisir une couverture" : "Choose a cover"}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => onFile(event, "cover")} /></label><small>{form.coverName || (language === "fr" ? "Image PNG, JPG ou WEBP · 10 Mo max." : "PNG, JPG or WEBP image · 10 MB max.")}</small><input type="url" value={form.coverSource === "upload" ? "" : form.coverUrl} placeholder={language === "fr" ? "Ou URL de la couverture" : "Or cover image URL"} onChange={(event) => setForm({ ...form, coverUrl: event.target.value, coverName: "", coverSource: "url" })} /></div>
      <div className="admin-form-wide admin-upload-group"><span>{language === "fr" ? "Document à consulter" : "Document"}</span><label className="admin-file-button">{language === "fr" ? "Choisir un PDF" : "Choose a PDF"}<input type="file" accept="application/pdf" onChange={(event) => onFile(event, "pdf")} /></label><small>{form.pdfName || (language === "fr" ? "PDF · 20 Mo max." : "PDF · 20 MB max.")}</small><span className="admin-form-divider">{language === "fr" ? "Ou par lien" : "Or use a link"}</span><input type="url" value={form.pdfSource === "upload" ? "" : form.url} placeholder={language === "fr" ? "https://exemple.com/document.pdf" : "https://example.com/document.pdf"} onChange={(event) => setForm({ ...form, url: event.target.value, pdfUrl: "", pdfName: "", pdfSource: "url" })} /></div>
    </div>
    {form.coverUrl && <img className="admin-resource-cover-preview" src={form.coverUrl} alt={language === "fr" ? "Aperçu de la couverture" : "Cover preview"} />}
    {form.pdfName && <p className="admin-resource-file-preview">{language === "fr" ? "Document sélectionné :" : "Selected document:"} {form.pdfName}</p>}
    <div className="admin-form-actions"><button className="admin-primary-button" type="submit">{language === "fr" ? "Publier la ressource" : "Publish resource"}</button><button className="admin-secondary-button" type="button" onClick={onCancel}>{language === "fr" ? "Annuler" : "Cancel"}</button></div>
  </form></div>;
}

function ProgressManagement({ users, courses }) {
  const [courseId, setCourseId] = useState("all");
  const visibleCourses = courseId === "all" ? courses : courses.filter((course) => String(course.id) === courseId);
  return <section className="admin-panel admin-full-panel"><div className="admin-panel-heading"><div><span className="admin-kicker">Suivi pédagogique</span><h2>Progression des apprenants</h2><p className="admin-panel-description">Suivez l’avancement de chaque apprenant dans les formations publiées.</p></div><select value={courseId} onChange={(event) => setCourseId(event.target.value)} aria-label="Filtrer par formation"><option value="all">Toutes les formations</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></div><div className="admin-progress-grid">{visibleCourses.map((course) => users.filter((user) => user.role === "Étudiante" || user.role === "Étudiant").map((user, index) => { const progress = Math.min(100, Math.max(0, course.progress + index * 8)); return <article className="admin-progress-card" key={`${course.id}-${user.email}`}><div className="admin-table-user"><span className={`admin-table-avatar avatar-${index % 4}`}>{user.initials}</span><span><strong>{user.name}</strong><small>{course.title}</small></span></div><strong>{progress} %</strong><div className="admin-progress-bar"><span style={{ width: `${progress}%` }} /></div><small>{progress === 100 ? "Parcours terminé" : `${course.lessons} activités au total`}</small></article>; }))}</div></section>;
}

function NotesManagement({ notes, onSave }) {
  const [draft, setDraft] = useState(notes);
  const updateNote = (id, value) => setDraft((current) => current.map((item) => item.id === id ? { ...item, note: value, status: value === "" ? "En attente" : "Modifiée" } : item));
  const addNote = () => setDraft((current) => [...current, { id: Date.now(), learner: "Nouvel apprenant", course: "Nouvelle formation", note: "", status: "En attente" }]);
  return <section className="admin-panel admin-full-panel"><div className="admin-panel-heading"><div><span className="admin-kicker">Suivi pédagogique</span><h2>Notes et évaluations</h2><p className="admin-panel-description">Saisissez, modifiez et enregistrez les notes des apprenants.</p></div><button className="admin-primary-button" type="button" onClick={addNote}>Ajouter une note</button></div><div className="admin-table-wrap"><table className="admin-table admin-notes-table"><thead><tr><th>Apprenant</th><th>Formation</th><th>Note / 20</th><th>État</th><th /></tr></thead><tbody>{draft.map((item) => <tr key={item.id}><td><input value={item.learner} onChange={(event) => setDraft((current) => current.map((note) => note.id === item.id ? { ...note, learner: event.target.value } : note))} /></td><td><input value={item.course} onChange={(event) => setDraft((current) => current.map((note) => note.id === item.id ? { ...note, course: event.target.value } : note))} /></td><td><input type="number" min="0" max="20" step="0.5" value={item.note} onChange={(event) => updateNote(item.id, event.target.value)} /></td><td><span className={`admin-status ${item.status === "Validée" ? "active" : "pending"}`}><i />{item.status}</span></td><td><button className="admin-row-action admin-delete-action" type="button" onClick={() => setDraft((current) => current.filter((note) => note.id !== item.id))} aria-label="Supprimer la note"><Trash2 size={16} /></button></td></tr>)}</tbody></table></div><div className="admin-form-actions"><button className="admin-primary-button" type="button" onClick={() => onSave(draft)}>Enregistrer les notes</button></div></section>;
}

function createCertificateId(learner, course) {
  const learnerKey = (learner.email || learner.name).split("@")[0].replace(/[^a-z0-9]/gi, "").slice(0, 12).toUpperCase() || "0000";
  return `SCL-${learnerKey}-${String(course.id).toUpperCase()}-${Date.now().toString().slice(-6)}`;
}

const escapePrintValue = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
const attestationLayoutStyles = '@page{size:A4 landscape;margin:10mm}body{margin:0;padding:0;background:#fff}.certificate{position:relative;box-sizing:border-box;width:277mm;height:190mm;max-width:none;margin:0;padding:22mm 26mm;overflow:hidden}.signature{position:absolute;left:12%;bottom:12mm;width:220px;max-width:28%;height:auto;margin:0}.certificate::after{content:"Direction Pédagogique";position:absolute;left:12%;bottom:43mm;color:#234c5c;font:700 14px Arial,sans-serif}.meta{position:absolute;right:12%;bottom:17mm;margin:0}.seal{margin-top:18px}@media print{body{background:#fff}.certificate{box-shadow:none}}';
const getVerificationUrl = (id) => new URL(`/verifier-attestation/${encodeURIComponent(id)}`, window.location.origin).toString();
const getQrCodeDataUrl = (id) => QRCode.toDataURL(getVerificationUrl(id), { width: 180, margin: 1, color: { dark: "#173846", light: "#ffffff" } });

async function getImageDataUrl(source) {
  const response = await fetch(source);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function printAttestation({ id, learner, course }) {
  const printWindow = window.open("", "_blank", "width=1000,height=800");
  if (!printWindow) return;
  const qrCodeDataUrl = await getQrCodeDataUrl(id);
  const issuedAt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date());
  printWindow.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Attestation ${escapePrintValue(id)}</title><style>body{margin:0;padding:32px;background:#f4f7ff;color:#132238;font-family:Georgia,serif}.certificate{max-width:860px;margin:0 auto;padding:56px;border:16px solid #234c5c;background:#fff;text-align:center;box-shadow:0 20px 50px rgba(15,23,42,.16)}.brand{color:#234c5c;font:700 20px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase}.eyebrow{margin-top:42px;color:#bd6b2b;font:700 13px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase}.title{margin:12px 0 26px;font-size:42px;color:#132238}.name{margin:20px 0;font-size:34px;color:#234c5c}.course{margin:22px 0;font-size:25px;font-weight:700}.meta{margin-top:44px;padding-top:18px;border-top:1px solid #d7dee5;color:#52636f;font:14px Arial,sans-serif}.seal{display:inline-block;margin-top:28px;padding:10px 18px;border:2px solid #bd6b2b;border-radius:999px;color:#9a531d;font:700 13px Arial,sans-serif}.signature{display:block;width:300px;max-width:80%;height:auto;margin:26px auto 0}@media print{body{padding:0;background:#fff}.certificate{box-shadow:none}}</style></head><body><main class="certificate"><div class="brand">SocioLab</div><div class="eyebrow">Attestation officielle de formation</div><h1 class="title">Certificat de réussite</h1><p>Nous attestons que</p><div class="name">${escapePrintValue(learner)}</div><p>a validé la formation</p><div class="course">${escapePrintValue(course)}</div><div class="seal">Formation validée</div><img class="signature" src="${signatureImage}" alt="Signature officielle SocioLab"><div class="meta">Identifiant : ${escapePrintValue(id)}<br>Émise le ${issuedAt}</div></main></body></html>`);
  printWindow.document.write(`<style>${attestationLayoutStyles}</style>`);
  printWindow.document.close();
  printWindow.document.querySelector(".meta")?.insertAdjacentHTML("beforebegin", `<img src="${qrCodeDataUrl}" alt="QR de vérification" style="position:absolute;right:12%;bottom:35mm;width:32mm;height:32mm;object-fit:contain">`);
  printWindow.focus();
  const signature = printWindow.document.querySelector(".signature");
  let hasPrinted = false;
  const print = () => {
    if (hasPrinted) return;
    hasPrinted = true;
    printWindow.print();
  };
  if (signature?.complete) print();
  else if (signature) signature.onload = print;
  printWindow.setTimeout(print, 1500);
}

async function downloadAttestation({ id, learner, course }) {
  const documentHtml = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Attestation ${escapePrintValue(id)}</title><style>body{margin:0;padding:40px;background:#f4f7ff;color:#132238;font-family:Georgia,serif}.certificate{max-width:860px;margin:0 auto;padding:56px;border:16px solid #234c5c;background:#fff;text-align:center}.brand{color:#234c5c;font:700 20px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase}.eyebrow{margin-top:42px;color:#bd6b2b;font:700 13px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase}.title{margin:12px 0 26px;font-size:42px}.name{margin:20px 0;font-size:34px;color:#234c5c}.course{margin:22px 0;font-size:25px;font-weight:700}.meta{margin-top:44px;padding-top:18px;border-top:1px solid #d7dee5;color:#52636f;font:14px Arial,sans-serif}.seal{display:inline-block;margin-top:28px;padding:10px 18px;border:2px solid #bd6b2b;border-radius:999px;color:#9a531d;font:700 13px Arial,sans-serif}.signature{display:block;width:300px;max-width:80%;height:auto;margin:26px auto 0}</style></head><body><main class="certificate"><div class="brand">SocioLab</div><div class="eyebrow">Attestation officielle de formation</div><h1 class="title">Certificat de réussite</h1><p>Nous attestons que</p><div class="name">${escapePrintValue(learner)}</div><p>a validé la formation</p><div class="course">${escapePrintValue(course)}</div><div class="seal">Formation validée</div><img class="signature" src="${signatureImage}" alt="Signature officielle SocioLab"><div class="meta">Identifiant : ${escapePrintValue(id)}</div></main></body></html>`;
  const link = document.createElement("a");
  const signatureDataUrl = await getImageDataUrl(signatureImage);
  const qrCodeDataUrl = await getQrCodeDataUrl(id);
  const downloadableHtml = documentHtml.replace("</style>", `${attestationLayoutStyles}</style>`).replace(signatureImage, signatureDataUrl).replace("</main>", `<img src="${qrCodeDataUrl}" alt="QR de vérification" style="position:absolute;right:12%;bottom:35mm;width:32mm;height:32mm;object-fit:contain"></main>`);
  link.href = URL.createObjectURL(new Blob([downloadableHtml], { type: "text/html;charset=utf-8" }));
  link.download = `attestation-${id}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(link.href), 2000);
}

function CertificationManagement({ attestations, learners, courses, onCreate, onStatusChange }) {
  const studentLearners = learners.filter((user) => user.role === "Étudiante" || user.role === "Étudiant");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({ learnerEmail: studentLearners[0]?.email || "", courseId: String(courses[0]?.id || "") });
  const createCertificate = (event) => {
    event.preventDefault();
    const learner = studentLearners.find((user) => user.email === form.learnerEmail);
    const course = courses.find((item) => String(item.id) === form.courseId);
    if (!learner || !course) return;
    onCreate({ id: createCertificateId(learner, course), learner: learner.name, course: course.title, date: new Intl.DateTimeFormat("fr-FR").format(new Date()), status: "Validée" });
    setIsFormOpen(false);
  };
  return <section className="admin-panel admin-full-panel"><div className="admin-panel-heading"><div><span className="admin-kicker">Suivi pédagogique</span><h2>Certifications</h2><p className="admin-panel-description">Créez, validez ou révoquez les certifications liées aux formations publiées.</p></div><div className="admin-form-actions"><strong>{attestations.filter((item) => item.status === "Validée").length} certification(s) valide(s)</strong><button className="admin-primary-button" type="button" onClick={() => setIsFormOpen((current) => !current)}><Award size={17} />Créer un certificat</button></div></div>{isFormOpen && <form className="admin-inline-form" onSubmit={createCertificate}><label>Apprenant<select required value={form.learnerEmail} onChange={(event) => setForm({ ...form, learnerEmail: event.target.value })}>{studentLearners.map((learner) => <option key={learner.email} value={learner.email}>{learner.name} · {learner.email}</option>)}</select></label><label>Formation valide<select required value={form.courseId} onChange={(event) => setForm({ ...form, courseId: event.target.value })}>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label><p className="admin-form-wide admin-panel-description">L’identifiant unique `SCL-...` sera généré automatiquement à la création.</p><div className="admin-form-actions admin-form-wide"><button className="admin-primary-button" type="submit">Générer le certificat</button><button className="admin-secondary-button" type="button" onClick={() => setIsFormOpen(false)}>Annuler</button></div></form>}{attestations.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Référence</th><th>Apprenant</th><th>Formation</th><th>Date</th><th>Statut</th><th>Action</th></tr></thead><tbody>{attestations.map((item) => <tr key={item.id}><td><strong>{item.id}</strong></td><td>{item.learner}</td><td>{item.course}</td><td>{item.date}</td><td><span className={`admin-status ${item.status === "Validée" ? "active" : item.status === "Révoquée" ? "revoked" : "pending"}`}><i />{item.status}</span></td><td>{item.status === "En attente" && <button className="admin-text-button" type="button" onClick={() => onStatusChange(item.id, "Validée")}>Valider</button>}{item.status === "Validée" && <button className="admin-text-button admin-delete-action" type="button" onClick={() => onStatusChange(item.id, "Révoquée")}>Révoquer</button>}{item.status === "Révoquée" && <button className="admin-text-button" type="button" onClick={() => onStatusChange(item.id, "En attente")}>Rétablir</button>}</td></tr>)}</tbody></table></div> : <p className="admin-panel-description">Aucun certificat enregistré.</p>}</section>;
}

function CommunicationOverview({ announcements, notifications, onAnnouncements, onNotifications }) {
  return <section className="admin-communication-grid"><button className="admin-communication-card" type="button" onClick={onAnnouncements}><span className="admin-stat-icon orange"><Megaphone size={20} /></span><span><strong>Annonces</strong><small>{announcements.length} annonce(s) publiée(s)</small></span><ChevronRight size={18} /></button><button className="admin-communication-card" type="button" onClick={onNotifications}><span className="admin-stat-icon blue"><Bell size={20} /></span><span><strong>Notifications</strong><small>{notifications.length} notification(s) active(s)</small></span><ChevronRight size={18} /></button></section>;
}

function AnnouncementManagement({ announcements, isFormOpen, setIsFormOpen, onSave }) {
  const empty = { title: "", audience: "Tous", content: "" };
  const [form, setForm] = useState(empty);
  const submit = (event) => { event.preventDefault(); if (!form.title.trim() || !form.content.trim()) return; onSave([{ ...form, id: Date.now(), title: form.title.trim(), content: form.content.trim(), date: new Date().toLocaleDateString("fr-FR"), status: "Publiée" }, ...announcements]); setForm(empty); setIsFormOpen(false); };
  return <section className="admin-panel admin-full-panel"><div className="admin-panel-heading"><div><span className="admin-kicker">Communication</span><h2>Annonces</h2><p className="admin-panel-description">Publiez des informations visibles par les utilisateurs de la plateforme.</p></div><button className="admin-primary-button" type="button" onClick={() => setIsFormOpen((current) => !current)}><Megaphone size={17} />Nouvelle annonce</button></div>{isFormOpen && <CommunicationForm title="Créer une annonce" form={form} setForm={setForm} onSubmit={submit} onCancel={() => setIsFormOpen(false)} submitLabel="Publier l’annonce" />}{announcements.length ? <div className="admin-communication-list">{announcements.map((item) => <article key={item.id} className="admin-message-card"><div><span className="admin-kicker">{item.audience} · {item.date}</span><h3>{item.title}</h3><p>{item.content}</p></div><button className="admin-row-action admin-delete-action" type="button" onClick={() => onSave(announcements.filter((announcement) => announcement.id !== item.id))} aria-label={`Supprimer ${item.title}`} title="Supprimer"><Trash2 size={16} /></button></article>)}</div> : <p className="admin-panel-description">Aucune annonce publiée.</p>}</section>;
}

function AdminSettingsView({ settingsForm, setSettingsForm, onPhotoChange, onSave, settingsSaved, language }) {
  return (
    <section className="admin-panel admin-full-panel admin-settings-panel">
      <div className="admin-panel-heading">
        <div>
          <span className="admin-kicker">{language === "fr" ? "Préférences" : "Preferences"}</span>
          <h2>{language === "fr" ? "Paramètres du compte" : "Account settings"}</h2>
        </div>
      </div>
      <form className="admin-settings-form" onSubmit={onSave}>
        <div className="admin-settings-profile">
          <div className="admin-settings-avatar-wrap">
            {settingsForm.photoUrl ? <img className="admin-settings-avatar" src={settingsForm.photoUrl} alt="Profile" /> : <div className="admin-settings-avatar-placeholder">{(settingsForm.name || "A").slice(0, 1).toUpperCase()}</div>}
            <label className="admin-upload-button" htmlFor="admin-profile-photo">{language === "fr" ? "Changer la photo" : "Change photo"}</label>
            <input id="admin-profile-photo" type="file" accept="image/*" onChange={onPhotoChange} hidden />
          </div>
          <div className="admin-settings-main">
            <label>
              <span>{language === "fr" ? "Nom complet" : "Full name"}</span>
              <input value={settingsForm.name} onChange={(event) => setSettingsForm((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label>
              <span>{language === "fr" ? "Adresse e-mail" : "Email address"}</span>
              <input type="email" value={settingsForm.email} onChange={(event) => setSettingsForm((current) => ({ ...current, email: event.target.value }))} />
            </label>
          </div>
        </div>
        <div className="admin-settings-footer">
          <div className="admin-settings-status">
            {settingsSaved && <span className="admin-settings-success">{language === "fr" ? "Modifications enregistrées" : "Changes saved"}</span>}
          </div>
          <button className="admin-primary-button" type="submit">{language === "fr" ? "Enregistrer" : "Save"}</button>
        </div>
      </form>
    </section>
  );
}

function NotificationManagement({ notifications, isFormOpen, setIsFormOpen, onSave }) {
  const empty = { title: "", audience: "Administrateurs", content: "" };
  const [form, setForm] = useState(empty);
  const submit = (event) => { event.preventDefault(); if (!form.title.trim() || !form.content.trim()) return; onSave([{ ...form, id: Date.now(), title: form.title.trim(), content: form.content.trim(), date: new Date().toLocaleDateString("fr-FR"), status: "Active" }, ...notifications]); setForm(empty); setIsFormOpen(false); };
  return <section className="admin-panel admin-full-panel"><div className="admin-panel-heading"><div><span className="admin-kicker">Communication</span><h2>Notifications</h2><p className="admin-panel-description">Créez des alertes internes pour les équipes et les utilisateurs.</p></div><button className="admin-primary-button" type="button" onClick={() => setIsFormOpen((current) => !current)}><Bell size={17} />Nouvelle notification</button></div>{isFormOpen && <CommunicationForm title="Créer une notification" form={form} setForm={setForm} onSubmit={submit} onCancel={() => setIsFormOpen(false)} submitLabel="Activer la notification" />}{notifications.length ? <div className="admin-communication-list">{notifications.map((item) => <article key={item.id} className="admin-message-card"><div><span className="admin-kicker">{item.audience} · {item.date}</span><h3>{item.title}</h3><p>{item.content}</p></div><button className="admin-row-action admin-delete-action" type="button" onClick={() => onSave(notifications.filter((notification) => notification.id !== item.id))} aria-label={`Supprimer ${item.title}`} title="Supprimer"><Trash2 size={16} /></button></article>)}</div> : <p className="admin-panel-description">Aucune notification active.</p>}</section>;
}

function CommunicationForm({ title, form, setForm, onSubmit, onCancel, submitLabel }) {
  return <form className="admin-inline-form admin-communication-form" onSubmit={onSubmit}><div className="admin-form-wide"><span className="admin-kicker">{title}</span></div><label>Titre<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label><label>Audience<select value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })}><option>Tous</option><option>Étudiants</option><option>Enseignants</option><option>Administrateurs</option></select></label><label className="admin-form-wide">Message<textarea required value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} /></label><div className="admin-form-actions"><button className="admin-primary-button" type="submit">{submitLabel}</button><button className="admin-secondary-button" type="button" onClick={onCancel}>Annuler</button></div></form>;
}

function PedagogicalOverview({ users, courses, notes, attestations, onProgression, onNotes, onCertifications }) {
  const learners = users.filter((user) => user.role === "Étudiante" || user.role === "Étudiant").length;
  const validatedNotes = notes.filter((item) => item.status === "Validée").length;
  const pendingCertifications = attestations.filter((item) => item.status === "En attente").length;
  const cards = [
    { label: "Progression", value: `${learners} apprenant(s)`, description: `${courses.length} formation(s) suivie(s)`, action: "Voir la progression", onClick: onProgression },
    { label: "Notes", value: `${notes.length} évaluation(s)`, description: `${validatedNotes} note(s) validée(s)`, action: "Gérer les notes", onClick: onNotes },
    { label: "Certifications", value: `${attestations.length} dossier(s)`, description: `${pendingCertifications} à examiner`, action: "Gérer les certifications", onClick: onCertifications },
  ];
  return <section className="admin-panel admin-full-panel"><div className="admin-welcome"><div><span className="admin-kicker">Pilotage pédagogique</span><h2>Suivi pédagogique</h2><p>Centralisez la progression, les évaluations et les certifications des apprenants.</p></div></div><div className="admin-pedagogical-grid">{cards.map((card) => <article className="admin-pedagogical-card" key={card.label}><span className="admin-kicker">{card.label}</span><strong>{card.value}</strong><p>{card.description}</p><button className="admin-text-button" type="button" onClick={card.onClick}>{card.action}<ChevronRight size={16} /></button></article>)}</div></section>;
}

function RegistrationManagement({ registrations, filter, setFilter, onStatusChange, onDelete }) {
  const filters = ["Toutes", "En attente", "Acceptée", "Refusée"];
  const visibleRegistrations = filter === "Toutes" ? registrations : registrations.filter((item) => item.status === filter);
  const counts = { total: registrations.length, pending: registrations.filter((item) => item.status === "En attente").length, accepted: registrations.filter((item) => item.status === "Acceptée").length };
  return <section className="admin-panel admin-full-panel"><div className="admin-panel-heading"><div><span className="admin-kicker">Gestion des accès</span><h2>Inscriptions</h2><p className="admin-panel-description">Examinez les demandes d’inscription aux formations et gérez leur statut.</p></div><div className="admin-filter-tabs">{filters.map((item) => <button className={filter === item ? "active" : ""} type="button" key={item} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="admin-registration-stats"><article><strong>{counts.total}</strong><span>Total</span></article><article><strong>{counts.pending}</strong><span>À examiner</span></article><article><strong>{counts.accepted}</strong><span>Acceptées</span></article></div>{visibleRegistrations.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Apprenant</th><th>Formation</th><th>Date</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{visibleRegistrations.map((item) => <tr key={item.id}><td><div className="admin-table-user"><span className="admin-table-avatar avatar-0">{item.learner.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span><strong>{item.learner}</strong><small>{item.email}</small></span></div></td><td>{item.course}</td><td>{item.date}</td><td><span className={`admin-status ${item.status === "Acceptée" ? "active" : item.status === "Refusée" ? "revoked" : "pending"}`}><i />{item.status}</span></td><td><div className="admin-registration-actions">{item.status !== "Acceptée" && <button className="admin-text-button" type="button" onClick={() => onStatusChange(item.id, "Acceptée")}>Accepter</button>}{item.status !== "Refusée" && <button className="admin-text-button admin-delete-action" type="button" onClick={() => onStatusChange(item.id, "Refusée")}>Refuser</button>}<button className="admin-row-action admin-delete-action" type="button" onClick={() => onDelete(item.id)} aria-label={`Supprimer l'inscription de ${item.learner}`} title="Supprimer"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div> : <p className="admin-panel-description">Aucune inscription dans ce filtre.</p>}</section>;
}

function AttestationsView({ attestations, courses, filter, setFilter, onCreate, onStatusChange }) {
  const filters = ["Toutes", "En attente", "Validée", "Révoquée"];
  const visibleAttestations = filter === "Toutes" ? attestations : attestations.filter((item) => item.status === filter);
  const counts = { total: attestations.length, pending: attestations.filter((item) => item.status === "En attente").length, valid: attestations.filter((item) => item.status === "Validée").length };
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(() => ({ learnerName: "", courseId: String(courses[0]?.id || ""), certificateId: courses[0] ? createCertificateId({ name: "Nouvel apprenant" }, courses[0]) : "" }));
  const updateLearnerName = (value) => {
    const course = courses.find((item) => String(item.id) === form.courseId) || courses[0];
    setForm({ ...form, learnerName: value, certificateId: course ? createCertificateId({ name: value || "Nouvel apprenant" }, course) : "" });
  };
  const updateCourse = (value) => {
    const course = courses.find((item) => String(item.id) === value);
    setForm({ ...form, courseId: value, certificateId: course ? createCertificateId({ name: form.learnerName || "Nouvel apprenant" }, course) : "" });
  };
  const createAttestation = (event) => {
    event.preventDefault();
    const learnerName = form.learnerName.trim();
    const course = courses.find((item) => String(item.id) === form.courseId);
    if (!learnerName || !course) return;
    const attestation = { id: form.certificateId, learner: learnerName, course: course.title, date: new Intl.DateTimeFormat("fr-FR").format(new Date()), status: "Validée" };
    onCreate(attestation);
    printAttestation(attestation);
    downloadAttestation(attestation);
    setIsFormOpen(false);
  };

  return <section className="admin-attestations-view"><div className="admin-welcome"><div><span className="admin-kicker">Formations / Attestations</span><h2>Gestion des attestations</h2><p>Contrôlez, validez et révoquez les attestations délivrées aux apprenants.</p></div><button className="admin-primary-button" type="button" onClick={() => setIsFormOpen((current) => !current)}><Award size={17} />Créer une attestation</button></div>{isFormOpen && <form className="admin-inline-form" onSubmit={createAttestation}><label>Nom complet<input required value={form.learnerName} onChange={(event) => updateLearnerName(event.target.value)} placeholder="Ex. Aminata Traoré" /></label><label>Formation valide<select required value={form.courseId} onChange={(event) => updateCourse(event.target.value)}>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label><label className="admin-form-wide">ID de l’attestation<input value={form.certificateId} readOnly /></label><small className="admin-form-wide admin-panel-description">Cet identifiant est proposé automatiquement par le système.</small><div className="admin-form-actions admin-form-wide"><button className="admin-primary-button" type="submit">Créer l’attestation</button><button className="admin-secondary-button" type="button" onClick={() => setIsFormOpen(false)}>Annuler</button></div></form>}<div className="admin-attestation-stats"><article><span className="admin-stat-icon blue"><FileText size={19} /></span><div><strong>{counts.total}</strong><p>Total délivré</p></div></article><article><span className="admin-stat-icon orange"><ClipboardList size={19} /></span><div><strong>{counts.pending}</strong><p>À valider</p></div></article><article><span className="admin-stat-icon green"><Award size={19} /></span><div><strong>{counts.valid}</strong><p>Attestations valides</p></div></article></div><section className="admin-panel admin-full-panel"><div className="admin-panel-heading"><div><span className="admin-kicker">Registre officiel</span><h2>Attestations des apprenants</h2></div><div className="admin-filter-tabs">{filters.map((item) => <button className={filter === item ? "active" : ""} type="button" key={item} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Référence</th><th>Apprenant</th><th>Formation</th><th>Date</th><th>Statut</th><th aria-label="Actions" /></tr></thead><tbody>{visibleAttestations.map((item) => <tr key={item.id}><td><strong>{item.id}</strong></td><td>{item.learner}</td><td>{item.course}</td><td>{item.date}</td><td><span className={`admin-status ${item.status === "Validée" ? "active" : item.status === "Révoquée" ? "revoked" : "pending"}`}><i />{item.status}</span></td><td><div className="admin-attestation-actions">{item.status === "En attente" && <button type="button" onClick={() => onStatusChange(item.id, "Validée")}>Valider</button>}{item.status === "Validée" && <button type="button" onClick={() => onStatusChange(item.id, "Révoquée")}>Révoquer</button>}{item.status === "Révoquée" && <button type="button" onClick={() => onStatusChange(item.id, "Validée")}>Rétablir</button>}</div></td></tr>)}</tbody></table></div></section></section>;
}

export default AdminDashboard;
