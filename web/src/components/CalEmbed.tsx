"use client";

/** Compact Cal.com inline embed, reusing the same script pattern as /call's full-page embed. */
export function CalEmbed({ height = 480 }: { height?: number }) {
  return (
    <div style={{ border: "1px solid #E5E7EB", overflow: "hidden", minHeight: height }}>
      <div data-cal-link="konative/discovery" data-cal-config='{"layout":"month_view"}' style={{ width: "100%", height: "100%", minHeight: height }} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function (C, A, L) {
              let p = function (a, ar) { a.q.push(ar); };
              let d = C.document;
              C.Cal = C.Cal || function () {
                let cal = C.Cal;
                let ar = arguments;
                if (!cal.loaded) {
                  cal.ns = {};
                  cal.q = cal.q || [];
                  d.head.appendChild(d.createElement("script")).src = A;
                  cal.loaded = true;
                }
                if (ar[0] === L) {
                  const api = function () { p(api, arguments); };
                  const namespace = ar[1];
                  api.q = api.q || [];
                  typeof namespace === "string" ? (cal.ns[namespace] = api) && p(api, ar) : p(cal, ar);
                  return;
                }
                p(cal, ar);
              };
            })(window, "https://app.cal.com/embed/embed.js", "init");
            Cal("init", { origin: "https://cal.com" });
            Cal("inline", {
              elementOrSelector: "[data-cal-link]",
              calLink: "konative/discovery",
              layout: "month_view",
            });
            Cal("ui", { styles: { branding: { brandColor: "#C8001F" } }, hideEventTypeDetails: false });
          `,
        }}
      />
    </div>
  );
}
