import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { AppProvider, useAppContext } from "./context/AppContext";
import Layout from "./components/layout";
import Home from "./pages/home";
import Courses from "./pages/courses";
import CourseDetails from "./pages/course-details";
import StudentDashboard from "./pages/dashboard-student";
import InstructorDashboard from "./pages/dashboard-instructor";
import Login from "./pages/login";
import Fieldwork from "./pages/fieldwork";  
import Library from "./pages/library.jsx";
import AdminDashboard from "./pages/dashboard-admin";

function DashboardRoute({ children, role }) {
  const { isAuthenticated, selectedRole } = useAppContext();

  if (!isAuthenticated || (role && selectedRole !== role)) return <Navigate to="/login" replace />;

  return children;
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="courses" element={<Courses />} />
            <Route path="course/:id" element={<CourseDetails />} />
            <Route path="dashboard/student" element={<DashboardRoute role="student"><StudentDashboard /></DashboardRoute>} />
            <Route path="dashboard/etudiant" element={<DashboardRoute role="student"><StudentDashboard /></DashboardRoute>} />
            <Route path="dashboard-student" element={<DashboardRoute role="student"><StudentDashboard /></DashboardRoute>} />
            <Route path="dashboard/instructor" element={<DashboardRoute role="instructor"><InstructorDashboard /></DashboardRoute>} />
            <Route path="dashboard/enseignant" element={<DashboardRoute role="instructor"><InstructorDashboard /></DashboardRoute>} />
            <Route path="dashboard-instructor" element={<DashboardRoute role="instructor"><InstructorDashboard /></DashboardRoute>} />
            <Route path="dashboard-instructeur" element={<DashboardRoute role="instructor"><InstructorDashboard /></DashboardRoute>} />
            <Route path="dashboard/admin" element={<DashboardRoute role="admin"><AdminDashboard /></DashboardRoute>} />
            <Route path="dashboard-admin" element={<DashboardRoute role="admin"><AdminDashboard /></DashboardRoute>} />
            <Route path="dashboard-administrateur" element={<DashboardRoute role="admin"><AdminDashboard /></DashboardRoute>} />
            <Route path="fieldwork" element={<Fieldwork />} />
            <Route path="register" element={<Login />} />
            <Route path="login" element={<Login />} />
            <Route path="library" element={<Library />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
