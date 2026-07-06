"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";

type SpeechRecognitionAlternative = { transcript: string };
type SpeechRecognitionResult = { isFinal: boolean; 0: SpeechRecognitionAlternative };
type SpeechRecognitionResultList = { length: number; [index: number]: SpeechRecognitionResult };
type SpeechRecognitionEvent = Event & { resultIndex: number; results: SpeechRecognitionResultList };
type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type Answer = { id: string; label: string; prompt: string; sample: string; value: string };

const QUESTIONS: Omit<Answer, "value">[] = [
  {
    id: "need",
    label: "What are you looking for?",
    prompt: "Describe what you need connected — a new site, a funded project, a service problem.",
    sample: "“We need gigabit fiber for a new tribal health clinic in rural Montana.”",
  },
  {
    id: "area",
    label: "What general area are you in?",
    prompt: "City, county, reservation, or region is enough to start.",
    sample: "“Just outside Missoula, on tribal trust land.”",
  },
  {
    id: "speeds",
    label: "What speeds are you hoping to get?",
    prompt: "A rough number is fine — we'll confirm what's actually available.",
    sample: "“Somewhere around 500 megabits, symmetrical if possible.”",
  },
  {
    id: "industry",
    label: "What industry are you in?",
    prompt: "Healthcare, gaming, education, data centers — whatever fits.",
    sample: "“We run a tribal health clinic and a small administrative office.”",
  },
];

function initialAnswers(): Answer[] {
  return QUESTIONS.map(q => ({ ...q, value: "" }));
}

