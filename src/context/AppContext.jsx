import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import defaultCourses from "../data/courses";
import defaultLibraryResources from "../pages/library.js";
import { defaultLanguage, translations } from "../i18n/translations";

const AppContext = createContext(null); 

export function AppProvider({ children }) {
  const [selectedRole, setSelectedRole] = useState(() => sessionStorage.getItem("sociolab_selectedRole") || "student");
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem("sociolab_authenticated") === "true");
  const [language, setLanguage] = useState(() => localStorage.getItem("sociolab_language") || defaultLanguage);
  const [theme, setTheme] = useState(() => localStorage.getItem("sociolab_theme") || "light");
  //const [learnerName, setLearnerName] = useState("Enseignant SocioLab");
  //const [learnerId, setLearnerId] = useState("SL-0000");
  const [learnerName, setLearnerName] = useState(() => {
  return localStorage.getItem("sociolab_learnerName") || "Enseignant SocioLab";
});

  const [learnerId, setLearnerId] = useState(() => {
  return localStorage.getItem("sociolab_learnerId") || "SL-0000";
});
  const [learnerEmail, setLearnerEmail] = useState(() => {
    return localStorage.getItem("sociolab_learnerEmail") || "";
  });
  const [studentProfile, setStudentProfile] = useState({
    photoUrl: "",
    photoName: "",
  });


  useEffect(() => {
    localStorage.setItem("sociolab_learnerName", learnerName);
  }, [learnerName]);

  useEffect(() => {
    localStorage.setItem("sociolab_learnerId", learnerId);
  }, [learnerId]);

  useEffect(() => {
    localStorage.setItem("sociolab_learnerEmail", learnerEmail);
  }, [learnerEmail]);

  useEffect(() => {
    sessionStorage.setItem("sociolab_selectedRole", selectedRole);
  }, [selectedRole]);

  useEffect(() => {
    localStorage.setItem("sociolab_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("sociolab_language", language);
    document.documentElement.lang = language;
  }, [language]);

  const [profile, setProfile] = useState({
    name: "Enseignant SocioLab",
    photoUrl: "",
    photoName: "",
    emoji: "👩‍🏫",
    description: "Professeur passionné par l’accompagnement des apprenants en sciences humaines et sociales.",
    address: "Dakar, Sénégal",
  });
  const [courses, setCourses] = useState(() => {
    const storedCourses = localStorage.getItem("sociolab_courses");
    if (!storedCourses) return defaultCourses;
 
    try {
      return JSON.parse(storedCourses);
    } catch {
      return defaultCourses;
    }
  });
  const [libraryResources, setLibraryResources] = useState(() => {
    const storedResources = localStorage.getItem("sociolab_library_resources");
    if (!storedResources) return defaultLibraryResources;

    try {
      return JSON.parse(storedResources);
    } catch {
      return defaultLibraryResources;
    }
  });
  const [notifications, setNotifications] = useState(() => {
    const storedNotifications = localStorage.getItem("sociolab_admin_notifications");
    const defaults = [{ id: 1, title: "Nouvelle inscription", audience: "Administrateurs", date: "10 sept. 2026", status: "Active", content: "Une nouvelle inscription nécessite votre attention." }];
    if (!storedNotifications) return defaults;
    try { return JSON.parse(storedNotifications); } catch { return defaults; }
  });
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([1]);
  const [completedLessons, setCompletedLessons] = useState(["soc-1-0", "soc-1-1", "soc-1-2", "soc-2-0"]);
  const [publishedCourses, setPublishedCourses] = useState(() => {
    const storedPublishedCourses = localStorage.getItem("sociolab_published_courses");
    if (!storedPublishedCourses) return [1, 4];

    try {
      const parsed = JSON.parse(storedPublishedCourses);
      return Array.isArray(parsed) && parsed.length ? parsed : [1, 4];
    } catch {
      return [1, 4];
    }
  });

  
  useEffect(() => {
    localStorage.setItem("sociolab_courses", JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem("sociolab_library_resources", JSON.stringify(libraryResources));
  }, [libraryResources]);

  useEffect(() => {
    localStorage.setItem("sociolab_admin_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("sociolab_published_courses", JSON.stringify(publishedCourses));
  }, [publishedCourses]);

  const enrollCourse = useCallback((courseId) => {
    setEnrolledCourseIds((current) => (current.includes(courseId) ? current : [...current, courseId]));
  }, []);

  const toggleLesson = useCallback((lessonKey) => {
    setCompletedLessons((current) => (
      current.includes(lessonKey) ? current.filter((key) => key !== lessonKey) : [...current, lessonKey]
    ));
  }, []);

  const completedLessonsSet = useMemo(() => new Set(completedLessons), [completedLessons]);

  const getCourseProgress = useCallback((course) => {
    const lessonKeys = course.modules.flatMap((module) => module.lessons.map((_, index) => `${module.id}-${index}`));
    if (!lessonKeys.length) return 0;

    const completedCount = lessonKeys.reduce((count, key) => count + (completedLessonsSet.has(key) ? 1 : 0), 0);
    return Math.round((completedCount / lessonKeys.length) * 100);
  }, [completedLessonsSet]);

  const signIn = useCallback(() => {
    setIsAuthenticated(true);
    sessionStorage.setItem("sociolab_authenticated", "true");
  }, []);

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
    setSelectedRole("student");
    setLearnerName("Enseignant SocioLab");
    setLearnerId("SL-0000");
    setLearnerEmail("");
    setStudentProfile({ photoUrl: "", photoName: "" });
    sessionStorage.removeItem("sociolab_authenticated");
    sessionStorage.removeItem("sociolab_selectedRole");
    localStorage.removeItem("sociolab_learnerName");
    localStorage.removeItem("sociolab_learnerId");
    localStorage.removeItem("sociolab_learnerEmail");
  }, []);

  const publishCourse = useCallback((course) => {
    const nextId = Math.max(0, ...courses.map((item) => Number(item.id) || 0)) + 1;
    const modules = course.modules
      .filter((module) => module.title.trim() && module.lessons.some((lesson) => lesson.trim()))
      .map((module, index) => ({
        ...module,
        id: `course-${nextId}-module-${index + 1}`,
        lessons: module.lessons.filter((lesson) => lesson.trim()),
      }));

    const newCourse = {
      ...course,
      id: nextId,
      isPublished: true,
      modules,
      lessons: modules.reduce((total, module) => total + module.lessons.length, 0),
      duration: `${modules.reduce((total, module) => total + module.hours, 0)} h`,
      students: 0,
      progress: 0,
    };

    setCourses((current) => [newCourse, ...current]);
    setPublishedCourses((current) => (current.includes(nextId) ? current : [nextId, ...current]));
  }, [courses]);

  const deleteCourse = useCallback((courseId) => {
    setCourses((current) => current.filter((course) => course.id !== courseId));
    setPublishedCourses((current) => current.filter((id) => id !== courseId));
  }, []);

  const addLibraryResource = useCallback((resource) => {
    setLibraryResources((current) => [{ ...resource, id: Date.now() }, ...current]);
  }, []);

  const deleteLibraryResource = useCallback((resourceId) => {
    setLibraryResources((current) => current.filter((resource) => resource.id !== resourceId));
  }, []);

  const value = useMemo(() => ({
    selectedRole, setSelectedRole, isAuthenticated, learnerName, setLearnerName, learnerId, setLearnerId, learnerEmail, setLearnerEmail, studentProfile, setStudentProfile, profile, setProfile, courses, enrolledCourseIds, completedLessons, publishedCourses, setPublishedCourses,
    signIn, signOut, enrollCourse, toggleLesson, getCourseProgress, publishCourse, deleteCourse, libraryResources, addLibraryResource, deleteLibraryResource, notifications, setNotifications, language, setLanguage, theme, setTheme, translations,
  }), [selectedRole, isAuthenticated, learnerName, learnerId, learnerEmail, studentProfile, profile, courses, enrolledCourseIds, completedLessons, publishedCourses, deleteCourse, libraryResources, addLibraryResource, deleteLibraryResource, notifications, signIn, signOut, enrollCourse, toggleLesson, getCourseProgress, publishCourse, language, theme]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
