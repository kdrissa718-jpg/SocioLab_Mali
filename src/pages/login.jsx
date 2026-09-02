import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import learningImage from "../assets/img1.jpg";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedRole, setLearnerName, setLearnerId, setLearnerEmail, setProfile, signIn, language, translations } = useAppContext();
  const content = translations[language];
  const [mode, setMode] = useState(location.pathname === "/login" ? "login" : "register");

  useEffect(() => {
    setMode(location.pathname === "/login" ? "login" : "register");
  }, [location.pathname]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    navigate(nextMode === "login" ? "/login" : "/register", { replace: false });
  };
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
    specialty: "",
  });
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    role: "student",
  });

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterData((current) => ({ ...current, [name]: value }));
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginData((current) => ({ ...current, [name]: value }));
  };

 const handleRegisterSubmit = (event) => {
  event.preventDefault();

  const nextLearnerId = `SL-${Date.now().toString().slice(-6)}`;

  const nextName =
    registerData.fullName?.trim() || "Apprenant SocioLab Mali";
    //console.log("Nom de l'apprenant :", nextName);

  const nextPath =
    registerData.role === "instructor"
      ? "/dashboard/instructor"
      : "/dashboard/student";

  setSelectedRole(registerData.role);

  setLearnerName(nextName);

  setLearnerId(nextLearnerId);
  setLearnerEmail(registerData.email.trim());

  setProfile((current) => ({
    ...current,
    name: nextName,
    fullName: nextName,
  }));

  signIn();
  navigate(nextPath);
};

const handleLoginSubmit = (event) => {
  event.preventDefault();

  const nextLearnerId = `SL-${Date.now().toString().slice(-6)}`;

  // Pour l'instant, le formulaire de connexion ne contient
  // pas de champ fullName.
  const nextName = "Apprenant SocioLab Mali";

  const nextPath =
    loginData.role === "instructor"
      ? "/dashboard/instructor"
      : "/dashboard/student";

  setSelectedRole(loginData.role);
  setLearnerName(nextName);
  setLearnerId(nextLearnerId);
  setLearnerEmail(loginData.email.trim());

  setProfile((current) => ({
    ...current,
    name: nextName,
    fullName: nextName,
  }));

  signIn();
  navigate(nextPath);
};
  

  return (
    <section className="auth-shell reveal-section">
      <div className="auth-visual">
        <div className="auth-badge">SocioLab Mali</div>
        <div className="auth-visual-image-wrap">
          <img src={learningImage} alt="Apprentissage SocioLab Mali" className="auth-visual-image" />
        </div>
        <h1>Votre espace d’apprentissage commence ici.</h1>
        <p>Rejoignez une communauté dédiée à la compréhension du monde, à la pensée critique et à la progression personnelle.</p>
        <ul>
          <li>Parcours accessibles et structurés</li>
          <li>Contenus pensés pour les sciences humaines et sociales</li>
          <li>Suivi clair pour étudiants et enseignants</li>
        </ul>
      </div>

      <div className="auth-panel">
        <div className="auth-tabs" role="tablist" aria-label={content.login.modeAriaLabel}>
          <button
            type="button"
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => switchMode("register")}
          >
            {content.login.tabs.register}
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => switchMode("login")}
          >
            Se connecter
          </button>
        </div>

        {mode === "register" ? (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="fullName">{content.login.fields.fullName}</label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={registerData.fullName}
                onChange={handleRegisterChange}
                required
                placeholder={content.login.fields.fullNamePlaceholder}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="registerEmail">{content.login.fields.email}</label>
              <input
                id="registerEmail"
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
                placeholder={content.login.fields.emailPlaceholder}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="registerPassword">Mot de passe</label>
              <input
                id="registerPassword"
                type="password"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
                placeholder="Entrez votre mot de passe"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="specialty">Spécialité</label>
              <input
                id="specialty"
                type="text"
                name="specialty"
                value={registerData.specialty}
                onChange={handleRegisterChange}
                required
                placeholder="Ex. Sociologie, Histoire, Éducation..."
              />
            </div>

            <div className="auth-field">
              <label htmlFor="registerRole">{content.login.fields.role}</label>
              <select
                id="registerRole"
                name="role"
                value={registerData.role}
                onChange={handleRegisterChange}
              >
                <option value="student">{content.roles.student}</option>
                <option value="instructor">{content.roles.instructor}</option>
              </select>
            </div>

            <button className="btn btn-primary auth-submit" type="submit">
              {content.login.actions.createAccount}
            </button>
            <p className="auth-footer">
              {content.login.actions.alreadyMember}
              <button type="button" className="auth-link" onClick={() => switchMode("login")}>
                {content.login.tabs.login}
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="loginEmail">{content.login.fields.email}</label>
              <input
                id="loginEmail"
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
                placeholder={content.login.fields.emailPlaceholder}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="loginPassword">{content.login.fields.password}</label>
              <input
                id="loginPassword"
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
                placeholder={content.login.fields.passwordPlaceholder}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="loginRole">{content.login.fields.role}</label>
              <select
                id="loginRole"
                name="role"
                value={loginData.role}
                onChange={handleLoginChange}
              >
                <option value="student">{content.roles.student}</option>
                <option value="instructor">{content.roles.instructor}</option>
              </select>
            </div>

            <div className="auth-row">
              <label className="auth-checkbox">
                <input type="checkbox" />
                <span>{content.login.fields.stayLoggedIn}</span>
              </label>
              <button type="button" className="auth-link">
                {content.login.fields.forgotPassword}
              </button>
            </div>

            <button className="btn btn-primary auth-submit" type="submit">
              {content.login.actions.connect}
            </button>
            <p className="auth-footer">
              {content.login.actions.notMember}
              <button type="button" className="auth-link" onClick={() => switchMode("register")}>
                {content.login.actions.createLink}
              </button>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

export default Login;
