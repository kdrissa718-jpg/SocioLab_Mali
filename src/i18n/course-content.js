const builtInCourseTranslations = {
  1: {
    title: "Introduction to Sociology",
    description: "Understand social structures, groups and institutions.",
  },
  2: {
    title: "Developmental Psychology",
    description: "Explore the stages of cognitive, emotional and social development.",
  },
  3: {
    title: "Ethics and Political Philosophy",
    description: "Develop critical thinking about justice, rights and power.",
  },
  4: {
    title: "Social Research Methodology",
    description: "Design rigorous research and analyze field data.",
  },
  5: {
    title: "Contemporary History and Collective Memory",
    description: "Explore transformations in the contemporary world and its collective memories.",
  },
  6: {
    title: "Human Geography and Territories",
    description: "Analyze territories, mobility, cities and society-environment relationships.",
  },
  7: {
    title: "Cultural Anthropology",
    description: "Study cultures, practices, beliefs and social relationships.",
  },
  8: {
    title: "Institutions and Political Science",
    description: "Understand power, institutions, public policy and citizenship.",
  },
  9: {
    title: "Social Economy and Development",
    description: "Study economic choices, development and inequality.",
  },
  10: {
    title: "Communication, Media and Society",
    description: "Explore media, public narratives and digital practices.",
  },
  11: {
    title: "Education Sciences",
    description: "Study learning, teaching practices and educational inequality.",
  },
};

const knownEnglishPhrases = new Map([
  ["lecon de test 1", "Test lesson 1"],
  ["faire un test", "Run a test"],
]);

function translateKnownPhrase(value) {
  if (typeof value !== "string") return value;
  return knownEnglishPhrases.get(value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase()) || value;
}

export function getLocalizedCourse(course, language) {
  if (!course || language !== "en") return course;

  const builtInTranslation = builtInCourseTranslations[course.id];
  const translatedModules = course.modules?.map((module) => ({
    ...module,
    title: module.titleEn || module.title,
    lessons: module.lessons.map((lesson, index) => module.lessonsEn?.[index] || lesson),
  }));

  return {
    ...course,
    title: course.titleEn || builtInTranslation?.title || translateKnownPhrase(course.title),
    description: course.descriptionEn || builtInTranslation?.description || translateKnownPhrase(course.description),
    modules: translatedModules || course.modules,
    fieldwork: course.fieldwork ? {
      ...course.fieldwork,
      concept: course.fieldwork.conceptEn || course.fieldwork.concept,
      prompts: course.fieldwork.prompts.map((prompt, index) => course.fieldwork.promptsEn?.[index] || prompt),
    } : course.fieldwork,
  };
}
