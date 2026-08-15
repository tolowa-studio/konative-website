"use client";

import type { CSSProperties } from "react";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";

type SpeechRecognitionAlternative = {
  transcript: string;
};

type SpeechRecognitionResult = {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
};

type SpeechRecognitionResultList = {
  length: number;
  [index: number]: SpeechRecognitionResult;
};

type SpeechRecognitionEvent = Event & {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

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

type ScopeAnswer = {
  id: string;
  label: string;
  prompt: string;
  value: string;
};

const QUESTIONS: Omit<ScopeAnswer, "value">[] = [
  {
    id: "organizationContext",
    label: "Organization Context",
    prompt:
      "Which Tribal nation, Native entity, enterprise, authority, or partner is this for, and who needs to be involved?",
  },
  {
    id: "fundingContext",
    label: "Funding Context",
    prompt:
      "What funding lane, award, deadline, application, procurement, or compliance context should shape the connectivity request?",
  },
  {
    id: "locations",
    label: "Locations",
    prompt:
      "Which communities, anchor institutions, facilities, addresses, coordinates, routes, or service areas need connectivity?",
  },
  {
    id: "services",
    label: "Network Services",
    prompt:
      "What do you need sourced: DIA, fiber, transport, dark fiber, fixed wireless, SD-WAN, voice, cloud connectivity, security, or something else?",
  },
  {
    id: "currentState",
    label: "Current State",
    prompt:
      "What suppliers, circuits, contracts, speeds, outages, coverage gaps, or renewals already exist?",
  },
  {
    id: "resilience",
    label: "Resilience And Security",
    prompt:
      "What uptime, diverse path, backup, public safety, clinic, gaming, school, security, or data protection requirements matter?",
  },
  {
    id: "procurement",
    label: "Procurement Path",
    prompt:
      "What approvals, RFP needs, target service dates, budget boundaries, procurement rules, or decision milestones should we plan around?",
  },
];

type Contact = {
  name: string;
  organization: string;
  email: string;
  phone: string;
  role: string;
};

const RED = "#C8001F";
const RED_DARK = "#A8001A";
const TEXT = "#111111";
const STEEL = "#374151";
const MUTED = "#6B7280";
const DIVIDER = "#E5E7EB";
const SURFACE = "#F9FAFB";
const DARK = "#0A0F1E";
const DISPLAY = '"Barlow Condensed", sans-serif';
const BODY = "Inter, sans-serif";

function initialAnswers(): ScopeAnswer[] {
  return QUESTIONS.map((question) => ({ ...question, value: "" }));
}

function cleanMultiline(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function bulletsFrom(text: string, fallback: string) {
  const cleaned = cleanMultiline(text);
  if (!cleaned) return `- ${fallback}`;

  return cleaned
    .split(/\n+|(?<=\.)\s+(?=[A-Z0-9])/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 10)
    .map((item) => `- ${item}`)
    .join("\n");
}

function sectionValue(answers: ScopeAnswer[], id: string) {
  return answers.find((answer) => answer.id === id)?.value.trim() || "";
}

function buildMarkdown(answers: ScopeAnswer[], contact: Contact) {
  const organization = contact.organization.trim() || "Organization to be confirmed";

  return `# Grant-to-Network Scope: ${organization}

## Submitted By
- Name: ${contact.name.trim() || "To be confirmed"}
- Organization: ${organization}
- Email: ${contact.email.trim() || "To be confirmed"}
- Phone: ${contact.phone.trim() || "To be confirmed"}
- Role: ${contact.role.trim() || "To be confirmed"}

## Organization Context
${sectionValue(answers, "organizationContext") || "To be clarified with the Konative team."}

## Funding Context
${bulletsFrom(sectionValue(answers, "fundingContext"), "Funding program, award, deadline, or procurement context to be confirmed.")}

## Locations And Service Areas
${bulletsFrom(sectionValue(answers, "locations"), "Target facilities, anchors, addresses, routes, or communities to be confirmed.")}

## Network Services To Source
${bulletsFrom(sectionValue(answers, "services"), "Connectivity stack to be confirmed.")}

## Current Network State
${bulletsFrom(sectionValue(answers, "currentState"), "Current suppliers, circuits, speeds, contracts, and gaps to be confirmed.")}

## Resilience And Security Requirements
${bulletsFrom(sectionValue(answers, "resilience"), "Diversity, backup, uptime, public safety, clinic, gaming, school, and security requirements to be confirmed.")}

## Procurement Path
${bulletsFrom(sectionValue(answers, "procurement"), "Approvals, RFP path, target service date, budget, and decision milestones to be confirmed.")}

## Konative Next Step
- Review this working scope with the Tribal team or partner.
- Convert the scope into a supplier-ready market request.
- Compare carrier options, install timing, resilience tradeoffs, and commercial terms.
- Coordinate quote-to-install next steps when there is a fit.
`;
}

export default function ScopeBuilder() {
  const [answers, setAnswers] = useState<ScopeAnswer[]>(initialAnswers);
  const [activeIndex, setActiveIndex] = useState(0);
  const [interim, setInterim] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState<boolean | null>(null);
  const [contact, setContact] = useState<Contact>({
    name: "",
    organization: "",
    email: "",
    phone: "",
    role: "",
  });
  const [projectStage, setProjectStage] = useState("exploring");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const active = answers[activeIndex];
  const markdown = useMemo(() => buildMarkdown(answers, contact), [answers, contact]);
  const answeredCount = answers.filter((answer) => answer.value.trim()).length;
  const progress = Math.round((answeredCount / answers.length) * 100);

  function updateAnswer(value: string) {
    setAnswers((current) =>
      current.map((answer, index) => (index === activeIndex ? { ...answer, value } : answer)),
    );
  }

  function appendTranscript(text: string) {
    const cleaned = text.trim();
    if (!cleaned) return;
    setAnswers((current) =>
      current.map((answer, index) => {
        if (index !== activeIndex) return answer;
        const separator = answer.value.trim() ? " " : "";
        return { ...answer, value: `${answer.value}${separator}${cleaned}` };
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
    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript ?? "";
        if (event.results[index].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
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

  function setQuestion(index: number) {
    stopListening();
    setActiveIndex(index);
  }

  function nextQuestion() {
    setQuestion(Math.min(activeIndex + 1, answers.length - 1));
  }

  function previousQuestion() {
    setQuestion(Math.max(activeIndex - 1, 0));
  }

  async function submitScope() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contact.name,
          organization: contact.organization,
          email: contact.email,
          phone: contact.phone,
          role: contact.role,
          audience: "tribes",
          projectType: "tribal_funded",
          projectStage,
          fundingProgram: sectionValue(answers, "fundingContext"),
          serviceAddresses: sectionValue(answers, "locations"),
          bandwidth: sectionValue(answers, "services"),
          message: markdown,
          referralSource: "/tribal/scope",
          context: "tbcp3-negp-scope-builder",
          scopeTool: "tribal-voice-to-scope",
          scopeMarkdown: markdown,
          scopeAnswers: answers,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Submission failed.");
      }

      stopListening();
      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again or email deals@konative.com.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <section style={{ background: "#fff", padding: "90px 48px 120px" }}>
        <div style={successWrapStyle}>
          <p style={eyebrowStyle}>Scope received</p>
          <h2 style={successTitleStyle}>WE HAVE THE FIRST DRAFT.</h2>
          <p style={successBodyStyle}>
            Konative received the working scope. We will review the funding context,
            locations, services, and procurement path before recommending the next step.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/call" style={primaryLinkStyle}>
              Book review call
            </Link>
            <Link href="/tribal/grants" style={outlineLinkStyle}>
              Back to funding guide
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ background: "#fff", padding: "90px 0 120px", borderTop: `1px solid ${DIVIDER}` }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 48px" }}>
        <div style={builderShellStyle}>
          <aside style={railStyle}>
            <p style={eyebrowStyle}>Guided capture</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {answers.map((answer, index) => (
                <button
                  key={answer.id}
                  type="button"
                  onClick={() => setQuestion(index)}
                  style={questionTabStyle(index === activeIndex, Boolean(answer.value.trim()))}
                >
                  <span style={questionNumberStyle}>{String(index + 1).padStart(2, "0")}</span>
                  <span style={{ minWidth: 0 }}>{answer.label}</span>
                  {answer.value.trim() ? <span style={capturedStyle}>Captured</span> : null}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${DIVIDER}` }}>
              <div style={progressTrackStyle}>
                <div style={{ ...progressFillStyle, width: `${progress}%` }} />
              </div>
              <p style={railNoteStyle}>
                {answeredCount} of {answers.length} sections have enough signal for a first review.
              </p>
            </div>
          </aside>

          <section style={questionPanelStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "start" }}>
              <div>
                <p style={eyebrowStyle}>Question {activeIndex + 1} / {answers.length}</p>
                <h2 style={questionTitleStyle}>{active.label}</h2>
                <p style={questionPromptStyle}>{active.prompt}</p>
              </div>
              <div style={liveDotStyle(isListening)} aria-hidden="true" />
            </div>

            <textarea
              value={active.value}
              onChange={(event) => updateAnswer(event.target.value)}
              rows={10}
              placeholder="Talk or type here. Rough notes are useful."
              style={textareaStyle}
            />

            {interim ? <p style={listeningStyle}>Listening: {interim}</p> : null}
            {speechSupported === false ? (
              <p style={helpStyle}>
                This browser does not expose microphone dictation here. You can still type or use device dictation.
              </p>
            ) : null}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                style={isListening ? liveButtonStyle : primaryButtonStyle}
              >
                {isListening ? "Stop listening" : "Use microphone"}
              </button>
              <button type="button" onClick={previousQuestion} disabled={activeIndex === 0} style={secondaryButtonStyle(activeIndex === 0)}>
                Previous
              </button>
              <button type="button" onClick={nextQuestion} disabled={activeIndex === answers.length - 1} style={secondaryButtonStyle(activeIndex === answers.length - 1)}>
                Next
              </button>
            </div>

            <div style={contactGridStyle}>
              <input
                value={contact.name}
                onChange={(event) => setContact((current) => ({ ...current, name: event.target.value }))}
                placeholder="Name"
                style={inputStyle}
              />
              <input
                value={contact.organization}
                onChange={(event) => setContact((current) => ({ ...current, organization: event.target.value }))}
                placeholder="Organization"
                style={inputStyle}
              />
              <input
                value={contact.email}
                onChange={(event) => setContact((current) => ({ ...current, email: event.target.value }))}
                type="email"
                placeholder="Email"
                style={inputStyle}
              />
              <input
                value={contact.phone}
                onChange={(event) => setContact((current) => ({ ...current, phone: event.target.value }))}
                type="tel"
                placeholder="Phone"
                style={inputStyle}
              />
              <input
                value={contact.role}
                onChange={(event) => setContact((current) => ({ ...current, role: event.target.value }))}
                placeholder="Role"
                style={inputStyle}
              />
              <select value={projectStage} onChange={(event) => setProjectStage(event.target.value)} style={inputStyle}>
                <option value="exploring">Exploring</option>
                <option value="applying">Applying for funding</option>
                <option value="awarded">Awarded or recommended</option>
                <option value="procurement">Preparing procurement</option>
                <option value="urgent">Urgent project</option>
              </select>
            </div>
          </section>

          <aside style={previewStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <p style={{ ...eyebrowStyle, marginBottom: 0 }}>Live scope</p>
              <span style={previewBadgeStyle}>Markdown</span>
            </div>
            <pre style={markdownStyle}>{markdown}</pre>
            {error ? <p style={errorStyle}>{error}</p> : null}
            <button
              type="button"
              onClick={submitScope}
              disabled={loading || !contact.name.trim() || !contact.organization.trim() || !contact.email.trim()}
              style={submitButtonStyle(loading || !contact.name.trim() || !contact.organization.trim() || !contact.email.trim())}
            >
              {loading ? "Sending scope..." : "Send scope to Konative"}
            </button>
            <p style={privacyStyle}>
              This is not a grant application submission. It gives Konative enough detail to shape a connectivity review.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

const eyebrowStyle: CSSProperties = {
  fontFamily: BODY,
  fontWeight: 800,
  fontSize: 10,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: RED,
  margin: "0 0 14px",
};

const builderShellStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
  gap: 0,
  border: `1px solid ${DIVIDER}`,
  background: DIVIDER,
};

const railStyle: CSSProperties = {
  background: SURFACE,
  padding: 28,
};

const questionPanelStyle: CSSProperties = {
  background: "#fff",
  padding: 34,
};

const previewStyle: CSSProperties = {
  background: DARK,
  color: "#fff",
  padding: 28,
};

const questionNumberStyle: CSSProperties = {
  fontFamily: DISPLAY,
  fontSize: 16,
  fontWeight: 800,
  color: RED,
  flex: "0 0 auto",
};

const capturedStyle: CSSProperties = {
  marginLeft: "auto",
  color: RED,
  fontFamily: BODY,
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

function questionTabStyle(active: boolean, captured: boolean): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minHeight: 48,
    width: "100%",
    border: `1px solid ${active ? RED : DIVIDER}`,
    borderLeft: `4px solid ${active || captured ? RED : DIVIDER}`,
    background: active ? "#fff" : "transparent",
    color: active ? TEXT : STEEL,
    padding: "12px 14px",
    textAlign: "left",
    fontFamily: BODY,
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
  };
}

const progressTrackStyle: CSSProperties = {
  height: 8,
  background: "#fff",
  border: `1px solid ${DIVIDER}`,
};

const progressFillStyle: CSSProperties = {
  height: "100%",
  background: RED,
  transition: "width 160ms ease",
};

const railNoteStyle: CSSProperties = {
  fontFamily: BODY,
  fontSize: 13,
  lineHeight: 1.6,
  color: MUTED,
  margin: "12px 0 0",
};

const questionTitleStyle: CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 800,
  fontSize: "clamp(32px, 4vw, 52px)",
  lineHeight: 0.95,
  textTransform: "uppercase",
  color: TEXT,
  margin: "0 0 12px",
};

const questionPromptStyle: CSSProperties = {
  fontFamily: BODY,
  color: MUTED,
  fontSize: 15,
  lineHeight: 1.7,
  maxWidth: 640,
  margin: "0 0 24px",
};

const textareaStyle: CSSProperties = {
  width: "100%",
  minHeight: 230,
  border: `1px solid ${DIVIDER}`,
  background: SURFACE,
  color: TEXT,
  fontFamily: BODY,
  fontSize: 15,
  lineHeight: 1.65,
  padding: 18,
  resize: "vertical",
  outlineColor: RED,
};

function liveDotStyle(live: boolean): CSSProperties {
  return {
    width: 14,
    height: 14,
    borderRadius: 999,
    background: live ? RED : DIVIDER,
    boxShadow: live ? `0 0 0 8px rgba(200,0,31,0.12)` : "none",
    marginTop: 8,
    flex: "0 0 auto",
  };
}

const primaryButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: 2,
  background: RED,
  color: "#fff",
  padding: "14px 18px",
  fontFamily: BODY,
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  cursor: "pointer",
};

const liveButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  background: RED_DARK,
};

function secondaryButtonStyle(disabled: boolean): CSSProperties {
  return {
    border: `1px solid ${DIVIDER}`,
    borderRadius: 2,
    background: "#fff",
    color: STEEL,
    padding: "13px 16px",
    fontFamily: BODY,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.44 : 1,
  };
}

const listeningStyle: CSSProperties = {
  fontFamily: BODY,
  fontSize: 13,
  color: RED,
  margin: "12px 0 0",
};

const helpStyle: CSSProperties = {
  fontFamily: BODY,
  fontSize: 13,
  color: MUTED,
  margin: "12px 0 0",
};

const contactGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
  gap: 12,
  marginTop: 28,
  paddingTop: 26,
  borderTop: `1px solid ${DIVIDER}`,
};

const inputStyle: CSSProperties = {
  minHeight: 48,
  width: "100%",
  border: `1px solid ${DIVIDER}`,
  background: "#fff",
  color: TEXT,
  fontFamily: BODY,
  fontSize: 14,
  padding: "0 14px",
  outlineColor: RED,
};

const previewBadgeStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  color: "rgba(255,255,255,0.58)",
  fontFamily: BODY,
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  padding: "7px 9px",
};

const markdownStyle: CSSProperties = {
  margin: "20px 0 0",
  maxHeight: 560,
  overflow: "auto",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  color: "rgba(255,255,255,0.78)",
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  fontSize: 12,
  lineHeight: 1.65,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  padding: 16,
};

const errorStyle: CSSProperties = {
  fontFamily: BODY,
  color: "#fff",
  background: "rgba(200,0,31,0.24)",
  border: "1px solid rgba(200,0,31,0.45)",
  padding: 12,
  fontSize: 13,
  lineHeight: 1.5,
};

function submitButtonStyle(disabled: boolean): CSSProperties {
  return {
    ...primaryButtonStyle,
    width: "100%",
    marginTop: 18,
    opacity: disabled ? 0.44 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

const privacyStyle: CSSProperties = {
  fontFamily: BODY,
  fontSize: 12,
  lineHeight: 1.6,
  color: "rgba(255,255,255,0.52)",
  margin: "14px 0 0",
};

const successWrapStyle: CSSProperties = {
  maxWidth: 760,
  margin: "0 auto",
  textAlign: "center",
  border: `1px solid ${DIVIDER}`,
  borderTop: `3px solid ${RED}`,
  padding: "54px 38px",
  background: SURFACE,
};

const successTitleStyle: CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 800,
  fontSize: "clamp(40px, 6vw, 68px)",
  lineHeight: 0.92,
  textTransform: "uppercase",
  color: TEXT,
  margin: "0 0 18px",
};

const successBodyStyle: CSSProperties = {
  fontFamily: BODY,
  color: MUTED,
  fontSize: 16,
  lineHeight: 1.7,
  maxWidth: 560,
  margin: "0 auto 30px",
};

const primaryLinkStyle: CSSProperties = {
  ...primaryButtonStyle,
  textDecoration: "none",
  display: "inline-block",
};

const outlineLinkStyle: CSSProperties = {
  ...secondaryButtonStyle(false),
  textDecoration: "none",
  display: "inline-block",
};
