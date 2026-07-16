/**
 * Cinematic hero backdrop: a full-bleed photo plus a one-sided scrim behind
 * wherever the hero copy sits.
 *
 * Uses a plain CSS `background-image` (NOT next/image). next/image `fill`
 * inside these custom-hero sections refused to paint on initial load — a
 * compositing bug that survived every structural/z-index fix. A CSS
 * background sidesteps that rendering path entirely and paints reliably.
 *
 * Usage on a custom hero section:
 *   1. Give the hero <section> `position: relative` and `overflow: hidden`.
 *   2. Drop <HeroBackdrop src="..." alt="..." /> as the section's FIRST child.
 *   3. Give the hero's content wrapper `position: relative` + `zIndex: 2`.
 *   4. If the copy sits on the right (e.g. because that side of the photo is
 *      busier/brighter), pass `scrimSide="right"` to darken that side instead.
 *
 * `src` is an images.unsplash.com URL. Keep the transform suffix
 * `?auto=format&fit=crop&w=2000&q=70` for size/quality.
 */
export interface HeroBackdropProps {
  src: string;
  /** Kept for API compatibility / documentation; a CSS background can't carry
   *  real alt text, so the photo is decorative (aria-hidden). */
  alt?: string;
  /** CSS background-position, e.g. "center top". */
  objectPosition?: string;
  /** Which side of the hero the scrim darkens — put this on the same side as
   *  the hero copy. Defaults to "left" (matches every existing hero page). */
  scrimSide?: "left" | "right";
}

export default function HeroBackdrop({ src, objectPosition = "center", scrimSide = "left" }: HeroBackdropProps) {
  const angle = scrimSide === "right" ? 270 : 90;
  return (
    <>
      {/* Photo as a CSS background — decorative, so aria-hidden. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: `url("${src}")`,
          backgroundSize: "cover",
          backgroundPosition: objectPosition,
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* One-sided scrim: darkens the text zone, fully transparent past the
          halfway mark so the photo reads clearly on the other side. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: `linear-gradient(${angle}deg, rgba(10,15,30,0.8) 0%, rgba(10,15,30,0.45) 30%, rgba(10,15,30,0) 50%, rgba(10,15,30,0) 100%)`,
        }}
      />
    </>
  );
}
