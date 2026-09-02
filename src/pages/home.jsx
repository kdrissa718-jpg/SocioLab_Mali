import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import "./home.css";
import heroImage from "../assets/img1.jpg";
import heroImage1 from "../assets/img2.jpg";
import heroImage2 from "../assets/img3.jpg";
import heroImage3 from "../assets/img4.jpg";
import heroImage4 from "../assets/img5.jpg";

import heroSlide1 from "../assets/img0005.jpg";
import heroSlide2 from "../assets/img0006.jpg";
import heroSlide3 from "../assets/img01.jpg";
import heroSlide4 from "../assets/img05.jpg";
import heroSlide5 from "../assets/img18.jpg";             
const domains = [
  { title: "Sociologie", description: "Comprenez les dynamiques sociales, les groupes et les transformations contemporaines." },
  { title: "Histoire", description: "Analysez les grandes périodes, les mémoires collectives et les enjeux du passé." },
  { title: "Géographie", description: "Explorez les espaces, les territoires et les rapports entre sociétés et environnement." },
  { title: "Philosophie", description: "Développez votre pensée critique et votre capacité à questionner le monde." },
  { title: "Éducation", description: "Étudiez les pratiques pédagogiques et les enjeux de l’apprentissage au fil du temps." },
  { title: "Sciences politiques", description: "Approfondissez les institutions, les pouvoirs et les débats démocratiques." },
  { title: "Anthropologie", description: "Observez les cultures, les pratiques et les relations entre les groupes humains." },
  { title: "Économie", description: "Analysez les échanges, le développement et les inégalités économiques." },
  { title: "Communication", description: "Décryptez les médias, les récits publics et les usages numériques." },
  { title: "Méthodologie", description: "Concevez des enquêtes, collectez des données et restituez vos résultats." },
  { title: "Genre et Societe", description: "Examinez les rapports sociaux, les identités et les enjeux liés au genre et à la société." },
];

const highlights = [
  { value: "24+", label: "parcours actifs" },
  { value: "98%", label: "de satisfaction" },
  { value: "7j/7", label: "accessibilité" },
];

