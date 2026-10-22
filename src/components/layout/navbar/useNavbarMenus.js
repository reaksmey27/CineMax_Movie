import { useCallback, useEffect, useRef, useState } from "react";

export default function useNavbarMenus() {
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const panelRef = useRef(null);
  const menuToggleRef = useRef(null);
  const menuRef = useRef(null);

  // ─── Handlers: stable panel & menu closers ───────────────────────────────────

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const closeNotifPanel = useCallback(() => setShowNotifPanel(false), []);

  // ─── Effects: desktop menu close & panel dismissal ───────────────────────────

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1536px)");
    const closeDesktopMenu = () => {
      if (desktop.matches) setIsMenuOpen(false);
    };
    desktop.addEventListener("change", closeDesktopMenu);
    return () => desktop.removeEventListener("change", closeDesktopMenu);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowNotifPanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ─── Helpers: active link check ──────────────────────────────────────────────

  return {
    showNotifPanel,
    setShowNotifPanel,
    isMenuOpen,
    setIsMenuOpen,
    panelRef,
    menuToggleRef,
    menuRef,
    closeMenu,
    closeNotifPanel,
  };
}
