// index.js
var JOBS = {
  "0 7 * * 1": "https://konative.com/api/ingest-canada-queue",
  "0 8 * * 1": "https://konative.com/api/ingest-ieso"
};
var index_default = {
  async scheduled(event, env, ctx) {
    const url = JOBS[event.cron];
    if (!url) return;
    ctx.waitUntil(
      fetch(url, { method: "GET", headers: { authorization: `Bearer ${env.CRON_SECRET}` } }).then((r) => console.log(`cron ${event.cron} -> ${url} : ${r.status}`)).catch((e) => console.error(`cron ${event.cron} failed`, e))
    );
  }
};
export {
  index_default as default
};
