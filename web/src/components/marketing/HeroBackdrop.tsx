import Image from "next/image";

/**
 * Cinematic hero backdrop: a full-bleed photo plus a left-weighted scrim.
 *
 * Renders as a FRAGMENT (no wrapping div) so the <Image fill> and scrim are
 * direct children of the host <section> — structurally identical to how
 * PitchLayout renders its hero image, which is the only arrangement that
 * paints reliably. An intermediate absolutely-positioned wrapper (even with
 * z-index) caused the photo to not paint on initial load in real Chrome.
 *
 * Usage on a custom hero section:
 *   1. Give the hero <section> `position: relative` and `overflow: hidden`
 *      (this is the positioning context <Image fill> needs).
 *   2. Drop <HeroBackdrop src="..." alt="..." /> as the section's FIRST child.
 *   3. Give the hero's content wrapper `position: relative` + `zIndex: 2` so
 *      the copy stays above the photo and scrim.
 *
 * `src` is an images.unsplash.com URL (whitelisted in next.config.ts). Keep
 * the transform suffix `?auto=format&fit=crop&w=2000&q=70` for size/quality.
 */
export interface HeroBackdropProps {
  src: string;
  alt: string;
  /** Overrides the default cover position (e.g. "center top"). */
  objectPosition?: string;
}

export default function HeroBackdrop({ src, alt, objectPosition = "center" }: HeroBackdropProps) {
  return (
    <>
      <Image src={src} alt={alt} fill priority sizes="100vw" style={{ objectFit: "cover", objectPosition, zIndex: 0 }} />
      {/* Left-only scrim: darkens just the left text zone and goes fully
          transparent past the halfway mark, so the photo reads clearly across
          the right half while left-aligned copy stays legible. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(90deg, rgba(10,15,30,0.8) 0%, rgba(10,15,30,0.45) 30%, rgba(10,15,30,0) 50%, rgba(10,15,30,0) 100%)",
        }}
      />
    </>
  );
}
