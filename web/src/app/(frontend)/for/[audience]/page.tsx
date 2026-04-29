import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AudienceLanding, type AdjacentTitleMap } from "@/components/audience/AudienceLanding";
import { getAudiencePage, listAudiencePages } from "@/lib/audiences/fetch";

export const revalidate = 300;

export async function generateStaticParams() {
  const all = await listAudiencePages();
  return all.map(a => ({ audience: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ audience: string }>;
}): Promise<Metadata> {
  const { audience } = await params;
  const page = await getAudiencePage(audience);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    openGraph: { title: page.metaTitle, description: page.metaDescription },
  };
}

export default async function AudiencePage({
  params,
}: {
  params: Promise<{ audience: string }>;
}) {
  const { audience } = await params;
  const page = await getAudiencePage(audience);
  if (!page) notFound();

  const all = await listAudiencePages();
  const adjacentTitles: AdjacentTitleMap = {};
  for (const a of all) {
    adjacentTitles[a.slug] = a.displayName;
  }

  return <AudienceLanding audience={page} adjacentTitles={adjacentTitles} />;
}
