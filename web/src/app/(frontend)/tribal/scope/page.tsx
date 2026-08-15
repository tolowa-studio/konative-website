import type { Metadata } from "next";
import PitchLayout, { PitchSection } from "@/components/marketing/PitchLayout";
import {
  JsonLd,
  SITE_URL,
  breadcrumbSchema,
  faqSchema,
  serviceSchema,
} from "@/components/seo/JsonLd";
import ScopeBuilder from "./ScopeBuilder";

const PAGE_URL = `${SITE_URL}/tribal/scope`;

export const metadata: Metadata = {
  title: "Voice-to-Scope for Tribal Broadband Projects | Konative",
  description:
    "Turn TBCP 3, NEGP, award, procurement, and connectivity notes into a working Grant-to-Network Scope that Konative can use for supplier-market review.",
  alternates: { canonical: "/tribal/scope" },
  openGraph: {
    title: "Voice-to-Scope for Tribal Broadband Projects | Konative",
    description:
      "A guided voice or typed intake tool for Tribal broadband teams preparing carrier-ready connectivity scopes.",
    url: PAGE_URL,
  },
};

const FAQ_ITEMS = [
  {
    question: "Is this a grant application?",
    answer:
      "No. The tool creates a working connectivity scope for Konative review. It is not submitted to NTIA and does not replace official grant guidance, counsel, engineering, or program compliance review.",
  },
  {
    question: "What happens after we submit a scope?",
    answer:
      "Konative reviews the locations, services, funding context, resilience needs, and procurement path, then determines whether the request is ready for supplier-market sourcing or needs a short clarification call first.",
  },
  {
    question: "Can we use this before an award?",
    answer:
      "Yes. Applicants can use it to organize assumptions before deadline pressure, and awardees can use it to move from funding record to supplier-ready connectivity request.",
  },
];

const breadcrumbJsonLd = breadcrumbSchema([
  { name: "Home", url: SITE_URL },
  { name: "Tribal Connectivity", url: `${SITE_URL}/tribal` },
  { name: "Voice-to-Scope", url: PAGE_URL },
]);

const serviceJsonLd = serviceSchema({
  name: "Tribal broadband voice-to-scope intake",
  description:
    "Guided voice or typed intake for Tribal nations and Native entities turning funding, award, procurement, and network notes into a carrier-ready connectivity scope.",
  url: PAGE_URL,
  serviceType: "Tribal Connectivity Intake",
  areaServed: "United States",
});

const BODY = "Inter, sans-serif";
const MUTED = "#6B7280";

export default function TribalScopePage() {
  return (
    <>
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqSchema(FAQ_ITEMS)} />

      <PitchLayout
        eyebrow="Voice-to-Scope · Tribal Broadband"
        titleLines={[
          { text: "TALK THROUGH", tone: "white" },
          { text: "THE PROJECT.", tone: "dim" },
          { text: "GET A SCOPE.", tone: "rust" },
        ]}
        subhead="Use voice or typed notes to turn TBCP 3, NEGP, award, procurement, and network context into a working Grant-to-Network Scope that Konative can review and move toward supplier-market sourcing."
        primaryCta={{ label: "Start the Scope Builder ↓", href: "#scope-builder" }}
        secondaryCta={{ label: "Read the Funding Guide →", href: "/tribal/grants" }}
        ctaHeadlineTop="FROM ROUGH NOTES"
        ctaHeadlineBottom="TO A MARKET REQUEST."
        ctaSub="Send the working scope when you are ready. Konative will review the connectivity ask and determine the next step."
      >
        <PitchSection eyebrow="How To Use It" heading="Capture the details once">
          <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.75, color: MUTED, maxWidth: 760, margin: 0 }}>
            Answer the prompts in plain language. The tool turns your notes into a structured
            connectivity scope with locations, funding context, network services, current state,
            resilience needs, and procurement path. It is meant to reduce back-and-forth before
            the first review, not to replace formal grant or engineering documents.
          </p>
        </PitchSection>

        <div id="scope-builder">
          <ScopeBuilder />
        </div>
      </PitchLayout>
    </>
  );
}