export function VoiceIntakeWidget() {
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);
  const [activeIndex, setActiveIndex] = useState(0);
  const [interim, setInterim] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState<boolean | null>(null);
  const [contact, setContact] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const active = answers[activeIndex];
  const answeredCount = answers.filter(a => a.value.trim()).length;
  const markdownPreview = useMemo(
    () => answers.filter(a => a.value.trim()).map(a => `**${a.label}**\n${a.value.trim()}`).join("\n\n"),
    [answers],
  );

  function updateAnswer(value: string) {
    setAnswers(current => current.map((a, i) => (i === activeIndex ? { ...a, value } : a)));
  }

  function appendTranscript(text: string) {
    const cleaned = text.trim();
    if (!cleaned) return;
    setAnswers(current =>
      current.map((a, i) => {
        if (i !== activeIndex) return a;
        const sep = a.value.trim() ? " " : "";
        return { ...a, value: `${a.value}${sep}${cleaned}` };
      }),
    );
  }

  function stopListening() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setInterim("");
  }

  function startListening() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setSpeechSupported(false);
      return;
    }
    stopListening();
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = event => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) finalText += transcript;
        else interimText += transcript;
      }
      if (finalText) appendTranscript(finalText);
      setInterim(interimText);
    };
    recognition.onerror = () => {
      setIsListening(false);
      setInterim("");
    };
    recognition.onend = () => {
      setIsListening(false);
      setInterim("");
    };
    recognitionRef.current = recognition;
    setSpeechSupported(true);
    setIsListening(true);
    recognition.start();
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/voice-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contact.name,
          email: contact.email,
          answers: answers.map(({ id, label, value }) => ({ id, label, value })),
        }),
      });
      if (!res.ok) throw new Error("send failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. You can also reach us directly at hello@konative.com.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ border: "1px solid #E5E7EB", padding: "48px 40px", textAlign: "center", background: "#fff" }}>
        <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, textTransform: "uppercase", margin: "0 0 12px" }}>
          Got it — we&apos;re on it.
        </h3>
        <p style={{ color: "#667085", lineHeight: 1.6, maxWidth: 480, margin: "0 auto 24px" }}>
          We sent a copy of what you described to your inbox, and a Konative advisor will follow up shortly.
          Prefer to just pick a time now?
        </p>
        <Link href="/call" style={{ display: "inline-block", padding: "14px 28px", background: "#C8001F", color: "#fff", textDecoration: "none", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", fontSize: 12 }}>
          Book a call →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 1, background: "#E5E7EB", border: "1px solid #E5E7EB" }} className="voice-intake-grid">
      <aside style={{ background: "#fff", padding: 28 }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C8001F", marginBottom: 20 }}>
          Just talk — we&apos;ll organize it
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {answers.map((a, i) => (
            <button
              key={a.id}
              type="button"
              onClick={() => { stopListening(); setActiveIndex(i); }}
              style={{
                textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", border: "none", cursor: "pointer",
                background: i === activeIndex ? "#FFF0F2" : "transparent",
                color: i === activeIndex ? "#C8001F" : "#111827",
                fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600,
              }}
            >
              <span style={{ fontSize: 11, opacity: 0.5 }}>{String(i + 1).padStart(2, "0")}</span>
              {a.label}
              {a.value.trim() && <span style={{ marginLeft: "auto", fontSize: 10, color: "#16a34a" }}>✓</span>}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #E5E7EB" }}>
          <div style={{ height: 6, background: "#F3F4F6" }}>
            <div style={{ height: "100%", width: `${(answeredCount / answers.length) * 100}%`, background: "#C8001F", transition: "width 0.2s" }} />
          </div>
          <p style={{ fontSize: 12, color: "#667085", marginTop: 10 }}>{answeredCount} of {answers.length} answered</p>
        </div>
      </aside>

      <section style={{ background: "#fff", padding: "28px 32px" }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C8001F", marginBottom: 10 }}>
          Question {activeIndex + 1} of {answers.length}
        </p>
        <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 30, textTransform: "uppercase", margin: "0 0 8px", lineHeight: 1.05 }}>
          {active.label}
        </h3>
        <p style={{ color: "#667085", fontSize: 14, lineHeight: 1.5, marginBottom: 6 }}>{active.prompt}</p>
        <p style={{ color: "#9CA3AF", fontSize: 13, fontStyle: "italic", marginBottom: 16 }}>Try: {active.sample}</p>

        <textarea
          value={active.value}
          onChange={e => updateAnswer(e.target.value)}
          rows={5}
          placeholder="Click the mic and talk, or just type here."
          style={{ width: "100%", fontFamily: "Inter, sans-serif", fontSize: 15, color: "#111827", border: "1px solid #E5E7EB", padding: "12px 14px", resize: "none" }}
        />

        {interim && <p style={{ fontSize: 13, color: "#0284c7", marginTop: 8 }}>Listening: {interim}</p>}
        {speechSupported === false && (
          <p style={{ fontSize: 12, color: "#667085", marginTop: 8 }}>
            Your browser doesn&apos;t support voice dictation here — typing works just as well.
          </p>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            style={{
              padding: "10px 18px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
              cursor: "pointer", border: "none", color: "#fff",
              background: isListening ? "#0284c7" : "#C8001F",
            }}
          >
            {isListening ? "● Listening — tap to stop" : "🎙 Use microphone"}
          </button>
          <button type="button" onClick={() => setActiveIndex(i => Math.max(0, i - 1))} disabled={activeIndex === 0}
            style={{ padding: "10px 18px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", cursor: "pointer", background: "#fff", border: "1px solid #E5E7EB", opacity: activeIndex === 0 ? 0.4 : 1 }}>
            Back
          </button>
          <button type="button" onClick={() => setActiveIndex(i => Math.min(answers.length - 1, i + 1))} disabled={activeIndex === answers.length - 1}
            style={{ padding: "10px 18px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", cursor: "pointer", background: "#fff", border: "1px solid #E5E7EB", opacity: activeIndex === answers.length - 1 ? 0.4 : 1 }}>
            Next
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 24, paddingTop: 20, borderTop: "1px solid #E5E7EB" }}>
          <input value={contact.name} onChange={e => setContact(c => ({ ...c, name: e.target.value }))} placeholder="Name"
            style={{ padding: "10px 12px", border: "1px solid #E5E7EB", fontFamily: "Inter, sans-serif", fontSize: 14 }} />
          <input value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} type="email" placeholder="Email"
            style={{ padding: "10px 12px", border: "1px solid #E5E7EB", fontFamily: "Inter, sans-serif", fontSize: 14 }} />
        </div>

        {markdownPreview && (
          <details style={{ marginTop: 16 }}>
            <summary style={{ fontSize: 12, color: "#667085", cursor: "pointer" }}>Preview what we&apos;ll send</summary>
            <pre style={{ fontSize: 12, color: "#374151", background: "#F9FAFB", padding: 12, marginTop: 8, whiteSpace: "pre-wrap" }}>{markdownPreview}</pre>
          </details>
        )}

        {error && <p style={{ color: "#C8001F", fontSize: 13, marginTop: 12 }}>{error}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={loading || !contact.name.trim() || !contact.email.trim() || answeredCount === 0}
          style={{
            width: "100%", marginTop: 16, padding: "16px", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
            cursor: "pointer", border: "none", color: "#fff", background: "#C8001F",
            opacity: loading || !contact.name.trim() || !contact.email.trim() || answeredCount === 0 ? 0.45 : 1,
          }}
        >
          {loading ? "Sending…" : "Send my request"}
        </button>
      </section>
    </div>
  );
}
