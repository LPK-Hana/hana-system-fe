"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Pencil, Trash2, Eye, Wand2 } from "lucide-react";
import { Table, Button, Pagination, Input, InputGroup, Modal } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import JishuseiFormFields from './components/JishuseiFormFields';
import { getDummyJishuseiPage1 } from './dummyData';
import { emptyJishuseiPage1, type JishuseiPage1Data } from './types';
import { loadAllEntries, saveAllEntries } from './utils';

const { Column, HeaderCell, Cell } = Table;

const formatDateDisplay = (d: string | null) => {
  if (!d) return '-';
  const date = new Date(d);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function DokumenJishuseiPage() {
  const router = useRouter();
  const [tableData, setTableData] = useState<JishuseiPage1Data[]>([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [formData, setFormData] = useState<Omit<JishuseiPage1Data, 'id'>>(emptyJishuseiPage1());

  useEffect(() => {
    setTableData(loadAllEntries());
  }, []);

  const saveData = (data: JishuseiPage1Data[]) => {
    setTableData(data);
    saveAllEntries(data);
  };

  const paginatedData = tableData.slice((page - 1) * limit, page * limit);

  const handleSubmit = () => {
    const newEntry: JishuseiPage1Data = {
      ...formData,
      id: Date.now(),
    };
    saveData([...tableData, newEntry]);
    setFormData(emptyJishuseiPage1());
    setIsModalOpen(false);
    router.push(`/admin/pemberkasan/jishusei/preview/${newEntry.id}`);
  };

  const handleDelete = (id: number) => {
    saveData(tableData.filter((item) => item.id !== id));
  };

  const openNewForm = () => {
    setFormData(emptyJishuseiPage1());
    setFormKey((k) => k + 1);
    setIsModalOpen(true);
  };

  const handleFillDummy = () => {
    setFormData(getDummyJishuseiPage1());
    setFormKey((k) => k + 1);
  };

  return (
    <main className="min-h-screen bg-[#F4F7F4] p-6 md:p-12 relative overflow-hidden font-sans text-gray-800">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-emerald-100/40 blur-[120px]" />
        <div className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-amber-50/50 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-emerald-50 shadow-sm min-h-[80vh] flex flex-col">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-emerald-100 pb-6">
          <div className="flex items-start md:items-center gap-4">
            <button
              onClick={() => router.push("/admin/pemberkasan")}
              className="p-2.5 bg-white border border-emerald-100 !rounded-xl shadow-sm text-emerald-700 hover:bg-emerald-50 transition-colors shrink-0 mt-1 md:mt-0"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-emerald-900 tracking-wide mb-1">
                Dokumen Jishusei
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Isi form Riwayat Hidup (Hal. 1) → Preview → Download PDF A4
              </p>
            </div>
          </div>
          <Button onClick={openNewForm} appearance="primary" color="green" className="!rounded-xl !font-bold shadow-sm">
            + Tambah Data
          </Button>
        </header>

        <div className="flex justify-between items-center mb-4 gap-4">
          <div className="w-full max-w-sm">
            <InputGroup inside className="!rounded-xl !border-emerald-200 focus-within:!border-emerald-500">
              <Input placeholder="Cari nama..." />
              <InputGroup.Button>
                <Search size={16} className="text-gray-400" />
              </InputGroup.Button>
            </InputGroup>
          </div>
          <div className="text-sm font-medium text-gray-500">
            Total Data: <span className="text-emerald-700 font-bold">{tableData.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden border border-emerald-100 shadow-sm flex-1 flex flex-col">
          {tableData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <Search size={32} className="text-emerald-300" />
              </div>
              <p className="text-gray-400 font-bold text-lg mb-1">Belum ada data</p>
              <p className="text-gray-400 text-sm">Klik <strong className="text-emerald-600">+ Tambah Data</strong> untuk mulai mengisi form.</p>
            </div>
          ) : (
            <>
              <Table
                height={500}
                data={paginatedData}
                rowClassName={() => "hover:bg-emerald-50/40 cursor-pointer transition-colors"}
                headerHeight={56}
                rowHeight={60}
              >
                <Column width={60} align="center" fixed>
                  <HeaderCell className="!bg-emerald-50/80 !text-emerald-800 !font-bold !text-xs tracking-wider uppercase">No</HeaderCell>
                  <Cell>
                    {(_rowData, rowIndex) => (
                      <span className="text-gray-500 font-medium">{(page - 1) * limit + (rowIndex ?? 0) + 1}</span>
                    )}
                  </Cell>
                </Column>

                <Column flexGrow={1} minWidth={180}>
                  <HeaderCell className="!bg-emerald-50/80 !text-emerald-800 !font-bold !text-xs tracking-wider uppercase">Nama (Romawi)</HeaderCell>
                  <Cell>
                    {rowData => (
                      <span className="text-gray-800 font-bold">{rowData.romajiName || '-'}</span>
                    )}
                  </Cell>
                </Column>

                <Column width={150}>
                  <HeaderCell className="!bg-emerald-50/80 !text-emerald-800 !font-bold !text-xs tracking-wider uppercase">Nama (Kanji)</HeaderCell>
                  <Cell>
                    {rowData => (
                      <span className="text-gray-700">{rowData.kanjiName || '-'}</span>
                    )}
                  </Cell>
                </Column>

                <Column width={80} align="center">
                  <HeaderCell className="!bg-emerald-50/80 !text-emerald-800 !font-bold !text-xs tracking-wider uppercase">Umur</HeaderCell>
                  <Cell>
                    {rowData => (
                      <span className="text-gray-600 font-medium">{rowData.age || '-'}</span>
                    )}
                  </Cell>
                </Column>

                <Column width={140}>
                  <HeaderCell className="!bg-emerald-50/80 !text-emerald-800 !font-bold !text-xs tracking-wider uppercase">Tgl. Dibuat</HeaderCell>
                  <Cell>
                    {rowData => (
                      <span className="text-gray-500 text-sm">{formatDateDisplay(rowData.dateCreated)}</span>
                    )}
                  </Cell>
                </Column>

                <Column width={120} fixed="right" align="center">
                  <HeaderCell className="!bg-emerald-50/80 !text-emerald-800 !font-bold !text-xs tracking-wider uppercase">Action</HeaderCell>
                  <Cell style={{ padding: '6px 0' }}>
                    {rowData => (
                      <div className="flex items-center justify-center gap-2 h-full w-full">
                        <Button onClick={() => router.push(`/admin/pemberkasan/jishusei/preview/${rowData.id}`)} appearance="subtle" size="sm" className="!text-blue-500 hover:!bg-blue-50 !p-1.5" title="Preview">
                          <Eye size={18} />
                        </Button>
                        <Button appearance="subtle" size="sm" className="!text-emerald-600 hover:!bg-emerald-50 !p-1.5" title="Edit (segera)">
                          <Pencil size={18} />
                        </Button>
                        <Button onClick={() => handleDelete(rowData.id)} appearance="subtle" size="sm" className="!text-red-500 hover:!bg-red-50 !p-1.5" title="Hapus">
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    )}
                  </Cell>
                </Column>
              </Table>

              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <Pagination
                  prev next first last ellipsis boundaryLinks
                  maxButtons={5} size="md"
                  layout={['total', '-', 'limit', '|', 'pager', 'skip']}
                  total={tableData.length}
                  limitOptions={[10, 20, 50]}
                  limit={limit}
                  activePage={page}
                  onChangePage={setPage}
                  onChangeLimit={setLimit}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <Modal size="lg" open={isModalOpen} onClose={() => setIsModalOpen(false)} overflow>
        <Modal.Header>
          <Modal.Title className="font-serif text-emerald-900 text-xl font-bold">
            Form Riwayat Hidup — Halaman 1
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 max-h-[70vh] overflow-y-auto">
          <div className="flex justify-end mb-4">
            <Button
              appearance="ghost"
              size="sm"
              onClick={handleFillDummy}
              className="!text-amber-700 hover:!bg-amber-50 !font-semibold"
            >
              <Wand2 size={16} className="inline-block mr-1.5 -mt-0.5" />
              Isi Data Dummy
            </Button>
          </div>
          <JishuseiFormFields key={formKey} formData={formData} onChange={setFormData} />
        </Modal.Body>
        <Modal.Footer className="border-t border-emerald-50 bg-emerald-50/20 pt-4 flex justify-end gap-2">
          <Button onClick={() => setIsModalOpen(false)} appearance="subtle">Batal</Button>
          <Button onClick={handleSubmit} appearance="primary" color="green" className="shadow-sm">
            Simpan & Preview
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
}
