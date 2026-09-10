import { createApiFunction } from '@/lib/create-api-client';

export default function ApiFormDraft() {
  return {
    getCvDraft: createApiFunction('GET', 'form-draft/cv-draft'),
    saveCvDraft: createApiFunction('POST', 'form-draft/cv-draft'),
    getJishusei: createApiFunction('GET', 'form-draft/jishusei'),
    saveJishusei: createApiFunction('POST', 'form-draft/jishusei'),
    getImigrasi: createApiFunction('GET', 'form-draft/imigrasi-perusahaan'),
    saveImigrasi: createApiFunction('POST', 'form-draft/imigrasi-perusahaan'),
    getKkWorkspace: createApiFunction('GET', 'form-draft/kk-workspace'),
    saveKkWorkspace: createApiFunction('POST', 'form-draft/kk-workspace'),
    getSuratTanggungan: createApiFunction('GET', 'form-draft/surat-tanggungan'),
    saveSuratTanggungan: createApiFunction('POST', 'form-draft/surat-tanggungan'),
  };
}
