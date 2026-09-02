import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import defaultCourses from "../data/courses";
import { defaultLanguage, translations } from "../i18n/translations";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [selectedRole, setSelectedRole] = useState("student");
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem("sociolab_authenticated") === "true");
  const [language, setLanguage] = useState(defaultLanguage);
  const [theme, setTheme] = useState(() => localStorage.getItem("sociolab_theme") || "light");
  //const [learnerName, setLearnerName] = useState("Apprenant SocioLab");
  //const [learnerId, setLearnerId] = useState("SL-0000");
  const [learnerName, setLearnerName] = useState(() => {
  return localStorage.getItem("sociolab_learnerName") || "Apprenant SocioLab";
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
    localStorage.setItem("sociolab_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const [profile, setProfile] = useState({
    name: "Enseignant SocioLab",
    photoUrl: "",
    photoName: "",
    emoji: "👩‍🏫",
    description: "Professeur passionné par l’accompagnement des apprenants en sciences humaines et sociales.",
    address: "Dakar, Sénégal",
  });
  const [courses, setCourses] = useState(defaultCourses);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([1]);
  const [completedLessons, setCompletedLessons] = useState(["soc-1-0", "soc-1-1", "soc-1-2", "soc-2-0"]);
  const [publishedCourses, setPublishedCourses] = useState([1, 4]);

  const enrollCourse = useCallback((courseId) => {
    setEnrolledCourseIds((current) => (current.includes(courseId) ? current : [...current, courseId]));
  }, []);

  const toggleLesson = useCallback((lessonKey) => {
    setCompletedLessons((current) => (
      current.includes(lessonKey) ? current.filter((key) => key !== lessonKey) : [...current, lessonKey]
    ));
  }, []);

  const getCourseProgress = useCallback((course) => {
    const lessonKeys = course.modules.flatMap((module) => module.lessons.map((_, index) => `${module.id}-${index}`));
    if (!lessonKeys.length) return 0;
    return Math.round((lessonKeys.filter((key) => completedLessons.includes(key)).length / lessonKeys.length) * 100);
  }, [completedLessons]);

  const signIn = useCallback(() => {
    setIsAuthenticated(true);
    localStorage.setItem("sociolab_authenticated", "true");
  }, []);

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
    setSelectedRole("student");
    setLearnerName("Apprenant SocioLab");
    setLearnerId("SL-0000");
    setLearnerEmail("");
    setStudentProfile({ photoUrl: "", photoName: "" });
    localStorage.removeItem("sociolab_authenticated");
    localStorage.removeItem("sociolab_learnerName");
    localStorage.removeItem("sociolab_learnerId");
    localStorage.removeItem("sociolab_learnerEmail");
  }, []);

  const publishCourse = useCallback((course) => {
    setCourses((current) => {
      const id = Math.max(0, ...current.map((item) => item.id)) + 1;
      const modules = course.modules
        .filter((module) => module.title.trim() && module.lessons.some((lesson) => lesson.trim()))
        .map((module, index) => ({
          ...module,
          id: `course-${id}-module-${index + 1}`,
          lessons: module.lessons.filter((lesson) => lesson.trim()),
        }));
      const newCourse = {
        ...course,
        id,
        modules,
        lessons: modules.reduce((total, module) => total + module.lessons.length, 0),
        duration: `${modules.reduce((total, module) => total + module.hours, 0)} h`,
        students: 0,
        progress: 0,
      };
      setPublishedCourses((published) => [id, ...published]);
      return [newCourse, ...current];
    });
  }, []);

  const value = useMemo(() => ({
    selectedRole, setSelectedRole, isAuthenticated, learnerName, setLearnerName, learnerId, setLearnerId, learnerEmail, setLearnerEmail, studentProfile, setStudentProfile, profile, setProfile, courses, enrolledCourseIds, completedLessons, publishedCourses,
    signIn, signOut, enrollCourse, toggleLesson, getCourseProgress, publishCourse, language, setLanguage, theme, setTheme, translations,
  }), [selectedRole, isAuthenticated, learnerName, learnerId, learnerEmail, studentProfile, profile, courses, enrolledCourseIds, completedLessons, publishedCourses, signIn, signOut, enrollCourse, toggleLesson, getCourseProgress, publishCourse, language, theme]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
