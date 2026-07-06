import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface VoiceAnswer {
  id: string;
  label: string;
  value: string;
}

export interface VoiceIntakeSummary {
  headline: string;
  paragraph: string;
  requirements: string[];
}

const SYSTEM_PROMPT = `You turn a prospect's spoken answers about their connectivity needs into a
short, organized brief for a connectivity brokerage's sales desk. Return JSON only, no markdown
fences:
{
  "headline": "one short line naming what they need, e.g. 'Gigabit fiber for a rural health clinic'",
  "paragraph": "2-3 plain sentences summarizing the need in the prospect's own terms, no fluff, no sales language",
  "requirements": ["short bullet", "short bullet", ...]
}
Only use information actually present in the answers — never invent locations, speeds, or details
that weren't said. If an answer is empty or unclear, leave it out rather than guessing.`;

/** Best-effort AI polish of raw voice-intake answers into an organized brief. Never throws —
 * falls back to a plain template built from the raw answers if the Claude call fails, so a model
 * hiccup never blocks a real submission. */
export async function summarizeVoiceIntake(answers: VoiceAnswer[]): Promise<VoiceIntakeSummary> {
  const fallback = buildFallbackSummary(answers);
  if (!process.env.ANTHROPIC_API_KEY) return fallback;

  try {
    const userMsg = answers
      .filter(a => a.value.trim())
      .map(a => `${a.label}: ${a.value.trim()}`)
      .join("\n");
    if (!userMsg) return fallback;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg }],
    });
    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const parsed = JSON.parse(text) as Partial<VoiceIntakeSummary>;
    return {
      headline: parsed.headline || fallback.headline,
      paragraph: parsed.paragraph || fallback.paragraph,
      requirements: Array.isArray(parsed.requirements) && parsed.requirements.length > 0 ? parsed.requirements : fallback.requirements,
    };
  } catch (err) {
    console.error("[voiceIntakeSummary] Claude summarization failed, using fallback:", err);
    return fallback;
  }
}

function buildFallbackSummary(answers: VoiceAnswer[]): VoiceIntakeSummary {
  const filled = answers.filter(a => a.value.trim());
  return {
    headline: filled[0]?.value.slice(0, 80) || "New connectivity inquiry",
    paragraph: filled.map(a => a.value.trim()).join(" ") || "No details captured.",
    requirements: filled.map(a => `${a.label}: ${a.value.trim()}`),
  };
}

export function buildVoiceIntakeMarkdown(answers: VoiceAnswer[], summary: VoiceIntakeSummary, contact: { name: string; email: string }): string {
  return `# Voice Intake: ${summary.headline}

## Submitted By
- Name: ${contact.name.trim() || "Not provided"}
- Email: ${contact.email.trim() || "Not provided"}

## Summary
${summary.paragraph}

## Requirements
${summary.requirements.map(r => `- ${r}`).join("\n") || "- To be clarified on follow-up call."}

## Raw Answers
${answers.filter(a => a.value.trim()).map(a => `**${a.label}:** ${a.value.trim()}`).join("\n\n") || "_None captured._"}
`;
}