function Home() {
  const navigate = useNavigate();
    const heroSlides = [
    {
      image: heroSlide1,
      alt: "Apprentissage en sciences sociales avec SocioLab",
    },
    {
      image: heroSlide2,
      alt: "Étudiants en formation avec SocioLab",
    },
    {
      image: heroSlide3,
      alt: "Recherche et enquête de terrain",
    },
    {
      image: heroSlide4,
      alt: "Formation numérique et sciences sociales",
    },
    {
      image: heroSlide5,
      alt: "Apprentissage collaboratif SocioLab",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((current) =>
        current === heroSlides.length - 1 ? 0 : current + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((current) =>
      current === heroSlides.length - 1 ? 0 : current + 1
    );
  };

  const previousSlide = () => {
    setCurrentSlide((current) =>
      current === 0 ? heroSlides.length - 1 : current - 1
    );
  };
  const { selectedRole, setSelectedRole, courses: catalogCourses, language, translations } = useAppContext();
  const content = translations[language];
  const modules = catalogCourses.flatMap((course) => course.modules.map((module) => ({ ...module, courseTitle: course.title, category: course.category })));
                                              
  const handleSelectRole = (role, path) => {
    setSelectedRole(role);
    navigate(path);
  };

  return (
    <section className="home-page">
      <section className="hero-section reveal-section">
        <div className="hero-content">
          <span className="eyebrow">{content.home.hero.eyebrow}</span>
          <h1>{content.home.hero.title}</h1>
          <p>{content.home.hero.description}</p>

          <div className="hero-actions">
            <Link to="/courses" className="btn btn-primary">
              {content.home.hero.primaryCta}
            </Link>
            <Link to="/login" className="btn btn-outline">
              {content.home.hero.secondaryCta}
            </Link>
          </div>

          <div className="hero-stats" aria-label="Statistiques de la plateforme">
            {highlights.map((item) => (
              <div key={item.label}>
                <strong>{item.value}</strong>
                <span>{language === "fr" ? item.label : content.home.stats[language === "en" ? (item.label === "parcours actifs" ? "active" : item.label === "de satisfaction" ? "satisfaction" : "accessibility") : ""]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-side">
  <div className="hero-visual hero-slider">

    <div className="hero-slide">
      <img
        src={heroSlides[currentSlide].image}
        alt={heroSlides[currentSlide].alt}
      />
    </div>

    <button
      type="button"
      className="slider-button slider-button--prev"
      onClick={previousSlide}
      aria-label="Image précédente"
    >
      ‹
    </button>

    <button
      type="button"
      className="slider-button slider-button--next"
      onClick={nextSlide}
      aria-label="Image suivante"
    >
      ›
    </button>

    <div className="slider-dots">
      {heroSlides.map((slide, index) => (
        <button
          key={slide.image}
          type="button"
          className={`slider-dot ${
            index === currentSlide ? "active" : ""
          }`}
          onClick={() => setCurrentSlide(index)}
          aria-label={`Afficher l'image ${index + 1}`}
          aria-current={index === currentSlide ? "true" : undefined}
        />
      ))}
    </div>

  </div>

  <div className="hero-card">
            <h2>{content.home.hero.currentMode} {selectedRole === "instructor" ? content.roles.instructor : content.roles.student}</h2>
            <p>{content.home.hero.currentModeDescription}</p>
            <div className="role-buttons">
              <button
                type="button"                
                className="btn btn-primary"        
                onClick={() => handleSelectRole("student", "/dashboard/etudiant")}
              >
                {content.home.hero.studentButton}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleSelectRole("instructor", "/dashboard/enseignant")}
              >
                {content.home.hero.instructorButton}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block reveal-section">
        <div className="section-heading">
          <span className="eyebrow">{content.home.search.eyebrow}</span>
          <h2>{content.home.search.title}</h2>
        </div>

        <div className="search-panel">
          <div className="search-box">
            <span className="search-icon">🔎</span>
            <input type="text" placeholder={content.common.searchPlaceholder} />
          </div>
          <Link to="/courses" className="btn btn-primary">
            {content.common.viewAll}
          </Link>
        </div>
      </section>

      <section className="section-block reveal-section">
        <div className="section-heading">
          <span className="eyebrow">{content.home.domains.eyebrow}</span>
          <h2>{content.home.domains.title}</h2>
        </div>

        <div className="domain-grid">
          {domains.map((domain) => (
            <article key={domain.title} className="domain-card">
              <img className="domain-image" src={catalogCourses.find((course) => course.category === domain.title)?.imageUrl || heroImage} alt={`${content.home.domains.imageAlt} ${domain.title}`} onError={(event) => { event.currentTarget.src = heroImage; }} />
              <h3>{domain.title}</h3>
              <p>{domain.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block reveal-section section-block--featured">
        <div className="section-heading">
          <span className="eyebrow">{content.home.popular.eyebrow}</span>
          <h2>{content.home.popular.title}</h2>
        </div>

        <div className="course-grid">
          {catalogCourses.map((course) => (
            <article key={course.id} className="course-card home-course-card">
              <img className="home-course-image" src={course.imageUrl || heroImage} alt={`${content.home.courseImageAlt} ${course.title}`} onError={(event) => { event.currentTarget.src = heroImage; }} />
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <Link to={`/course/${course.id}`} className="text-link">
                {content.common.discoverPath}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block reveal-section">
        <div className="section-heading">
          <span className="eyebrow">{content.home.modules.eyebrow}</span>
          <h2>{content.home.modules.title}</h2>
        </div>
        <div className="module-showcase-grid">
          {modules.map((module) => (
            <article key={module.id} className="home-module-card">
              <img src={module.imageUrl || heroImage} alt={`${content.home.moduleImageAlt} ${module.title}`} onError={(event) => { event.currentTarget.src = heroImage; }} />
              <div><span>{module.category} · {module.hours} h</span><h3>{module.title}</h3><p>{module.courseTitle}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="split-section reveal-section">
        <article className="info-panel">
          <span className="eyebrow">{content.home.academy.eyebrow}</span>
          <h3>{content.home.academy.title}</h3>
          <p>{content.home.academy.description}</p>
          <Link to="/courses" className="btn btn-primary">
            {content.common.exploreCourses}
          </Link>
        </article>

        <article className="info-panel info-panel--accent">
          <span className="eyebrow">{content.home.certifications.eyebrow}</span>
          <h3>{content.home.certifications.title}</h3>
          <p>{content.home.certifications.description}</p>
          <Link to="/login" className="btn btn-outline light">
            {content.common.viewAll}
          </Link>
        </article>
      </section>

      <section className="career-section reveal-section">
        <div className="career-copy">
          <span className="eyebrow">{content.home.career.eyebrow}</span>
          <h2>{content.home.career.title}</h2>
          <p>{content.home.career.description}</p>
          <Link to="/courses" className="btn btn-primary">
            {content.home.career.cta}
          </Link>
        </div>

        <div className="career-list">
          <div>
            <strong>+100</strong>
            <span>{content.home.careerList.projects}</span>
          </div>
          <div>
            <strong>1:1</strong>
            <span>{content.home.careerList.guidance}</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>{content.home.careerList.practice}</span>
          </div>
        </div>
      </section>

      <section className="contact-section reveal-section">
        <div className="contact-card">
          <span className="eyebrow">{content.home.contact.eyebrow}</span>
          <h2>{content.home.contact.title}</h2>
          <p>{content.home.contact.description}</p>
          <div className="contact-list">
            <a href="https://wa.me/22392488730" target="_blank" rel="noreferrer" className="contact-item">
              <span>📱</span>
              <span>+223 92 48 87 30</span>
            </a>
            <a href="mailto:kdrissa718@gmail.com" className="contact-item">
              <span>✉️</span>
              <span>kdrissa718@gmail.com</span>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="contact-item">
              <span>📘</span>
              <span>Facebook</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="contact-item">
              <span>🔗</span>
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </section>
          
      <footer className="home-footer">
        <div className="footer-links">
          <div>
            <h4>{content.common.quickLinks}</h4>
            <Link to="/">{content.layout.nav.home}</Link>
            <Link to="/courses">{content.layout.nav.courses}</Link>
            <Link to="/login">{content.layout.nav.register}</Link>
          </div>
          <div>
            <h4>{content.common.contact}</h4>
            <a href="https://wa.me/22392488730" target="_blank" rel="noreferrer">WhatsApp</a>
            <a href="mailto:kdrissa718@gmail.com">Email</a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
          </div>
          <div>
            <h4>SocioLab Mali</h4>
            <p>{content.home.footer.intro}</p>
          </div>
        </div>
        <p>{content.home.footer.description}</p>
      </footer>
                           
      <a
        className="whatsapp-float"
        href="https://wa.me/22392488730"
        target="_blank"
        rel="noreferrer"
        aria-label={content.home.whatsappLabel}
      >
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 3a12.5 12.5 0 0 0-10.7 19L3.8 28.2l6.4-1.7A12.5 12.5 0 1 0 16 3Zm0 22.8c-1.8 0-3.6-.5-5.1-1.5l-.4-.2-3.8 1 1-3.7-.3-.4a9.8 9.8 0 1 1 8.6 4.8Zm5.4-7.4c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-.9 1.2-.3.3-.6.1a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.4.3-.6 0-.2 0-.4-.1-.6l-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.2 1.2-1.2 3s1.2 3.5 1.4 3.8c.2.2 2.4 3.7 5.8 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.8-.7 2.1-1.4s.3-1.3.2-1.4c0-.1-.3-.2-.6-.4Z" />
        </svg>
        <span>WhatsApp</span>
      </a>
    </section>
  );
}

export default Home;
