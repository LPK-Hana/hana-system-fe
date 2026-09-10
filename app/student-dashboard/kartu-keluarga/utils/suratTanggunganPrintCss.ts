/** CSS cetak/export Surat Tanggungan — sama dengan preview A4 di layar */
export const SURAT_TANGGUNGAN_ID_PRINT_CSS = `
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
.surat-tanggungan-id-template .doc-table th { font-weight: bold; }
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
`;

export const SURAT_TANGGUNGAN_JP_PRINT_CSS = `
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
.surat-tanggungan-jp-template .st-jp-stack-group > .tableWrapper:first-child {
  margin-bottom: 0 !important;
}
.surat-tanggungan-jp-template .st-jp-stack-group > .tableWrapper + .tableWrapper {
  margin-top: 0 !important;
}
.surat-tanggungan-jp-template .st-jp-stack-group > .tableWrapper:first-child table {
  margin-bottom: 0 !important;
}
.surat-tanggungan-jp-template .st-jp-stack-group > .tableWrapper + .tableWrapper table {
  margin-top: 0 !important;
}
.surat-tanggungan-jp-template .st-jp-stack-group > .tableWrapper:first-child td {
  padding-bottom: 0 !important;
  vertical-align: bottom;
}
.surat-tanggungan-jp-template .st-jp-stack-group > .tableWrapper:first-child p {
  margin: 0 !important;
  line-height: 1.15 !important;
}
.surat-tanggungan-jp-template .st-jp-stack-group > .tableWrapper + .tableWrapper td {
  padding-top: 0 !important;
  vertical-align: top;
}
.surat-tanggungan-jp-template .st-jp-stack-group > .tableWrapper + .tableWrapper p {
  margin: 0 !important;
  line-height: 1.15 !important;
}
.surat-tanggungan-jp-template .st-jp-stack-table tr:first-child td {
  padding-bottom: 0 !important;
  vertical-align: bottom;
}
.surat-tanggungan-jp-template .st-jp-stack-table tr:first-child p {
  margin: 0 !important;
  line-height: 1.15 !important;
}
.surat-tanggungan-jp-template .st-jp-stack-table tr:nth-child(2) td {
  padding-top: 0 !important;
  vertical-align: top;
}
.surat-tanggungan-jp-template .st-jp-stack-table tr:nth-child(2) p {
  margin: 0 !important;
  line-height: 1.15 !important;
}
`;
