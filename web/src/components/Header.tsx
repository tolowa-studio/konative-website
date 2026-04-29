"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks: { label: string; url: string }[] = [
  { label: "Markets", url: "/markets" },
  { label: "Projects", url: "/projects" },
  { label: "Map", url: "/map" },
  { label: "Methodology", url: "/methodology" },
  { label: "Intelligence", url: "/intelligence" },
  { label: "For", url: "/for" },
  { label: "About", url: "/#team" },
];

/** Pages that have a full-bleed dark hero under the header */
const DARK_HERO_PAGES = new Set(["/", "/land", "/invest", "/capacity", "/map", "/projects", "/markets", "/canada", "/methodology", "/intelligence", "/intelligence/saudi", "/intelligence/first-nations", "/news", "/market-intel", "/contact", "/assessment"]);

function isDarkHeroPath(pathname: string): boolean {
  if (DARK_HERO_PAGES.has(pathname)) return true;
  if (pathname === "/for" || pathname.startsWith("/for/")) return true;
  return false;
}

export default function Header() {
  const pathname = usePathname();
  const hasDarkHero = isDarkHeroPath(pathname);

  const [scrolled, setScrolled] = useState(!hasDarkHero);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [ctaHovered, setCtaHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!hasDarkHero) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasDarkHero]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { closeMenu(); }, [pathname, closeMenu]);

  // Dark hero pages have a navy background, so unscrolled state needs light text.
  // Light pages (scrolled === true immediately) use white once header solidifies; dark text on light bg only applies to a non-dark-hero unscrolled state, which doesn't currently exist in the route set but kept for safety.
  const linkColor = scrolled || hasDarkHero ? "#fff" : "#131f36";

  const headerStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    zIndex: 1000,
    background: scrolled ? "rgba(8,20,45,1)" : "transparent",
    borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
    backdropFilter: scrolled ? "blur(8px)" : "none",
    transition: "background 0.3s, border-color 0.3s, color 0.3s",
  };

  const innerStyle: React.CSSProperties = {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    height: 64,
    gap: 24,
  };

  const wordmarkStyle: React.CSSProperties = {
    textDecoration: "none",
    display: "flex",
    alignItems: "baseline",
    flexShrink: 0,
  };

  const wordmarkKoStyle: React.CSSProperties = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 22,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: scrolled || hasDarkHero ? "#fff" : "#131f36",
    transition: "color 0.3s",
  };

  const wordmarkNativeStyle: React.CSSProperties = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 22,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#E07B39",
  };

  const navStyle: React.CSSProperties = {
    display: "flex",
    gap: 22,
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
  };

  const actionsStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  };

  const ctaStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: 11,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    background: ctaHovered ? "#c96a28" : "#E07B39",
    color: "#fff",
    padding: "10px 20px",
    textDecoration: "none",
    flexShrink: 0,
    transition: "background 0.2s",
  };

  const hamburgerStyle: React.CSSProperties = {
    display: isMobile ? "flex" : "none",
    flexDirection: "column",
    justifyContent: "center",
    gap: 5,
    cursor: "pointer",
    padding: "8px 4px",
    marginLeft: "auto",
    background: "none",
    border: "none",
  };

  const barStyle = (n: 0 | 1 | 2): React.CSSProperties => ({
    width: 22,
    height: 2,
    background: scrolled || hasDarkHero ? "#fff" : "#131f36",
    borderRadius: 2,
    transition: "transform 0.25s, opacity 0.25s",
    transformOrigin: "center",
    transform: menuOpen
      ? n === 0 ? "translateY(7px) rotate(45deg)"
      : n === 2 ? "translateY(-7px) rotate(-45deg)"
      : "scaleX(0)"
      : "none",
    opacity: menuOpen && n === 1 ? 0 : 1,
  });

  const drawerStyle: React.CSSProperties = {
    position: "fixed",
    top: 64,
    left: 0,
    right: 0,
    background: "rgba(8,20,45,0.98)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    zIndex: 999,
    display: "flex",
    flexDirection: "column",
    padding: "12px 0 20px",
    transform: menuOpen ? "translateY(0)" : "translateY(-110%)",
    transition: "transform 0.25s ease, visibility 0.25s",
    pointerEvents: menuOpen ? "auto" : "none",
    visibility: menuOpen ? "visible" : "hidden",
  };

  return (
    <>
      <header style={headerStyle}>
        <div style={innerStyle}>
          {/* Wordmark */}
          <Link href="/" style={wordmarkStyle}>
            <span style={wordmarkKoStyle}>KO</span>
            <span style={wordmarkNativeStyle}>NATIVE</span>
          </Link>

          {/* Desktop center nav */}
          {!isMobile && (
            <nav style={navStyle}>
              {navLinks.map((link) => {
                const isHovered = hoveredLink === link.url;
                const navLinkStyle: React.CSSProperties = {
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: 12,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  color: isHovered ? "#E07B39" : linkColor,
                  opacity: isHovered ? 1 : 0.85,
                  transition: "color 0.3s, opacity 0.2s",
                };
                return (
                  <Link
                    key={link.url}
                    href={link.url}
                    style={navLinkStyle}
                    onMouseEnter={() => setHoveredLink(link.url)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Desktop CTA */}
          {!isMobile && (
            <div style={actionsStyle}>
              <Link
                href="/land/submit"
                style={ctaStyle}
                onMouseEnter={() => setCtaHovered(true)}
                onMouseLeave={() => setCtaHovered(false)}
              >
                Submit land →
              </Link>
            </div>
          )}

          {/* Hamburger */}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            style={hamburgerStyle}
          >
            <span style={barStyle(0)} />
            <span style={barStyle(1)} />
            <span style={barStyle(2)} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <nav style={drawerStyle} aria-hidden={!menuOpen}>
        {navLinks.map((link) => (
          <Link
            key={link.url}
            href={link.url}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: 13,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              textDecoration: "none",
              color: "#fff",
              padding: "13px 28px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/land/submit"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            background: "#E07B39",
            color: "#fff",
            padding: "13px 28px",
            textDecoration: "none",
            margin: "12px 28px 0",
            textAlign: "center",
          }}
        >
          Submit land →
        </Link>
      </nav>
    </>
  );
}
