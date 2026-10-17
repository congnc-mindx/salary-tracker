import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function FloatingPanel({
  anchorRef,
  onClose,
  children,
  id,
  label = "Lựa chọn",
}) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);

  const [position, setPosition] = useState(null);

  useLayoutEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;

    if (!anchor || !panel) return;

    function updatePosition() {
      const rect = anchor.getBoundingClientRect();
      const viewport = window.visualViewport;

      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportLeft = viewport?.offsetLeft ?? 0;
      const viewportWidth = viewport?.width ?? window.innerWidth;
      const viewportHeight = viewport?.height ?? window.innerHeight;

      const padding = 12;
      const gap = 8;

      const topEdge = viewportTop + padding;
      const bottomEdge = viewportTop + viewportHeight - padding;

      const width = Math.min(
        rect.width,
        Math.max(0, viewportWidth - padding * 2),
      );

      const left = Math.max(
        viewportLeft + padding,
        Math.min(rect.left, viewportLeft + viewportWidth - padding - width),
      );

      const spaceBelow = Math.max(0, bottomEdge - rect.bottom - gap);
      const spaceAbove = Math.max(0, rect.top - topEdge - gap);

      const desiredHeight = Math.min(panel.scrollHeight, 420);

      const openAbove = spaceBelow < desiredHeight && spaceAbove > spaceBelow;

      const maxHeight = Math.min(420, openAbove ? spaceAbove : spaceBelow);

      const actualHeight = Math.min(desiredHeight, maxHeight);

      const top = openAbove ? rect.top - gap - actualHeight : rect.bottom + gap;

      const next = {
        left,
        top,
        width,
        maxHeight,
      };

      setPosition((previous) => {
        if (
          previous &&
          Object.keys(next).every((key) => previous[key] === next[key])
        ) {
          return previous;
        }

        return next;
      });
    }

    function dismissOutside(event) {
      if (anchor.contains(event.target) || panel.contains(event.target)) {
        return;
      }

      closeRef.current();
    }

    updatePosition();

    const observer = new ResizeObserver(updatePosition);
    observer.observe(anchor);
    observer.observe(panel);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    window.visualViewport?.addEventListener("resize", updatePosition);
    window.visualViewport?.addEventListener("scroll", updatePosition);

    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);

    const frame = requestAnimationFrame(() => {
      const target =
        panel.querySelector('[aria-pressed="true"]:not(:disabled)') ||
        panel.querySelector("button:not(:disabled)");

      target?.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();

      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);

      window.visualViewport?.removeEventListener("resize", updatePosition);
      window.visualViewport?.removeEventListener("scroll", updatePosition);

      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
    };
  }, [anchorRef]);

  return createPortal(
    <div
      ref={panelRef}
      id={id}
      role="group"
      aria-label={label}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();

          closeRef.current();
          anchorRef.current?.focus({ preventScroll: true });
        }
      }}
      style={{
        position: "fixed",
        left: position?.left ?? 0,
        top: position?.top ?? 0,
        width: position?.width ?? anchorRef.current?.offsetWidth ?? 280,
        maxHeight: position?.maxHeight ?? 420,
        visibility: position ? "visible" : "hidden",
        zIndex: 100,
      }}
      className="overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-2 text-slate-950 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    >
      {children}
    </div>,
    document.body,
  );
}
