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
    {/* No z-index here: an explicit z-index:0 made this wrapper a stacking
        context, which pushed the photo BEHIND the host section's opaque
        background and rendered every custom-hero image invisible (verified in
        real Chrome). Left as the section's first child, it paints below the
        later grid/content siblings in normal tree order — image visible,
        text on top. */}
    <div aria-hidden={false} style={{ position: "absolute", inset: 0 }}>
      <Image src={src} alt={alt} fill priority sizes="100vw" style={{ objectFit: "cover", objectPosition }} />
      {/* Left-only scrim: darkens just the left text zone and goes FULLY
          transparent past the halfway mark, so the photo reads clearly across
          the right half while left-aligned copy stays legible. A full-cover
          overlay (any alpha) crushed the photo to black — verified live; a
          left-weighted scrim that reaches 0 is the fix. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(10,15,30,0.8) 0%, rgba(10,15,30,0.45) 30%, rgba(10,15,30,0) 50%, rgba(10,15,30,0) 100%)",
        }}
      />
    </div>
  );
}
