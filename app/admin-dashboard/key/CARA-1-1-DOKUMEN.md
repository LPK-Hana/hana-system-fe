# Cara Menjalankan Layout Dokumen 1:1

Panduan **universal** untuk membuat preview dokumen (HTML/CSS) **match 1:1** dengan gambar/PDF referensi.

Berlaku untuk dokumen apa pun: KK, surat, form imigrasi, sertifikat, dll. — asalkan ada **referensi visual per halaman** dan **preview yang bisa di-screenshot**.

---

## Prinsip utama

1. **Layout dulu, form belakangan.** Jangan binding data sebelum struktur halaman cocok.
2. **Bandingkan halaman kertas utuh** (A4/A3/dll.), bukan crop kecil. Tebakan dari potongan sering meleset (margin, tinggi baris, footer).
3. **Satu halaman = satu siklus:** baca referensi → rombak HTML/CSS → screenshot → side-by-side → iterasi → baru minta review.
4. **WYSIWYG:** apa yang di preview = yang dicetak. Hindari dua engine layout (HTML di preview + koordinat PDF terpisah).
5. **Detail kecil boleh diutak-atik bebas:** spasi, enter kosong, `text-align`, padding sel, ukuran font, letter-spacing — asal hasil akhirnya mirip referensi (lega vs rapat ikut asli).

---

## Yang biasanya ada di project

Tidak harus nama folder sama; yang penting ada **tiga sumber**:

| Sumber | Fungsi |
|--------|--------|
| **Referensi** | JPG/PNG/PDF per halaman (sumber kebenaran visual) |
| **Template HTML** | Isi per halaman (sering JSON / string HTML + placeholder) |
| **Preview + CSS** | Kanvas ukuran kertas + style yang dipakai cetak/preview |

Contoh pola folder (boleh beda per dokumen):

```
.../<nama-dokumen>/
├── page.tsx / komponen preview
├── components/*Preview.tsx      ← ukuran kertas + CSS
├── template/*.json              ← HTML per halaman + margins
└── <gambar-contoh>/page-000N.*  ← referensi
```

---

## Checklist sebelum mulai halaman N

- [ ] Ada referensi **satu halaman penuh** (bukan crop)
- [ ] Dev server / preview bisa dibuka
- [ ] Font dokumen tersedia (JP: MS Mincho / Yu Mincho; Latin: Century / Times bila perlu)
- [ ] Tahu index halaman di template (`pages[N-1]` jika 1-based di UI)
- [ ] Margin kertas (mm) sudah diset mendekati asli

---

## Alur kerja 1:1

### 1. Baca referensi halaman penuh

Catat sebelum coding:

- Header / judul / alignment
- Enter & spasi (termasuk baris kosong)
- Tabel: kolom, wrap/nowrap, padding sel
- Blok tanda tangan: label kiri vs value kanan, jarak antar baris
- Rata kiri / tengah / kanan per bagian
- Seberapa “lega” (jarak vertikal) vs “rapat”

### 2. Set ukuran kertas & margin

Margin di template biasanya mm, misalnya:

```json
"margins": { "top": 17, "right": 17, "bottom": 16, "left": 17 }
```

Kanvas preview harus proporsional ke kertas (contoh A4 portrait ~794×1123 px @96dpi). Samakan margin preview dengan JSON.

### 3. Rombak HTML lewat script Node (aman untuk teks JP)

Hindari one-liner PowerShell panjang — quote & encoding mudah rusak.

Pola aman:

1. Buat `tmp-pageN.js` di root project FE
2. Baca template JSON → ganti `pages[N-1].html`
3. `JSON.stringify` + tulis file
4. `node tmp-pageN.js` → hapus script sementara

Placeholder boleh tetap mentah di tahap layout (`<nama...>`, `<thn1>`, dll.) supaya mudah diaudit.

Escape tipikal di string JS:

- Font quote: `&quot;MS Mincho&quot;`
- Placeholder terlihat: `&lt;nama...&gt;`

### 4. Sesuaikan CSS di komponen preview

Pakai **class khusus per blok dokumen** agar tidak merusak halaman lain.

Override yang sering perlu (`!important` boleh jika CSS global tabel mengganggu):

- `white-space: nowrap` — header JP panjang jangan pecah vertikal
- `writing-mode: horizontal-tb` — cegah teks jadi tegak
- `table-layout: fixed` + `<colgroup>` % lebar
- hanging indent nomor (`grid`: nomor | teks)
- padding / `line-height` / `min-height` baris agar **lega seperti asli**
- blok tanda tangan: dua kolom (label | value), `印`/`㊞` di kanan baris jabatan

Kalau referensi terasa longgar: **tambah enter kosong, naikkan padding, perbesar font sedikit**. Jangan takut “kebanyakan spasi” selama side-by-side masih match.

### 5. Screenshot + side-by-side (wajib)

Jangan mengandalkan kira-kira di browser saja.

**A. Render 1 halaman → PNG** (Playwright / Chromium):

```bash
# di root project FE, sekali saja jika belum ada
npm install --no-save playwright
npx playwright install chromium
```

Pola script:

1. Ambil HTML halaman + margin dari template
2. Tulis HTML lokal dengan **CSS preview yang sama**
3. Screenshot elemen kertas → `tmp-pN-preview.png`

