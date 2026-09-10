import { useEffect, useState } from "react"; 
import { NavLink, Outlet, useLocation } from "react-router-dom";   
import logo from "../assets/sociolab-logo.svg"; 
import "../App.css"; 
import { useAppContext } from "../context/AppContext";             
import { Menu, X } from "lucide-react";
function Layout() {
  const { language, setLanguage, theme, setTheme, translations } = useAppContext();   
  const location = useLocation();
  const content = translations[language];
  const isDarkMode = theme === "dark";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  useEffect(() => {
    const targets = document.querySelectorAll(".reveal-section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          } 
        }); 
      },
      { rootMargin: "0px 0px -120px 0px", threshold: 0.15 }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <div className="app-frame">
      <header className="topbar">
        <NavLink className="brand" to="/" end>
          <img src={logo} alt="SocioLab logo" className="brand-logo" />
          <div>
            <span className="brand-name">SocioLab Mali</span>
            <small>{content.layout.brandTagline}</small>
          </div>
        </NavLink>
        <button className="mobile-menu-toggle" type="button" onClick={() => setMobileNavOpen((current) => !current)} aria-expanded={mobileNavOpen} aria-controls="main-navigation" aria-label={mobileNavOpen ? "Fermer le menu" : "Ouvrir le menu"}>
          {mobileNavOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
        <nav id="main-navigation" className={`topnav ${mobileNavOpen ? "is-open" : ""}`}>
          <NavLink to="/" end onClick={() => setMobileNavOpen(false)}>
            {content.layout.nav.home}
          </NavLink>
          <NavLink to="/courses" onClick={() => setMobileNavOpen(false)}>{content.layout.nav.courses}</NavLink>
          <NavLink to="/library" onClick={() => setMobileNavOpen(false)}>{content.layout.nav.library}</NavLink>
          <NavLink to="/fieldwork" onClick={() => setMobileNavOpen(false)}>{content.layout.nav.fieldwork}</NavLink>
          <NavLink to="/register" onClick={() => setMobileNavOpen(false)}>{content.layout.nav.register}</NavLink>
          <NavLink to="/login" onClick={() => setMobileNavOpen(false)}>{content.layout.nav.login}</NavLink>
          <label
            className={`theme-switch ${isDarkMode ? "dark" : "light"}`}
            aria-label={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
          >
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={() => setTheme(isDarkMode ? "light" : "dark")}
            />
            <span className="switch-slider" aria-hidden="true">
              <span className="switch-icon switch-icon-sun">☀️</span>
              <span className="switch-icon switch-icon-moon">🌙</span>
              <span className="switch-thumb" />
            </span>
          </label>
          <select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label={content.common.language}>
            <option value="fr">{content.common.french}</option>
            <option value="en">{content.common.english}</option>
          </select>
        </nav>
      </header>
      <main className="page-shell">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>{content.layout.footer}</p>
      </footer>
    </div>
  );
}

export default Layout;
