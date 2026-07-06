'use client';

import { useEffect, useMemo, useState } from 'react';

const MIN_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZE = 10;
const PRESET_PAGE_SIZES = [10, 25, 50, 100];

function clampPageSize(size: number, minPageSize: number) {
  const parsed = Number.isFinite(size) ? Math.floor(size) : minPageSize;
  return Math.max(minPageSize, parsed);
}

function readStoredPageSize(storageKey: string | undefined, minPageSize: number, defaultPageSize: number) {
  if (!storageKey || typeof window === 'undefined') return defaultPageSize;
  const stored = localStorage.getItem(storageKey);
  if (!stored) return defaultPageSize;
  const parsed = parseInt(stored, 10);
  return clampPageSize(parsed, minPageSize);
}

export function useTablePagination<T>(
  items: T[],
  options?: {
    defaultPageSize?: number;
    minPageSize?: number;
    storageKey?: string;
  },
) {
  const minPageSize = options?.minPageSize ?? MIN_PAGE_SIZE;
  const defaultPageSize = clampPageSize(options?.defaultPageSize ?? DEFAULT_PAGE_SIZE, minPageSize);
  const storageKey = options?.storageKey;

  const [pageSize, setPageSizeState] = useState(() =>
    readStoredPageSize(storageKey, minPageSize, defaultPageSize),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isCustomPageSize, setIsCustomPageSize] = useState(
    () => !PRESET_PAGE_SIZES.includes(readStoredPageSize(storageKey, minPageSize, defaultPageSize)),
  );

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [items]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const setPageSize = (size: number) => {
    const next = clampPageSize(size, minPageSize);
    setPageSizeState(next);
    setIsCustomPageSize(!PRESET_PAGE_SIZES.includes(next));
    if (storageKey) {
      localStorage.setItem(storageKey, String(next));
    }
    setCurrentPage(1);
  };

  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);

  return {
    paginatedItems,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    rangeStart,
    rangeEnd,
    minPageSize,
    presetPageSizes: PRESET_PAGE_SIZES,
    isCustomPageSize,
    setCurrentPage,
    setPageSize,
    setIsCustomPageSize,
  };
}
