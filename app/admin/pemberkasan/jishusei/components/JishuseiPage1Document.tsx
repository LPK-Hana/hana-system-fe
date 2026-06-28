import type { JishuseiPage1Data } from '../types';
import {
  formatBirthDate,
  formatDateCreated,
  formatGenderJa,
  formatJapanVisitJa,
  formatPeriod,
  formatWorkCompany,
} from '../utils';
import { EDU_ROW_COUNT, PAGE1_STATIC, WORK_ROW_COUNT } from '../page1StaticText';
import '../jishusei-page1.css';

const S = PAGE1_STATIC;

/** Kolom utama — diukur dari PDF asli untuk 1:1 */
const COL = {
  c1: '13%',   /* ①～⑩ label - diperlebar agar Nama lengkap pas 2 baris */
  c2: '12%',   /* sub-label ローマ字/漢字 - diperlebar agar Huruf Romawi tidak turun */
  c3: '28.5%', /* nilai kiri */
  c4: '12%',   /* label kanan ②③⑤ */
  c5: '34.5%', /* nilai kanan */
} as const;

const BilingualLabel = ({
  ja,
  id,
  id2,
}: {
  ja: string;
  id?: string;
  id2?: string;
}) => (
  <div className="lbl-stack">
    <span className="jp">{ja}</span>
    {id && <span className="id">{id}</span>}
    {id2 && <span className="id">{id2}</span>}
  </div>
);

interface Props {
  data: JishuseiPage1Data;
  id?: string;
}

