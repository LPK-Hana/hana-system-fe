'use client';

import React, { useMemo } from 'react';
import { SuratTanggunganFormData } from '../types/suratTanggunganTypes';
import { buildSuratTanggunganJpHtml } from '../utils/suratTanggunganJpTemplate';

export const SuratTanggunganJpTemplatePage: React.FC<{ data: SuratTanggunganFormData }> = ({
  data,
}) => {
  const html = useMemo(() => buildSuratTanggunganJpHtml(data), [data]);

  return (
    <>
      <div
        className="surat-tanggungan-jp-template"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <style jsx global>{`
        .surat-tanggungan-jp-template {
          font-family: 'Yu Gothic', 'YuGothic', 'Meiryo', Aptos, 'Segoe UI', sans-serif;
          font-size: 10.5pt;
          line-height: 1.5;
          color: #000;
        }

        .surat-tanggungan-jp-template p {
          margin: 0.25em 0;
          white-space: normal;
          overflow-wrap: break-word;
          word-break: break-word;
        }

        .surat-tanggungan-jp-template p:has(> br:only-child) {
          min-height: 1.2em;
        }

        .surat-tanggungan-jp-template .doc-table {
          border-collapse: collapse;
          width: 100%;
          max-width: 100%;
          table-layout: fixed;
          margin: 0.45em 0;
        }

        .surat-tanggungan-jp-template .doc-table td,
        .surat-tanggungan-jp-template .doc-table th {
          border: 1px solid #000;
          padding: 4px 6px;
          vertical-align: top;
          white-space: normal;
          overflow-wrap: break-word;
          word-break: break-word;
          line-height: 1.5;
          background: transparent;
        }

        .surat-tanggungan-jp-template .doc-borderless-table,
        .surat-tanggungan-jp-template table[data-table-variant='borderless'] {
          border-collapse: collapse;
          width: 100%;
          max-width: 100%;
          table-layout: fixed;
          margin: 0.35em 0;
        }

        .surat-tanggungan-jp-template .doc-borderless-table td,
        .surat-tanggungan-jp-template .doc-borderless-table th,
        .surat-tanggungan-jp-template table[data-table-variant='borderless'] td,
        .surat-tanggungan-jp-template table[data-table-variant='borderless'] th {
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
          padding: 4px 8px;
          vertical-align: top;
          line-height: 1.5;
        }

        .surat-tanggungan-jp-template .tableWrapper {
          display: block;
          width: 100%;
          max-width: 100%;
          margin: 0.35em 0;
          line-height: 1.5;
        }
      `}</style>
    </>
  );
};
