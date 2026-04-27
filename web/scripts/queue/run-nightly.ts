import { getQueueAdminClient, ingestAllAuthorities } from "./ingest";

async function main() {
  const client = getQueueAdminClient();
  const summary = await ingestAllAuthorities(client);
  // Keep output concise for cron logs.
  console.log(
    JSON.stringify(
      {
        ok: true,
        attempted: summary.attempted,
        insertedOrUpdated: summary.insertedOrUpdated,
        authorities: summary.authorities,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: String(error) }));
  process.exit(1);
});
