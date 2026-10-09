const builtInResourceTranslations = {
  1: {
    title: "Introduction to Sociology",
    description: "A learning resource introducing the key concepts and ideas of sociology.",
  },
  2: {
    title: "Research Methods in the Social Sciences",
    description: "An overview of the main qualitative and quantitative methods used in social science research.",
  },
  3: {
    title: "Practical Guide to Fieldwork",
    category: "Fieldwork",
    description: "A guide to planning research, designing a questionnaire, conducting interviews and organizing data.",
  },
  4: {
    title: "Sample Sociology Dissertation",
    description: "An educational example to help students understand the structure and organization of a dissertation.",
  },
  5: {
    title: "Youth and Socio-professional Integration",
    category: "Social sciences",
    description: "A learning resource about issues related to employment and youth integration.",
  },
  6: {
    title: "Introduction to Anthropology",
    description: "An introduction to the fundamental concepts of anthropology and the study of human societies.",
  },
};

export function getLocalizedResource(resource, language) {
  if (language !== "en") return resource;
  const builtInTranslation = builtInResourceTranslations[resource.id];

  return {
    ...resource,
    title: resource.titleEn || builtInTranslation?.title || resource.title,
    description: resource.descriptionEn || builtInTranslation?.description || resource.description,
    author: resource.authorEn || resource.author,
    category: resource.categoryEn || builtInTranslation?.category || resource.category,
  };
}
