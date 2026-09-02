import { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import AiAssistant from "../components/ai-assistant";

const stopWords = new Set(["avec", "dans", "pour", "mais", "sont", "plus", "nous", "vous", "elles", "leurs", "cette", "cela", "comme", "aussi", "être", "avoir", "entre", "ainsi", "sur", "une", "des", "les", "que", "qui"]);
const median = (values) => { const sorted = [...values].sort((a, b) => a - b); const middle = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2; };

function Fieldwork() {
  const { courses, language, translations } = useAppContext();
  const content = translations[language];
  const [courseId, setCourseId] = useState(1);
  const [method, setMethod] = useState("qualitative");
  const [data, setData] = useState("");
  const [result, setResult] = useState(null);
  const course = useMemo(() => courses.find((item) => item.id === Number(courseId)) || courses[0], [courses, courseId]);

  const analyze = () => {
    if (!data.trim()) return;
    if (method === "quantitative" || method === "statistique") {
      const values = (data.match(/-?\d+(?:[.,]\d+)?/g) || []).map((value) => Number(value.replace(",", "."))).filter(Number.isFinite);
      if (!values.length) return setResult({ error: language === "fr" ? "Saisissez une série de nombres, par exemple : 12, 15, 18, 20." : "Enter a series of numbers, for example: 12, 15, 18, 20." });
      const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
      const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
      setResult({ type: "numeric", count: values.length, mean, median: median(values), min: Math.min(...values), max: Math.max(...values), stdDev: Math.sqrt(variance), interpretation: language === "fr" ? `La série contient ${values.length} observations. La moyenne est de ${mean.toFixed(2)} et l'étendue va de ${Math.min(...values)} à ${Math.max(...values)}.` : `The series contains ${values.length} observations. The mean is ${mean.toFixed(2)} and the range goes from ${Math.min(...values)} to ${Math.max(...values)}.` });
      return;
    }
    const lines = data.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const words = data.toLowerCase().match(/[\p{L}]{4,}/gu) || [];
    const counts = words.filter((word) => !stopWords.has(word)).reduce((acc, word) => ({ ...acc, [word]: (acc[word] || 0) + 1 }), {});
    const themes = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    setResult({ type: "qualitative", count: lines.length, themes, interpretation: language === "fr" ? `${lines.length} verbatim(s) ou note(s) ont été examinés. Les thèmes les plus fréquents sont des pistes de codage initial, à vérifier dans le contexte des réponses.` : `${lines.length} verbatim(s) or note(s) were examined. The most frequent themes are initial coding leads and should be checked in the context of the responses.` });
  };

  return <section className="page-section reveal-section">
    <div className="page-heading"><div><span className="eyebrow">{content.fieldwork.eyebrow}</span><h1>{content.fieldwork.title}</h1><p>{content.fieldwork.description}</p></div></div>
    <div className="fieldwork-layout">
      <form className="fieldwork-form" onSubmit={(event) => { event.preventDefault(); analyze(); }}>
        <label>{content.fieldwork.discipline}<select value={courseId} onChange={(event) => { setCourseId(event.target.value); setResult(null); }}>{courses.map((item) => <option key={item.id} value={item.id}>{item.category} — {item.title}</option>)}</select></label>
        <article className="concept-card"><img src={course.imageUrl} alt="Illustration du concept" /><div><span>{content.fieldwork.conceptTitle}</span><h2>{course.fieldwork?.concept || content.fieldwork.conceptDefault}</h2>{course.fieldwork?.prompts.map((prompt) => <p key={prompt}>• {prompt}</p>)}</div></article>
        <label>{content.fieldwork.methodLabel}<select value={method} onChange={(event) => setMethod(event.target.value)}><option value="qualitative">{content.fieldwork.qualitativeOption}</option><option value="quantitative">{content.fieldwork.quantitativeOption}</option><option value="statistique">{content.fieldwork.descriptiveOption}</option></select></label>
        <label>{method === "qualitative" ? content.fieldwork.qualitativePlaceholder : content.fieldwork.quantitativePlaceholder}<textarea value={data} onChange={(event) => setData(event.target.value)} placeholder={method === "qualitative" ? content.fieldwork.qualitativeHint : content.fieldwork.quantitativeHint} required /></label>
        <button className="btn btn-primary" type="submit">{content.fieldwork.analyze}</button>
      </form>
      <aside className="analysis-panel"><span className="eyebrow">{content.fieldwork.analysisPanel.eyebrow}</span><h2>{content.fieldwork.analysisPanel.title}</h2>{!result && <p>{content.fieldwork.analysisPanel.empty}</p>}{result?.error && <p className="analysis-error">{result.error}</p>}{result?.type === "qualitative" && <><p>{result.interpretation}</p><div className="theme-list">{result.themes.map(([theme, count]) => <div key={theme}><span>{theme}</span><strong>{count}</strong></div>)}</div><p className="analysis-note">{content.fieldwork.analysisPanel.note}</p></>}{result?.type === "numeric" && <><p>{result.interpretation}</p><div className="stat-grid"><div><span>{language === "fr" ? "Observations" : "Observations"}</span><strong>{result.count}</strong></div><div><span>{language === "fr" ? "Moyenne" : "Mean"}</span><strong>{result.mean.toFixed(2)}</strong></div><div><span>{language === "fr" ? "Médiane" : "Median"}</span><strong>{result.median.toFixed(2)}</strong></div><div><span>{language === "fr" ? "Écart-type" : "Standard deviation"}</span><strong>{result.stdDev.toFixed(2)}</strong></div></div><p className="analysis-note">{content.fieldwork.analysisPanel.numericNote}</p></>}</aside>
    </div>

    
  <AiAssistant
  mode="field-research"
  context={content.fieldwork.aiContext
    .replace("{course}", course.title)
    .replace(
      "{concept}",
      course.fieldwork?.concept || "à définir"
    )
    .replace("{method}", method)}
  title={content.fieldwork.aiTitle}
/>

  </section>;
}

export default Fieldwork;
