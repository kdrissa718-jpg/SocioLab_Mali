import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

function LegalDocumentPage({ kind }) {
  const { language } = useAppContext();

  const isFrench = language === "fr";

  const content =
    kind === "terms"
      ? {
          title: isFrench ? "Conditions d'utilisation" : "Terms of use",
          lastUpdated: isFrench ? "Dernière mise à jour : 07 octobre 2026" : "Last updated: October 7, 2026",
          intro: isFrench
            ? "En utilisant SocioLab Mali, vous acceptez les présentes conditions générales. Ces règles encadrent l'accès aux cours, la bibliothèque, les espaces de travail et les services de certification."
            : "By using SocioLab Mali, you agree to these general conditions. These rules govern access to courses, the library, workspaces and certification services.",
          sections: [
            {
              heading: isFrench ? "1. Objet" : "1. Purpose",
              body: isFrench
                ? "SocioLab Mali propose une plateforme de formation en sciences humaines et sociales, avec des contenus pédagogiques, des parcours, des ressources documentaires et des outils d'accompagnement."
                : "SocioLab Mali provides a learning platform for the humanities and social sciences, with educational content, pathways, documentary resources and support tools.",
            },
            {
              heading: isFrench ? "2. Création et utilisation du compte" : "2. Account creation and use",
              body: isFrench
                ? "Les utilisateurs doivent fournir des informations exactes, utiliser la plateforme conformément à leur profil et ne pas partager leurs identifiants. Toute activité frauduleuse ou abusive est susceptible d'entraîner la suspension du compte."
                : "Users must provide accurate information, use the platform in accordance with their profile and not share their login credentials. Any fraudulent or abusive activity may lead to account suspension.",
            },
            {
              heading: isFrench ? "3. Contenus et propriété intellectuelle" : "3. Content and intellectual property",
              body: isFrench
                ? "Les contenus présentés sur la plateforme sont protégés par des droits d'auteur et sont mis à disposition à des fins pédagogiques. Toute reproduction ou diffusion non autorisée est interdite sans accord préalable."
                : "The content displayed on the platform is protected by copyright and is made available for educational purposes. Any unauthorized reproduction or distribution is prohibited without prior agreement.",
            },
            {
              heading: isFrench ? "4. Responsabilités" : "4. Responsibilities",
              body: isFrench
                ? "SocioLab Mali s'efforce d'assurer la disponibilité et la qualité des services, mais ne garantit pas l'absence totale d'erreurs techniques ni l'accès permanent dans des conditions externes de réseau ou de maintenance."
                : "SocioLab Mali strives to ensure service availability and quality, but does not guarantee the total absence of technical errors or permanent access under external network or maintenance conditions.",
            },
            {
              heading: isFrench ? "5. Modifications" : "5. Changes",
              body: isFrench
                ? "Nous pouvons modifier les présentes conditions pour tenir compte de l'évolution de la plateforme, des services ou des obligations légales. Les modifications entrent en vigueur dès leur publication sur la plateforme."
                : "We may amend these conditions to reflect the evolution of the platform, the services or legal obligations. Changes take effect as soon as they are published on the platform.",
            },
          ],
        }
      : {
          title: isFrench ? "Politique de confidentialité" : "Privacy policy",
          lastUpdated: isFrench ? "Dernière mise à jour : 07 octobre 2026" : "Last updated: October 7, 2026",
          intro: isFrench
            ? "La protection de vos données personnelles est une priorité pour SocioLab Mali. Cette politique décrit les informations collectées, leur usage, ainsi que vos droits sur celles-ci."
            : "The protection of your personal data is a priority for SocioLab Mali. This policy describes the information collected, how it is used, and your rights regarding it.",
          sections: [
            {
              heading: isFrench ? "1. Données collectées" : "1. Data collected",
              body: isFrench
                ? "Nous pouvons collecter des informations telles que votre nom, votre adresse e-mail, votre profil d'utilisateur, les cours suivis, les activités effectuées et les données de navigation nécessaires au bon fonctionnement de la plateforme."
                : "We may collect information such as your name, email address, user profile, courses followed, activities performed and navigation data necessary for the proper functioning of the platform.",
            },
            {
              heading: isFrench ? "2. Utilisation des données" : "2. Use of the data",
              body: isFrench
                ? "Les données sont utilisées pour personnaliser l'expérience, gérer les comptes, suivre la progression pédagogique, sécuriser l'accès et améliorer les services."
                : "Data is used to personalize the experience, manage accounts, track educational progress, secure access and improve services.",
            },
            {
              heading: isFrench ? "3. Partage et conservation" : "3. Sharing and retention",
              body: isFrench
                ? "Nous ne vendons pas vos données à des tiers. Les informations peuvent être partagées uniquement dans le cadre de l'administration de la plateforme, du support technique ou de la conformité légale."
                : "We do not sell your data to third parties. Information may only be shared within the framework of platform administration, technical support or legal compliance.",
            },
            {
              heading: isFrench ? "4. Sécurité" : "4. Security",
              body: isFrench
                ? "Des mesures techniques et organisationnelles sont mises en place pour protéger les données contre tout accès non autorisé, perte ou usage abusif."
                : "Technical and organizational measures are in place to protect data against unauthorized access, loss or misuse.",
            },
            {
              heading: isFrench ? "5. Droits des utilisateurs" : "5. User rights",
              body: isFrench
                ? "Vous pouvez demander la consultation, la mise à jour ou la suppression de vos données, ainsi que vous opposer à certains traitements, en nous contactant via les coordonnées disponibles sur la plateforme."
                : "You may request access to, updating or deletion of your data, as well as object to certain processing, by contacting us using the details available on the platform.",
            },
          ],
        };

  return (
    <section className="page-section reveal-section legal-page">
      <div className="legal-page-header">
        <span className="eyebrow">SocioLab Mali</span>
        <h1>{content.title}</h1>
        <p>{content.lastUpdated}</p>
      </div>

      <div className="legal-page-content">
        <div className="legal-card">
          <p>{content.intro}</p>
        </div>

        {content.sections.map((section) => (
          <article key={section.heading} className="legal-card">
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </article>
        ))}

        <div className="legal-card legal-card-actions">
          <Link to="/" className="btn btn-secondary">
            {isFrench ? "Retour à l'accueil" : "Back to home"}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LegalDocumentPage;
