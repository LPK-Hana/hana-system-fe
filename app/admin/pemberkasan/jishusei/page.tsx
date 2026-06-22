"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Filter, Pencil, Trash2, Download, Eye } from "lucide-react";
import { Table, Button, Pagination, Input, InputGroup, Modal, Form, DatePicker } from 'rsuite';
import React from 'react';
import 'rsuite/dist/rsuite.min.css';

const FormField = ({ name, label, text, className, ...props }: any) => (
  <Form.Group controlId={name} className={className}>
    <Form.ControlLabel>{label}</Form.ControlLabel>
    <Form.Control name={name} style={{ width: '100%' }} {...props} />
    {text && <Form.HelpText>{text}</Form.HelpText>}
  </Form.Group>
);

const CustomTextarea = React.forwardRef((props: any, ref) => <Input {...props} as="textarea" ref={ref} />);

const { Column, HeaderCell, Cell } = Table;

// Helper to format date for display
const formatDateDisplay = (d: any) => {
  if (!d) return '-';
  const date = new Date(d);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const emptyFormData = {
  dateCreated: null,
  romajiName: '',
  kanjiName: '',
  birthDate: null,
  age: '',
  address: '',
  schoolName: '',
  schoolStart: null,
  schoolEnd: null,
  work1Company: '',
  work1Start: null,
  work1End: null
};

export default function DokumenJishuseiPage() {
  const router = useRouter();

  // Table Data State (from localStorage)
  const [tableData, setTableData] = useState<any[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('jishusei_data');
    if (stored) {
      setTableData(JSON.parse(stored));
    }
  }, []);

  // Save data to localStorage whenever it changes
  const saveData = (data: any[]) => {
    setTableData(data);
    localStorage.setItem('jishusei_data', JSON.stringify(data));
  };

  // Pagination States
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({ ...emptyFormData });

  // Handle data slicing
  const paginatedData = tableData.slice((page - 1) * limit, page * limit);

  // Handle Submit
  const handleSubmit = () => {
    const newEntry = {
      ...formData,
      id: Date.now(), // unique ID
    };
    saveData([...tableData, newEntry]);
    setFormData({ ...emptyFormData });
    setIsModalOpen(false);
  };

  // Handle Delete
  const handleDelete = (id: number) => {
    const filtered = tableData.filter((item) => item.id !== id);
    saveData(filtered);
  };

  return (
    <main className="min-h-screen bg-[#F4F7F4] p-6 md:p-12 relative overflow-hidden font-sans text-gray-800">
      {/* Decorative Soft Mesh Gradient / Natural Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-emerald-100/40 blur-[120px]" />
        <div className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-amber-50/50 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-emerald-50 shadow-sm min-h-[80vh] flex flex-col">
        {/* Header Section */}
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
                Kelola daftar dan berkas peserta Jishusei di sini.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto">
            <Button onClick={() => setIsModalOpen(true)} appearance="primary" color="green" className="!rounded-xl !font-bold shadow-sm">
              + Tambah Data
            </Button>
          </div>
        </header>

        {/* Table Controls (Search etc) */}
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

        {/* Table Content */}
        <div className="bg-white rounded-2xl overflow-hidden border border-emerald-100 shadow-sm flex-1 flex flex-col">
          {tableData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <Search size={32} className="text-emerald-300" />
              </div>
              <p className="text-gray-400 font-bold text-lg mb-1">Belum ada data</p>
              <p className="text-gray-400 text-sm">Klik tombol <strong className="text-emerald-600">+ Tambah Data</strong> untuk menambahkan peserta baru.</p>
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

                <Column width={160} fixed="right" align="center">
                  <HeaderCell className="!bg-emerald-50/80 !text-emerald-800 !font-bold !text-xs tracking-wider uppercase">Action</HeaderCell>
                  <Cell style={{ padding: '6px 0' }}>
                    {rowData => (
                      <div className="flex items-center justify-center gap-2 h-full w-full">
                        <Button onClick={() => router.push(`/admin/pemberkasan/jishusei/preview/${rowData.id}`)} appearance="subtle" size="sm" className="!text-blue-500 hover:!bg-blue-50 !p-1.5 flex items-center justify-center" title="Preview Dokumen">
                          <Eye size={18} />
                        </Button>
                        <Button appearance="subtle" size="sm" className="!text-emerald-600 hover:!bg-emerald-50 !p-1.5 flex items-center justify-center" title="Edit">
                          <Pencil size={18} />
                        </Button>
                        <Button onClick={() => handleDelete(rowData.id)} appearance="subtle" size="sm" className="!text-red-500 hover:!bg-red-50 !p-1.5 flex items-center justify-center" title="Hapus">
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    )}
                  </Cell>
                </Column>
              </Table>

              {/* Pagination */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <Pagination
                  prev
                  next
                  first
                  last
                  ellipsis
                  boundaryLinks
                  maxButtons={5}
                  size="md"
                  layout={['total', '-', 'limit', '|', 'pager', 'skip']}
                  total={tableData.length}
                  limitOptions={[10, 20, 50]}
                  limit={limit}
                  activePage={page}
                  onChangePage={setPage}
                  onChangeLimit={setLimit}
                  className="!text-gray-600"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ADD DATA MODAL */}
      <Modal size="lg" open={isModalOpen} onClose={() => setIsModalOpen(false)} overflow={true}>
        <Modal.Header>
          <Modal.Title className="font-serif text-emerald-900 text-xl font-bold">Tambah Dokumen Jishusei</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">

          <Form fluid onChange={(formValue) => setFormData(formValue)} formValue={formData}>
            <h5 className="text-sm font-bold text-emerald-800 mb-4 border-b pb-2">1. Identitas Diri</h5>

            <FormField name="dateCreated" label="Tanggal Pembuatan Dokumen" accepter={DatePicker} format="dd MMM yyyy" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="romajiName" label="Nama (Romawi)" />
              <FormField name="kanjiName" label="Nama (Kanji)" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="birthDate" label="Tanggal Lahir" accepter={DatePicker} format="dd MMM yyyy" />
              <FormField name="age" label="Umur" type="number" />
            </div>

            <FormField name="address" label="Alamat Sekarang" accepter={CustomTextarea} rows={3} />

            <h5 className="text-sm font-bold text-emerald-800 mt-6 mb-4 border-b pb-2">2. Riwayat Pendidikan & Pekerjaan</h5>

            <FormField name="schoolName" label="Nama Sekolah" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="schoolStart" label="Mulai (Bulan/Tahun)" accepter={DatePicker} format="MM yyyy" />
              <FormField name="schoolEnd" label="Lulus (Bulan/Tahun)" accepter={DatePicker} format="MM yyyy" />
            </div>

            <FormField name="work1Company" label="Perusahaan Pengalaman Kerja (1)" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="work1Start" label="Mulai (Bulan/Tahun)" accepter={DatePicker} format="MM yyyy" />
              <FormField name="work1End" label="Selesai (Bulan/Tahun)" accepter={DatePicker} format="MM yyyy" />
            </div>
          </Form>

        </Modal.Body>
        <Modal.Footer className="border-t border-emerald-50 bg-emerald-50/20 pt-4 flex justify-end gap-2">
          <Button onClick={() => setIsModalOpen(false)} appearance="subtle">
            Batal
          </Button>
          <Button onClick={handleSubmit} appearance="primary" color="green" className="shadow-sm">
            Simpan Data
          </Button>
        </Modal.Footer>
      </Modal>

    </main>
  );
}
