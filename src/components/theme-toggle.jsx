import { useAppContext } from "../context/AppContext";

function ThemeToggle() {
  const { language, theme, setTheme } = useAppContext();
  const isDarkMode = theme === "dark";
  const label = language === "fr"
    ? isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"
    : isDarkMode ? "Switch to light mode" : "Switch to dark mode";

  return (
    <label className={`theme-switch ${isDarkMode ? "dark" : "light"}`} aria-label={label} title={label}>
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
      <span className="visually-hidden">{language === "fr" ? "Thème clair ou sombre" : "Light or dark theme"}</span>
    </label>
  );
}

export default ThemeToggle;
