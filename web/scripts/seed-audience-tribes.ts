import { tribesSeed } from "@/content/audiences/seed-data/tribes";
import { upsertAudiencePage } from "./_audience-seed-helpers";

async function main() {
  const result = await upsertAudiencePage(tribesSeed);
  console.log(`[seed] tribes ${result.created ? "created" : "updated"}: ${result.id}`);
}

main().catch(err => {
  console.error("[seed] tribes failed:", err);
  process.exit(1);
});