export default function JishuseiPage1Document({ data, id = 'jishusei-page1' }: Props) {
  const eduRows = Array.from({ length: EDU_ROW_COUNT }, (_, i) => data.educations[i]);
  const workRows = Array.from({ length: WORK_ROW_COUNT }, (_, i) => data.workHistories[i]);
  const months = data.relatedSkillDurationMonths.trim();

  return (
    <div id={id} className="jishusei-page1">
      <div className="hdr-row">
        <span className="hdr-ref jp">参考様式第１-３号（規則第８条第４号関係）</span>
        <span className="hdr-right jp">（日本産業規格Ａ列４）</span>
      </div>
      <div className="hdr-ref-id-row">
        <span className="hdr-ref-id">Rujukan Formulir Nomor 1-3 (Berhubungan dengan Peraturan Pasal 8 Nomor 4)</span>
        <span className="hdr-ref-id-right">(Standar Industri Jepang ukuran A4)</span>
      </div>
      <div className="hdr-cat jp">{S.categories}</div>

      <div className="title-row">
        {S.titleChars.map((c) => (
          <span key={c} className="title-char">{c}</span>
        ))}
      </div>
      <div className="title-id">{S.titleId}</div>

      <div className="date-block">
        <div className="date-row">
          <span className="date-year-val">{formatDateCreated(data.dateCreated)}</span>
          <span className="date-suffix jp">&nbsp;作成</span>
        </div>
        <div className="date-label-row">Dibuat&nbsp;&nbsp;Thn.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bln.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tgl.</div>
      </div>

      <table className="form">
        <colgroup>
          <col style={{ width: COL.c1 }} />
          <col style={{ width: COL.c2 }} />
          <col style={{ width: COL.c3 }} />
          <col style={{ width: COL.c4 }} />
          <col style={{ width: COL.c5 }} />
        </colgroup>
        <tbody>
          {/* ① + ② */}
          <tr>
            <td className="section-lbl" rowSpan={2}>
              <BilingualLabel ja={S.name.ja} id={S.name.id1} id2={S.name.id2} />
            </td>
            <td><BilingualLabel ja={S.romaji.ja} id={S.romaji.id} /></td>
            <td className="val">{data.romajiName.toUpperCase()}</td>
            <td><BilingualLabel ja={S.gender.ja} id={S.gender.id} /></td>
            <td className="gender-box">
              <div className="jp">{formatGenderJa(data.gender)}</div>
              <div className="id">{S.gender.idOptions}</div>
            </td>
          </tr>

          {/* ① + ③ */}
          <tr>
            <td><BilingualLabel ja={S.kanji.ja} id={S.kanji.id} /></td>
            <td className="val jp-val">{data.kanjiName}</td>
            <td><BilingualLabel ja={S.birth.ja} id={S.birth.id} /></td>
            <td className="val jp-val">{formatBirthDate(data.birthDate, data.age)}</td>
          </tr>

          {/* ④ + ⑤ */}
          <tr>
            <td>
              <BilingualLabel ja={S.nationality.ja} id={S.nationality.id1} id2={S.nationality.id2} />
            </td>
            <td colSpan={2} className="val">{data.nationality}</td>
            <td><BilingualLabel ja={S.motherTongue.ja} id={S.motherTongue.id} /></td>
            <td className="mother-tongue-val">
              <div className="jp mother-tongue-ja">{data.motherTongueJa}</div>
              <div className="id mother-tongue-id">{data.motherTongueId}</div>
            </td>
          </tr>

          {/* ⑥ */}
          <tr>
            <td><BilingualLabel ja={S.address.ja} id={S.address.id} /></td>
            <td colSpan={4} className="val">{data.address.toUpperCase()}</td>
          </tr>

          {/* ⑦ */}
          <tr>
            <td className="section-lbl">
              <BilingualLabel ja={S.education.ja} id={S.education.id} />
            </td>
            <td colSpan={4} className="cell-inner">
              <table className="inner-table">
                <colgroup>
                  <col className="period-col" />
                  <col className="school-col" />
                </colgroup>
                <thead>
                  <tr>
                    <th className="jp">期間 Jangka Waktu</th>
                    <th className="jp">学校名 Nama Sekolah</th>
                  </tr>
                </thead>
                <tbody>
                  {eduRows.map((edu, i) => (
                    <tr key={i}>
                      <td className="val jp-val val-center">
                        {edu ? formatPeriod(edu.startDate, edu.endDate) : ''}
                      </td>
                      <td className="val">{edu?.schoolName ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>

          {/* ⑧ */}
          <tr>
            <td className="section-lbl">
              <BilingualLabel ja={S.work.ja} id={S.work.id} />
            </td>
            <td colSpan={4} className="cell-inner">
              <table className="inner-table">
                <colgroup>
                  <col className="period-col" />
                  <col className="school-col" />
                </colgroup>
                <thead>
                  <tr>
                    <th className="jp">期間 Jangka Waktu</th>
                    <th className="jp">就職先名（職種）Nama Perusahaan (Jenis Pekerjaan)</th>
                  </tr>
                </thead>
                <tbody>
                  {workRows.map((work, i) => (
                    <tr key={i}>
                      <td className="val jp-val val-center">
                        {work ? formatPeriod(work.startDate, work.endDate, work.isCurrent) : ''}
                      </td>
                      <td className="val">
                        {work ? formatWorkCompany(work.company, work.jobType) : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>

          {/* ⑨ */}
          <tr>
            <td className="skill-lbl">
              <div className="jp skill-lbl-ja">{S.relatedSkill.ja1}</div>
              <div className="jp skill-lbl-ja">{S.relatedSkill.ja2}</div>
              <div className="id skill-lbl-id">{S.relatedSkill.id1}</div>
              <div className="id skill-lbl-id">{S.relatedSkill.id2}</div>
              <div className="id skill-lbl-id">{S.relatedSkill.id3}</div>
              <div className="id skill-lbl-id">{S.relatedSkill.id4}</div>
            </td>
            <td colSpan={2} className="skill-val">
              <div className="jp">
                {data.relatedSkillJobJa}
                {months ? `　${months} ヶ月` : ''}
              </div>
              <div className="id-sm">
                {data.relatedSkillJobId}
                {months ? `　${months} Bulan` : ''}
              </div>
            </td>
            <td colSpan={2} className="skill-right">
              <div className="skill-right-row">
                <span className="jp">職</span>
                <span className="jp">年</span>
              </div>
              <div className="skill-right-row">
                <span className="id">Jenis pekerjaan</span>
                <span className="id">tahun</span>
              </div>
            </td>
          </tr>

          {/* ⑩ */}
          <tr>
            <td>
              <BilingualLabel ja={S.japanVisit.ja} id={S.japanVisit.id1} id2={S.japanVisit.id2} />
            </td>
            <td colSpan={4} className="visit-content">
              <div className="visit-line jp">{formatJapanVisitJa(data.japanVisitExperience)}</div>
              <div className="visit-line id">{S.japanVisit.adaId}</div>
              <div className="visit-line jp visit-sub">{S.japanVisit.constructionJa}</div>
              <div className="visit-line id visit-indent">{S.japanVisit.constructionId1}</div>
              <div className="visit-line id visit-indent">{S.japanVisit.constructionId2}</div>
              <div className="visit-line jp visit-indent">{S.japanVisit.return2Ja}</div>
              <div className="visit-line id visit-indent">{S.japanVisit.return2Id}</div>
              <div className="visit-line id-date visit-indent">{S.japanVisit.return2Date}</div>
              <div className="visit-line jp visit-indent">{S.japanVisit.returnConstJa}</div>
              <div className="visit-line id visit-indent">{S.japanVisit.returnConstId}</div>
              <div className="visit-line id-date visit-indent">{S.japanVisit.returnConstDate}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
