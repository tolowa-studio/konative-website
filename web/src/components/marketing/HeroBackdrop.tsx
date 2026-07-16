import Image from "next/image";

/**
 * Cinematic hero backdrop: a full-bleed image plus the same two-layer dark
 * overlay used by PitchLayout, so every hero across the site reads with one
 * consistent treatment and light text stays legible.
 *
 * Usage on a custom (non-PitchLayout) hero section:
 *   1. Give the hero <section> `position: relative` and `overflow: hidden`.
 *   2. Drop <HeroBackdrop src="..." alt="..." /> as the section's FIRST child.
 *   3. Ensure the content wrapper has `position: relative` (z-index above the
 *      backdrop) — the backdrop sits at z-index 0, content should be >= 1.
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
    <div aria-hidden={false} style={{ position: "absolute", inset: 0, zIndex: 0 }}>
      <Image src={src} alt={alt} fill priority sizes="100vw" style={{ objectFit: "cover", objectPosition }} />
      {/* Left-weighted darkening so left-aligned hero copy stays legible */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(10,15,30,0.94) 0%, rgba(10,15,30,0.86) 42%, rgba(10,15,30,0.55) 100%)",
        }}
      />
      {/* Vertical fade so the section edges blend into the page */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(10,15,30,0.4) 0%, rgba(10,15,30,0) 32%, rgba(10,15,30,0.7) 100%)",
        }}
      />
    </div>
  );
}