**B. Gabung kiri=referensi, kanan=preview** (sharp atau tool setara):

```js
// keduanya di-resize ke ukuran kanvas yang sama (mis. 794×1123)
await sharp({
  create: { width: W * 2 + 20, height: H, channels: 3, background: '#ccc' },
})
  .composite([
    { input: refPng, left: 0, top: 0 },
    { input: previewPng, left: W + 20, top: 0 },
  ])
  .png()
  .toFile('tmp-pN-compare.png');
```

**C. Bandingkan visual** — checklist cepat:

| Cek | Gejala tipikal |
|-----|----------------|
| Judul / header | terlalu naik/turun, float tidak `clear` |
| Lebar kolom | header wrap, kolom sempit/lebar salah |
| Tinggi baris / padding | tabel “kependekan” atau “kepanjangan” |
| Enter kosong | blok tanda tangan / tanggal terlalu rapat |
| Align | value harus tengah/kanan tapi masih kiri |
| Border | double border, nested table bergeser |
| Font | Latin vs JP beda stack; ukuran kurang besar |

### 6. Iterasi kecil

Perbaiki satu–beberapa isu → screenshot ulang → ulangi sampai side-by-side dekat.

Baru:

- Hard refresh preview di browser
- Minta review user / lanjut halaman berikutnya

### 7. Bersihkan file sementara

Hapus `tmp-pageN.js`, `tmp-shot-pN.js`, `tmp-pN-preview.*`, `tmp-pN-compare.png`.

Jangan commit `node_modules` hasil install sementara kecuali memang jadi dependency project.

---

## Pola layout yang sering muncul

### Header kiri + meta kanan

```html
<p style="margin:0;line-height:1.3;">
  <span style="float:right;">（…規格Ａ列４）</span>
  <span>参考様式…</span>
</p>
<p style="clear:both;">Ａ・Ｂ・Ｃ…</p>
```

### Kotak sudut (mis. 別紙)

```html
<div class="doc-corner-box">別紙</div>
<!-- judul: clear:both -->
```

### Tabel fixed

```html
<table class="doc-table" style="width:100%;border-collapse:collapse;table-layout:fixed;">
  <colgroup>
    <col style="width:28%;"><col style="width:72%;">
  </colgroup>
  <tbody>…</tbody>
</table>
```

### Nested row (layout beda dari kolom induk)

Pakai `colspan` + tabel dalam. Jangan paksa semua baris ikut `colgroup` yang sama.

### Hanging indent nomor

```html
<div class="doc-hang">
  <div class="doc-hang-num">１</div>
  <div class="doc-hang-text">…</div>
</div>
```

```css
.doc-hang { display: grid; grid-template-columns: 1.5em 1fr; column-gap: 0.55em; }
```

### Blok tanda tangan (label | value, lega)

```html
<div class="doc-sign">
  <table>
    <tr>
      <td>外国の準備機関の名称</td>
      <td>LPK …</td>
    </tr>
    <tr><td colspan="2"><br></td></tr>
    <tr>
      <td style="vertical-align:top;">作成責任者　役職・氏名</td>
      <td>
        <div class="doc-sign-director">DIRECTOR <span class="inkan">印</span></div>
        <div>MUHAMAD …</div>
      </td>
    </tr>
  </table>
</div>
```

Poin penting: **satu enter kosong** antar baris organisasi & penanggung jawab sering wajib agar tidak “terlalu rapat”; nama rata di bawah jabatan; stempel `印` di **kanan** baris jabatan.

---

## Larangan / tip cepat

| Jangan | Kenapa |
|--------|--------|
| Tebak dari crop / OCR saja | Margin & proporsi salah |
| Edit HTML multibyte via PowerShell `-e` panjang | Encoding/quote rusak |
| Binding form sebelum layout stabil | Kerja dobel |
| `word-break: break-word` di header JP | Teks pecah / vertikal |
| Engine PDF koordinat terpisah dari preview | Sulit 1:1 |
| Dekorasi UI (card, shadow, warna) di area cetak | Dokumen resmi polos |

| Lakukan | Kenapa |
|---------|--------|
| Class CSS per blok dokumen | Override aman |
| Side-by-side ukuran kanvas sama | Deteksi geser mm |
| Spasi / enter / font ikut referensi | “Lega” vs “rapat” |
| Placeholder mentah saat layout | Audit field mudah |

---

## Setelah layout OK

Baru:

1. Daftar variabel / mapping
2. Form pengisian
3. Interpolasi placeholder → data
4. Print / Save as PDF dari **DOM yang sama** (`window.print()` / clone node)

Jangan ubah struktur tabel besar saat binding — ganti isi sel saja.

---

## Prompt siap tempel (agent / sesi baru)

```
Lanjut halaman N dokumen <NAMA_DOKUMEN>.
Referensi: <path gambar/PDF halaman N utuh>
Target: layout 1:1 (HTML template + CSS preview).
Ikuti app/admin-dashboard/key/CARA-1-1-DOKUMEN.md
Bandingkan halaman kertas penuh (screenshot + side-by-side).
Boleh ubah spasi/enter/align/font/padding agar lega seperti asli.
Iterasi sampai cocok, baru minta review.
Form/binding nanti setelah layout stabil.
```

---

## Lokasi file panduan

`hana-system-fe/app/admin-dashboard/key/CARA-1-1-DOKUMEN.md`
