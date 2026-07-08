'use client';

import { useRef, useEffect, useState, useCallback, type ReactNode } from 'react';

type BarMetrics = {
  left: number;
  width: number;
  visible: boolean;
};

type Props = {
  children: ReactNode;
  className?: string;
};

export default function StickyHorizontalScroll({ children, className = '' }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);

  const [scrollWidth, setScrollWidth] = useState(0);
  const [bar, setBar] = useState<BarMetrics>({ left: 0, width: 0, visible: false });

  const updateMetrics = useCallback(() => {
    const content = contentRef.current;
    const wrapper = wrapperRef.current;
    if (!content || !wrapper) return;

    const sw = content.scrollWidth;
    const cw = content.clientWidth;
    const rect = wrapper.getBoundingClientRect();

    setScrollWidth(sw);
    setBar({
      left: rect.left,
      width: rect.width,
      visible: sw > cw + 1,
    });
  }, []);

  useEffect(() => {
    updateMetrics();

    const content = contentRef.current;
    const wrapper = wrapperRef.current;
    if (!content || !wrapper) return;

    const ro = new ResizeObserver(updateMetrics);
    ro.observe(content);
    ro.observe(wrapper);

    const mo = new MutationObserver(updateMetrics);
    mo.observe(content, { childList: true, subtree: true });

    window.addEventListener('resize', updateMetrics);
    window.addEventListener('scroll', updateMetrics, { passive: true });

    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('resize', updateMetrics);
      window.removeEventListener('scroll', updateMetrics);
    };
  }, [updateMetrics, children]);

  const syncFromContent = useCallback(() => {
    if (syncing.current) return;
    syncing.current = true;
    const sticky = stickyRef.current;
    const content = contentRef.current;
    if (sticky && content) sticky.scrollLeft = content.scrollLeft;
    syncing.current = false;
  }, []);

  const syncFromSticky = useCallback(() => {
    if (syncing.current) return;
    syncing.current = true;
    const sticky = stickyRef.current;
    const content = contentRef.current;
    if (sticky && content) content.scrollLeft = sticky.scrollLeft;
    syncing.current = false;
  }, []);

  return (
    <>
      <div ref={wrapperRef} className="relative">
        <div
          ref={contentRef}
          className={`overflow-x-auto sticky-h-scroll-content ${className}`}
          onScroll={syncFromContent}
        >
          {children}
        </div>
      </div>

      {bar.visible && (
        <div
          ref={stickyRef}
          className="fixed bottom-0 z-40 overflow-x-auto custom-scrollbar sticky-h-scroll-bar bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]"
          style={{ left: bar.left, width: bar.width, height: 14 }}
          onScroll={syncFromSticky}
          aria-hidden="true"
        >
          <div style={{ width: scrollWidth, height: 1 }} />
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .sticky-h-scroll-content {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .sticky-h-scroll-content::-webkit-scrollbar {
          display: none;
        }
      `,
        }}
      />
    </>
  );
}
