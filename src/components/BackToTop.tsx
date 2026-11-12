import { useEffect, useState } from "react";
import { Text, UnstyledButton } from "@mantine/core";
import { ArrowUp } from "lucide-react";
import { useLanguage } from "../context/useLanguage.ts";

/**
 * Floating glass back-to-top button, on every page. Hidden until the page
 * has scrolled down 400px, then smooth-scrolls to the top — instantly when
 * the user prefers reduced motion. A real button with a visible text label
 * (not icon-only), so it is keyboard-focusable and self-explanatory.
 */
export default function BackToTop() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  const scrollTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <UnstyledButton className="back-to-top" aria-label={t.chrome.backToTop} onClick={scrollTop}>
      <ArrowUp size={18} aria-hidden />
      <Text size="sm" fw={700}>
        {t.chrome.backToTop}
      </Text>
    </UnstyledButton>
  );
}
