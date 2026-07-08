"use client";

/**
 * Compact Cal.com booking card. Instead of rendering a full ~520px inline
 * month-view calendar (which dominated the homepage and forced a long scroll),
 * this is a small card whose button opens the Cal.com calendar in a popup
 * overlay on click — booking stays one click away and prominent on the front
 * page, but takes ~150px of vertical space instead of ~520px.
 *
 * Homepage-only. The dedicated /call page keeps its own full inline calendar,
 * which is appropriate there since that page exists specifically to book.
 */
export function CalEmbed() {
  return (
    <div
      style={{
        border: "1px solid #E5E7EB",
        background: "#fff",
        padding: "24px 24px 26px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#C8001F",
            border: "1px solid #C8001F",
            borderRadius: 2,
            padding: "3px 7px",
          }}
        >
          15 min
        </span>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: "#111111" }}>
          Discovery call
        </span>
      </div>

      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.6, color: "#6B7280", margin: 0 }}>
        Pick any open slot. No pitch deck — we&apos;ll tell you honestly whether Konative is the right
        partner for your project and what the path forward looks like.
      </p>

      <button
        type="button"
        data-cal-link="jeramey-james/15min"
        data-cal-config='{"layout":"month_view"}'
        style={{
          alignSelf: "flex-start",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 12,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          background: "#C8001F",
          color: "#fff",
          border: "none",
          padding: "14px 28px",
          cursor: "pointer",
          borderRadius: 2,
        }}
      >
        Pick a time →
      </button>

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
            Cal("ui", { styles: { branding: { brandColor: "#C8001F" } }, hideEventTypeDetails: false });
          `,
        }}
      />
    </div>
  );
}
