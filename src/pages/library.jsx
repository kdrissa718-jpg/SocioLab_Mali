import { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import bookImage from "../assets/livreimage.jpg";
import articleImage from "../assets/articleimage.jpg";
import thesisImage from "../assets/theseimage.jpg";
import guideImage from "../assets/guideimage.jpg";
import reportImage from "../assets/rapportimage.jpg";
import memoireImage from "../assets/memoireimage.jpg";
import libraryResources from "./library.js";
import "./library.css";
function Library() {
  const { language } = useAppContext();

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
        resource.title.toLowerCase().includes(query) ||
        resource.author.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query);

      const matchesCategory =
        category === "Toutes" || resource.category === category;

      const matchesType =
        type === "Tous" || resource.type === type;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [search, category, type]);

  return (
    <section className="page-section reveal-section library-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">SocioLab Mali</span>

          <h1>
            {language === "fr"
              ? "Bibliothèque"
              : "Library"}
          </h1>

          <p>
            {language === "fr"
              ? "Découvrez des livres, articles, mémoires, guides et ressources pour approfondir vos connaissances en sciences humaines et sociales."
              : "Discover books, articles, theses, guides and resources to deepen your knowledge of humanities and social sciences."}
          </p>
        </div>
      </div>

      <section className="library-toolbar">
        <div className="library-search">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              language === "fr"
                ? "Rechercher une ressource..."
                : "Search for a resource..."
            }
          />
        </div>

        <div className="library-filters">
          <label>
            {language === "fr" ? "Discipline" : "Discipline"}

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            {language === "fr" ? "Type" : "Type"}

            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              {types.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="library-results-header">
        <div>
          <span className="eyebrow">
            {language === "fr" ? "Ressources" : "Resources"}
          </span>

          <h2>
            {filteredResources.length}{" "}
            {language === "fr"
              ? "ressource(s) disponible(s)"
              : "resource(s) available"}
          </h2>
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <div className="empty-state">
          <h2>
            {language === "fr"
              ? "Aucune ressource trouvée"
              : "No resource found"}
          </h2>

          <p>
            {language === "fr"
              ? "Essayez une autre recherche ou modifiez les filtres."
              : "Try another search or change the filters."}
          </p>
        </div>
      ) : (
        <div className="course-grid library-grid">
          {filteredResources.map((resource) => (
            <article
              key={resource.id}
              className="course-card library-card"
            >
              <div className="course-card-meta">
                <span>{resource.type}</span>
                <strong>{resource.year}</strong>
              </div>

            
          
                <div className="library-resource-icon">
  {resource.type === "Livre" && (
    <img src={bookImage} alt="Livre" />
  )}
  {resource.type === "Rapport" && (
    <img src={reportImage} alt="Rapport" />
  )}
  {resource.type === "Article scientifique" && (
    <img src={articleImage} alt="Article scientifique" />
  )}
   {resource.type === "Thèse" && (
    <img src={thesisImage} alt="Thèse" />
  )}
    {resource.type === "Guide" && (
    <img src={guideImage} alt="Guide" />
  )}
   {resource.type === "Mémoire" && (
    <img src={memoireImage} alt="Mémoire" />
  )}
    
      
              </div>

              <span className="library-category">
                {resource.category}
              </span>

              <h2>{resource.title}</h2>

              <p className="library-author">
                {language === "fr" ? "Auteur :" : "Author :"}{" "}
                <strong>{resource.author}</strong>
              </p>

              <p>{resource.description}</p>

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
                  {language === "fr" ? "Consulter" : "Open"}
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Library;
