import { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import bookImage from "../assets/livreimage.jpg";
import articleImage from "../assets/articleimage.jpg";
import thesisImage from "../assets/theseimage.jpg";
import guideImage from "../assets/guideimage.jpg";
import reportImage from "../assets/rapportimage.jpg";
import memoireImage from "../assets/memoireimage.jpg";
import libraryHeroImage from "../assets/bibliotheque.jpg";
import { getLocalizedResource } from "../i18n/library-content";
import "./library.css";
function Library() {
  const { language, translations, libraryResources } = useAppContext();
  const content = translations[language];
  const categoryLabels = {
    Sociologie: content.library.categories.sociology,
    Psychologie: content.library.categories.psychology,
    Philosophie: content.library.categories.philosophy,
    Méthodologie: content.library.categories.methodology,
    Histoire: content.library.categories.history,
    Géographie: content.library.categories.geography,
    Anthropologie: content.library.categories.anthropology,
    "Sciences politiques": content.library.categories.politicalScience,
    Économie: content.library.categories.economy,
    Communication: content.library.categories.communication,
    Éducation: content.library.categories.education,
  };
  const typeLabels = {
    Livre: content.library.types.book,
    Rapport: content.library.types.report,
    "Article scientifique": content.library.types.article,
    Thèse: content.library.types.thesis,
    Guide: content.library.types.guide,
    Mémoire: content.library.types.dissertation,
  };

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Toutes");
  const [type, setType] = useState("Tous");

  const categories = [
    "Toutes",
    ...new Set(libraryResources.map((resource) => resource.category)),
  ];

  const types = [
    "Tous",
    ...new Set(libraryResources.map((resource) => resource.type)),
  ];

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return libraryResources.filter((resource) => {
      const matchesSearch =
        !query ||
        String(resource.title || "").toLowerCase().includes(query) ||
        String(resource.titleEn || "").toLowerCase().includes(query) ||
        String(resource.author || "").toLowerCase().includes(query) ||
        String(resource.authorEn || "").toLowerCase().includes(query) ||
        String(resource.description || "").toLowerCase().includes(query) ||
        String(resource.descriptionEn || "").toLowerCase().includes(query);

      const matchesCategory =
        category === "Toutes" || resource.category === category;

      const matchesType =
        type === "Tous" || resource.type === type;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [search, category, type, libraryResources]);

  return (
    <section className="page-section reveal-section library-page" style={{ "--library-hero": `url(${libraryHeroImage})` }}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">SocioLab Mali</span>

          <h1>{content.library.title}</h1>
          <p>{content.library.description}</p>
        </div>
      </div>

      <section className="library-toolbar">
        <div className="library-search">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={content.library.search}
          />
        </div>

        <div className="library-filters">
          <label>
            {content.library.discipline}

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "Toutes" ? content.library.allCategories : categoryLabels[item] || item}
                </option>
              ))}
            </select>
          </label>

          <label>
            {content.library.type}

            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              {types.map((item) => (
                <option key={item} value={item}>
                  {item === "Tous" ? content.library.allTypes : typeLabels[item] || item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="library-results-header">
        <div>
          <span className="eyebrow">
            {content.library.resources}
          </span>

          <h2>{filteredResources.length} {content.library.available}</h2>
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <div className="empty-state">
          <h2>{content.library.emptyTitle}</h2>
          <p>{content.library.emptyDescription}</p>
        </div>
      ) : (
        <div className="course-grid library-grid">
          {filteredResources.map((resource) => {
            const localizedResource = getLocalizedResource(resource, language);
            return (
            <article
              key={resource.id}
              className="course-card library-card"
            >
              <div className="course-card-meta">
                <span>{typeLabels[resource.type] || resource.type}</span>
                <strong>{resource.year || "-"}</strong>
              </div>

            
          
                <div className="library-resource-icon">
  {resource.coverUrl ? <img src={resource.coverUrl} alt={`${content.library.cover} ${localizedResource.title}`} /> : resource.type === "Livre" ? <img src={bookImage} alt={typeLabels.Livre} /> : resource.type === "Rapport" ? <img src={reportImage} alt={typeLabels.Rapport} /> : resource.type === "Article scientifique" ? <img src={articleImage} alt={typeLabels["Article scientifique"]} /> : resource.type === "Thèse" ? <img src={thesisImage} alt={typeLabels.Thèse} /> : resource.type === "Guide" ? <img src={guideImage} alt={typeLabels.Guide} /> : <img src={memoireImage} alt={typeLabels.Mémoire} />}
    
      
              </div>

              <span className="library-category">
                {resource.categoryEn || categoryLabels[resource.category] || localizedResource.category}
              </span>

              <h2>{localizedResource.title}</h2>

              <p className="library-author">
                {content.library.author}{" "}
                <strong>{localizedResource.author}</strong>
              </p>

              <p>{localizedResource.description || content.library.defaultDescription}</p>

              <div className="course-card-footer">
                <span className="library-format">
                  {resource.format}
                </span>

                <a
                  href={resource.url}
                  className="btn btn-secondary"
                  target="_blank"
                  rel="noreferrer"
                >
                  {content.library.open}
                </a>
              </div>
            </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Library;
