'use client';

import React, { useMemo } from 'react';
import { SuratTanggunganFormData } from '../types/suratTanggunganTypes';
import { buildSuratTanggunganIdHtml } from '../utils/suratTanggunganIdTemplate';

export const SuratTanggunganIdTemplatePage: React.FC<{ data: SuratTanggunganFormData }> = ({
  data,
}) => {
  const html = useMemo(() => buildSuratTanggunganIdHtml(data), [data]);

  return (
    <>
      <div
        className="surat-tanggungan-id-template"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <style jsx global>{`
        .surat-tanggungan-id-template {
          font-family: Aptos, 'Segoe UI', Calibri, 'Helvetica Neue', Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #000;
        }

        .surat-tanggungan-id-template p {
          margin: 0.25em 0;
          white-space: normal;
          overflow-wrap: break-word;
          word-break: break-word;
        }

        /* Tabel data tanggungan — ada garis */
        .surat-tanggungan-id-template .doc-table {
          border-collapse: collapse;
          width: 100%;
          max-width: 100%;
          table-layout: fixed;
          margin: 0.35em 0;
        }

        .surat-tanggungan-id-template .doc-table td,
        .surat-tanggungan-id-template .doc-table th {
          border: 1px solid #000;
          padding: 2px 4px;
          vertical-align: top;
          white-space: normal;
          overflow-wrap: break-word;
          word-break: break-word;
          line-height: 1.5;
          background: transparent;
        }

        .surat-tanggungan-id-template .doc-table th {
          font-weight: bold;
        }

        /* Tabel tanpa garis — biodata & footer */
        .surat-tanggungan-id-template .doc-borderless-table,
        .surat-tanggungan-id-template table[data-table-variant='borderless'] {
          border-collapse: collapse;
          width: 100%;
          max-width: 100%;
          table-layout: fixed;
          margin: 0.35em 0;
          border: none;
        }

        .surat-tanggungan-id-template .doc-borderless-table td,
        .surat-tanggungan-id-template .doc-borderless-table th,
        .surat-tanggungan-id-template table[data-table-variant='borderless'] td,
        .surat-tanggungan-id-template table[data-table-variant='borderless'] th {
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
          padding: 0;
          vertical-align: top;
        }

        .surat-tanggungan-id-template .tableWrapper {
          display: block;
          width: 100%;
          max-width: 100%;
          line-height: 1.5;
        }
      `}</style>
    </>
  );
};
