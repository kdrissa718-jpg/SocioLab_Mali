import { useState } from "react";
import { useAppContext } from "../context/AppContext";

function AiAssistant({
  context,
  title = "SocioLab IA",
  mode = "student",
}) {
  const { language, translations } = useAppContext();
  const content = translations[language];

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: content.aiAssistant.initialMessage,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async (event) => {
    event.preventDefault();

    const userMessage = input.trim();

    if (!userMessage || loading) return;

    const nextMessages = [
      ...messages,
      {
        role: "user",
        content: userMessage,
      },
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages,
          context,
          mode,
          language,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload.error || content.aiAssistant.unavailable
        );
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: payload.message,
        },
      ]);
    } catch (requestError) {
      setError(
        requestError.message || content.aiAssistant.unavailable
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="ai-assistant"
      aria-label="Assistant IA SocioLab"
    >
      <div className="ai-assistant-header">
        <div>
          <span>{content.aiAssistant.assistantLabel}</span>
          <h2>{title}</h2>
        </div>

        <i>{content.aiAssistant.online}</i>
      </div>

      <div className="ai-messages">
        {messages.map((message, index) => (
          <p
            className={`ai-message ${message.role}`}
            key={`${message.role}-${index}`}
          >
            {message.content}
          </p>
        ))}

        {loading && (
          <p className="ai-message assistant">
            {content.aiAssistant.thinking}
          </p>
        )}
      </div>

      {error && (
        <p className="ai-error">
          {error}
        </p>
      )}

      <form className="ai-form" onSubmit={sendMessage}>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={content.aiAssistant.placeholder}
          aria-label="Your question"
          disabled={loading}
        />

        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading || !input.trim()}
        >
          {loading
            ? content.aiAssistant.thinking
            : content.aiAssistant.send}
        </button>
      </form>
    </section>
  );
}

export default AiAssistant;