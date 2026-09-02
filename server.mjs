import { createServer } from "node:http";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config({ path: "./.env" });

const port = Number(process.env.AI_SERVER_PORT || 8787);

console.log(
  "GEMINI_API_KEY :",
  process.env.GEMINI_API_KEY ? "DETECTEE" : "NON DETECTEE"
);

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })
  : null;

const studentInstructions = `
Tu es SocioLab IA, un assistant pédagogique francophone
pour les étudiants en sciences humaines et sociales.

Tu aides les étudiants à :
- comprendre les concepts et théories ;
- comprendre leurs cours ;
- préparer leurs exercices ;
- faire des résumés ;
- préparer leurs travaux universitaires ;
- développer leur réflexion sociologique.

Sois pédagogique, clair, rigoureux et adapté au niveau de l'étudiant.

Ne présente jamais une information incertaine comme une certitude.
Lorsque plusieurs interprétations sont possibles, explique-les.
`;

const fieldResearchInstructions = `
Tu es SocioLab IA, un assistant spécialisé en méthodologie
de recherche et en enquête de terrain dans les sciences humaines
et sociales.

Tu aides les étudiants à :
- formuler une problématique ;
- construire des objectifs de recherche ;
- formuler des hypothèses ;
- construire un questionnaire ;
- préparer un guide d'entretien ;
- définir des variables et indicateurs ;
- réfléchir à l'échantillonnage ;
- analyser des données qualitatives ;
- analyser des données quantitatives ;
- interpréter les résultats ;
- proposer des pistes de codage.

Sois méthodologiquement rigoureux.

Ne fabrique jamais de données.
Ne présente jamais une interprétation comme un résultat certain.
Rappelle, lorsque c'est pertinent, les principes de consentement,
d'anonymisation et de protection des personnes enquêtées.
`;

const send = (response, status, payload) => {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });

  response.end(JSON.stringify(payload));
};

createServer(async (request, response) => {

  // Autoriser les requêtes OPTIONS
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });

    response.end();
    return;
  }

  // Vérification de la route
  if (
    request.method !== "POST" ||
    request.url !== "/api/ai-assistant"
  ) {
    return send(response, 404, {
      error: "Route introuvable.",
    });
  }

  // Vérification de la clé Gemini
  if (!process.env.GEMINI_API_KEY) {
    return send(response, 503, {
      error:
        "L'assistant IA n'est pas configuré. Ajoutez GEMINI_API_KEY dans le fichier .env.",
    });
  }

  let rawBody = "";

  try {

    for await (const chunk of request) {
      rawBody += chunk;

      if (rawBody.length > 100_000) {
        return send(response, 413, {
          error: "Message trop volumineux.",
        });
      }
    }

    const {
      messages,
      context,
      mode = "student",
      language = "fr",
    } = JSON.parse(rawBody);

    if (!Array.isArray(messages) || !messages.length) {
      return send(response, 400, {
        error: "Message manquant.",
      });
    }

    // Garder seulement les 10 derniers messages
    const safeMessages = messages
      .slice(-10)
      .map(({ role, content }) => ({
        role: role === "assistant" ? "assistant" : "user",
        content: String(content).slice(0, 8_000),
      }));

    const systemInstructions =
      mode === "field-research"
        ? fieldResearchInstructions
        : studentInstructions;

    const conversation = safeMessages
      .map((message) => {
        const speaker =
          message.role === "assistant"
            ? "SocioLab IA"
            : "Étudiant";

        return `${speaker} : ${message.content}`;
      })
      .join("\n\n");

    const prompt = `
${systemInstructions}

Langue de réponse :
${language === "fr" ? "Français" : language}

Contexte de la page :
${String(context || "Apprentissage général").slice(0, 2_000)}

Conversation :
${conversation}

Réponds directement à la dernière question de l'étudiant.
`;

    const apiResponse = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const message =
      apiResponse.text ||
      "Je n'ai pas pu produire une réponse.";

    return send(response, 200, {
      message,
    });

  } catch (error) {

    console.error("Erreur Gemini :", error);

    return send(response, 500, {
      error:
        "Une erreur est survenue lors de la communication avec Gemini.",
    });
  }

}).listen(port, () => {
  console.log(
    `🤖 SocioLab IA disponible sur http://localhost:${port}`
  );
});