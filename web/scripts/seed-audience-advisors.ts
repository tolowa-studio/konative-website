import { advisorsSeed } from "@/content/audiences/seed-data/advisors";
import { upsertAudiencePage } from "./_audience-seed-helpers";

async function main() {
  const result = await upsertAudiencePage(advisorsSeed);
  console.log(`[seed] advisors ${result.created ? "created" : "updated"}: ${result.id}`);
}

main().catch(err => {
  console.error("[seed] advisors failed:", err);
  process.exit(1);
});
