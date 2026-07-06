'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  rangeStart: number;
  rangeEnd: number;
  pageSize: number;
  minPageSize: number;
  presetPageSizes: number[];
  isCustomPageSize: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onCustomModeChange: (isCustom: boolean) => void;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);
  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
  }
  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export default function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  rangeStart,
  rangeEnd,
  pageSize,
  minPageSize,
  presetPageSizes,
  isCustomPageSize,
  onPageChange,
  onPageSizeChange,
  onCustomModeChange,
}: TablePaginationProps) {
  const visiblePages = getVisiblePages(currentPage, totalPages);
  const isPresetSelected = presetPageSizes.includes(pageSize) && !isCustomPageSize;

  const handlePresetSelect = (value: string) => {
    if (value === 'custom') {
      onCustomModeChange(true);
      return;
    }
    onCustomModeChange(false);
    onPageSizeChange(parseInt(value, 10));
  };

  const handleCustomInput = (value: string) => {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) return;
    onPageSizeChange(parsed);
  };

  return (
    <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-gray-500">
        Menampilkan{' '}
        <span className="font-semibold text-gray-700">{rangeStart}</span>
        {' – '}
        <span className="font-semibold text-gray-700">{rangeEnd}</span>
        {' dari '}
        <span className="font-semibold text-gray-700">{totalItems}</span>
        {' data'}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-2">
          <label htmlFor="table-page-size" className="text-xs font-medium uppercase tracking-wider text-gray-500 whitespace-nowrap">
            Baris per halaman
          </label>
          <select
            id="table-page-size"
            value={isCustomPageSize ? 'custom' : String(pageSize)}
            onChange={(e) => handlePresetSelect(e.target.value)}
            className="h-9 min-w-[88px] border border-gray-300 bg-white px-2 text-sm text-gray-700 focus:border-emerald-700 focus:outline-none"
          >
            {presetPageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
            <option value="custom">Kustom</option>
          </select>
          {isCustomPageSize && (
            <input
              type="number"
              min={minPageSize}
              value={pageSize}
              onChange={(e) => handleCustomInput(e.target.value)}
              className="h-9 w-20 border border-gray-300 bg-white px-2 text-sm text-gray-700 focus:border-emerald-700 focus:outline-none"
              aria-label="Jumlah baris kustom"
            />
          )}
          {!isCustomPageSize && !isPresetSelected && (
            <span className="text-xs text-gray-400">min. {minPageSize}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="inline-flex h-9 w-9 items-center justify-center border border-gray-300 bg-white text-gray-600 transition-colors hover:border-emerald-700 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft size={16} />
          </button>

          {visiblePages.map((page, index) => {
            const prevPage = visiblePages[index - 1];
            const showEllipsis = prevPage != null && page - prevPage > 1;

            return (
              <span key={page} className="flex items-center gap-1">
                {showEllipsis && <span className="px-1 text-xs text-gray-400">…</span>}
                <button
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`inline-flex h-9 min-w-9 items-center justify-center border px-2 text-sm transition-colors ${
                    page === currentPage
                      ? 'border-emerald-700 bg-emerald-700 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-700 hover:text-emerald-700'
                  }`}
                >
                  {page}
                </button>
              </span>
            );
          })}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="inline-flex h-9 w-9 items-center justify-center border border-gray-300 bg-white text-gray-600 transition-colors hover:border-emerald-700 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Halaman berikutnya"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
