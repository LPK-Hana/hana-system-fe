import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseBasicInfo } from '../app/student-dashboard/kartu-keluarga/utils/kkOcrBasicInfo.ts';
import { parseMembersFromOcr } from '../app/student-dashboard/kartu-keluarga/utils/kkOcrMembers.ts';
import { stripKepalaNameWordsFromAddress } from '../app/student-dashboard/kartu-keluarga/utils/kkOcrBasicInfo.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'scripts', 'ocr-output');

const emptyMember = {
  name: '', nik: '', gender: '', pob: '', dob: '', religion: '', education: '',
  occupation: '', maritalStatus: '', marriageDate: '', relationship: '', nationality: '',
  passport: '', kitas: '', father: '', mother: '', bloodType: '',
};

const samples = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['cuntoh', 'testkk2', 'testkk3'];

for (const name of samples) {
  const browserPath = path.join(outDir, `${name}.txt`);
  const rawPath = path.join(outDir, `${name}-raw.txt`);
  const readPath = fs.existsSync(browserPath)
    ? browserPath
    : fs.existsSync(rawPath)
      ? rawPath
      : path.join(outDir, `${name}.txt`);
  const text = fs.readFileSync(readPath, 'utf8');
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const kkNumber = text.match(/\b\d{16}\b/)?.[0] || '';
  const basic = parseBasicInfo(lines);
  const members = parseMembersFromOcr(lines, kkNumber, null, emptyMember);
  const kepala = members.find((m) => /KEPALA/i.test(m.relationship));

  console.log(`\n========== ${name} (${kkNumber}) ==========`);
  console.log('Header:', basic.kepalaKeluarga, '|', basic.alamat);
  for (const m of members.filter((x) => x.nik)) {
    console.log({
      nama: m.name,
      pob: m.pob,
      pendidikan: m.education,
      pekerjaan: m.occupation,
      kawin: m.maritalStatus,
      tglKawin: m.marriageDate,
      hub: m.relationship,
      ayah: m.father,
      ibu: m.mother,
    });
  }
}
